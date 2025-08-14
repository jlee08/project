// src/pages/QuizDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';
import confetti from 'canvas-confetti';

// 🔗 Firestore
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { finalizeQuiz, recordAnswer } from '../Quizzes';
import { db } from '../../config/firebase';

// 🔗 UI Components
import Icon from '../../components/UI/Icon';

// 🔗 진행도 저장 헬퍼 (Quizzes.tsx에서 export 했던 것 사용)
// 필요하면 utils/quizProgress.ts로 이동 권장

// ───────────────── Types (이 파일 전용 내부 표시용)
export interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}
export interface QuizData {
  id: string; // ← 문서 ID
  title: string;
  module: string; // 표시용(=title)
  questions: Question[];
  totalQuestions: number;
}

// Firestore에 저장된 Module 문서 형태(이전 정의와 맞춤)
type QuizType = 'MultipleChoice' | 'ShortAnswer';
interface MultipleChoiceQuizFS {
  type: 'MultipleChoice';
  question: string;
  choices: string[];
  answer: string | number; // 텍스트 or 인덱스
  explanation?: string;
}
interface ShortAnswerQuizFS {
  type: 'ShortAnswer';
  question: string;
  answer: string; // 텍스트
  explanation?: string;
}
type QuizItemFS = MultipleChoiceQuizFS | ShortAnswerQuizFS;

interface ModuleDocFS {
  title: string;
  quizzes: QuizItemFS[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt?: Timestamp;
}

// 답변 상태
export interface AnswerState {
  questionId: number;
  selectedAnswer: string | number | null;
  isCorrect: boolean | null;
  isSubmitted: boolean;
  aiExplanation?: string;
  isLoadingAI?: boolean;
}

const QuizDetail: React.FC = () => {
  const { id: moduleId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTypingAnimation, setShowTypingAnimation] = useState<{ [key: number]: boolean }>({});

  // OpenAI API 호출 함수
  const generateAIExplanation = async (
    question: string,
    userAnswer: string | number,
    correctAnswer: string | number,
    isCorrect: boolean,
    options?: string[]
  ): Promise<string> => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    if (!apiKey) {
      return 'AI explanation requires an OpenAI API key. Please contact your administrator.';
    }

    // API 키 형식 검증
    if (!apiKey.startsWith('sk-')) {
      return 'Invalid OpenAI API key format.';
    }

    try {
      let userAnswerText = '';
      let correctAnswerText = '';

      if (options) {
        // 객관식인 경우
        userAnswerText = typeof userAnswer === 'number' ? (options[userAnswer] || 'Invalid selection') : String(userAnswer);
        correctAnswerText = typeof correctAnswer === 'number' ? (options[correctAnswer] || 'Invalid answer') : String(correctAnswer);
      } else {
        // 주관식인 경우
        userAnswerText = String(userAnswer);
        correctAnswerText = String(correctAnswer);
      }

      const prompt = `
As an expert educator in astronomy and space science, provide a detailed but concise explanation for this quiz question.

Question: ${question}
User Answer: ${userAnswerText}
Correct Answer: ${correctAnswerText}
Result: ${isCorrect ? 'Correct' : 'Incorrect'}

Please include the following in your explanation:
1. A simple explanation of why the correct answer is right
2. If the user was wrong, explain why their answer was incorrect
3. Additional educational context or interesting facts related to this topic
4. Write in 2-3 paragraphs, concise and educational

Please write in clear, accessible English suitable for space science learners.
`;

      console.log('OpenAI API 호출 시작...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educator in astronomy and space science who provides clear and engaging explanations in English.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      console.log('OpenAI API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API 에러 응답:', errorText);
        
        if (response.status === 429) {
          return 'AI service is temporarily unavailable due to high usage. Please try again in a moment.';
        } else if (response.status === 401) {
          return 'Invalid OpenAI API key. Please contact your administrator.';
        } else if (response.status === 403) {
          return 'Access denied to OpenAI API. Please check your API key.';
        } else {
          return `An error occurred while generating AI explanation (Error code: ${response.status}). Please try again later.`;
        }
      }

      const data = await response.json();
      console.log('OpenAI API 응답 성공');
      
      return data.choices[0]?.message?.content || 'Unable to generate AI explanation.';
    } catch (error) {
      console.error('AI 설명 생성 중 오류:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return 'Please check your network connection.';
      }
      
      return 'An unexpected error occurred while generating AI explanation. Please try again later.';
    }
  };

  // Firestore → 내부 표시용으로 매핑
  function mapModuleToQuizData(docId: string, data: ModuleDocFS): QuizData {
    const questions: Question[] = (data.quizzes ?? []).map((q, idx) => {
      if (q.type === 'MultipleChoice') {
        // 정답이 텍스트면 choices에서 인덱스 찾기
        let correct: number | string = q.answer;
        if (typeof correct === 'string') {
          const found = q.choices?.findIndex(c => c === correct);
          correct = (found ?? -1) >= 0 ? found! : correct; // 없으면 텍스트 그대로
        }
        return {
          id: idx + 1,
          question: q.question,
          type: 'multiple-choice',
          options: q.choices ?? [],
          correctAnswer: correct, // 숫자(인덱스) 우선, 불가하면 텍스트
          explanation: q.explanation ?? '',
        };
      } else {
        return {
          id: idx + 1,
          question: q.question,
          type: 'text',
          correctAnswer: q.answer,
          explanation: q.explanation ?? '',
        };
      }
    });

    return {
      id: docId,
      title: data.title ?? docId,
      module: data.title ?? docId,
      questions,
      totalQuestions: questions.length,
    };
  }

  // 모듈 로드 (moduleId 변경 시 리셋)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!moduleId) return;
      setIsLoading(true);
      setQuizData(null);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTextAnswer('');

      try {
        const ref = doc(db, 'modules', moduleId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (alive) {
            setQuizData({
              id: moduleId,
              title: moduleId,
              module: moduleId,
              questions: [],
              totalQuestions: 0,
            });
          }
          return;
        }
        const data = snap.data() as ModuleDocFS;
        const mapped = mapModuleToQuizData(snap.id, data);

        if (alive) {
          setQuizData(mapped);
          setAnswers(
            mapped.questions.map(q => ({
              questionId: q.id,
              selectedAnswer: null,
              isCorrect: null,
              isSubmitted: false,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [moduleId]);

  // Back to Modules
  const handleBackToModules = () => {
    Swal.fire({
      title: 'Exit Quiz?',
      html: `
        <p style="margin-bottom: 16px;">You are in the middle of taking this quiz. If you leave now, your progress will be lost and you'll need to start over from the beginning.</p>
        <p><strong>Are you sure you want to exit and reset your quiz progress?</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF1616',
      cancelButtonColor: '#ffffff',
      confirmButtonText: 'Yes, Exit and Reset',
      cancelButtonText: 'Continue Quiz',
      reverseButtons: true,
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'swal-custom-confirm',
        cancelButton: 'swal-custom-cancel',
      },
    }).then(result => {
      if (result.isConfirmed) navigate('/quizzes');
    });
  };

  // 선택형
  const handleAnswerSelect = (optionIndex: number) => {
    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer?.isSubmitted) return;

    const next = [...answers];
    next[currentQuestionIndex] = {
      ...next[currentQuestionIndex],
      selectedAnswer: optionIndex,
    };
    setAnswers(next);
  };

  // 주관식
  const handleTextAnswerChange = (value: string) => {
    setTextAnswer(value);
    const next = [...answers];
    next[currentQuestionIndex] = {
      ...next[currentQuestionIndex],
      selectedAnswer: value,
    };
    setAnswers(next);
  };

  // GPT를 사용한 주관식 답안 채점
  const gradeSubjectiveAnswer = async (
    question: string,
    userAnswer: string,
    correctAnswer: string
  ): Promise<boolean> => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    if (!apiKey || !apiKey.startsWith('sk-')) {
      // API 키가 없으면 엄격한 기본 채점 방식 사용
      console.warn('OpenAI API 키 없음. 엄격한 기본 채점 방식 사용');
      const userAns = userAnswer.toLowerCase().trim();
      const correct = correctAnswer.toLowerCase().trim();
      
      // "I don't know" 등의 무지 표현은 무조건 오답
      const ignorancePatterns = [
        'i don\'t know', 'i dont know', 'don\'t know', 'dont know',
        'no idea', 'not sure', 'idk', 'dunno', 'unknown',
        '모르겠다', '모름', '몰라', '잘 모르겠어'
      ];
      
      if (ignorancePatterns.some(pattern => userAns.includes(pattern))) {
        console.log('무지 표현 감지, 오답 처리:', userAns);
        return false;
      }
      
      // 정확한 매칭만 정답으로 처리
      return userAns === correct;
    }

    try {
      const prompt = `
You are a strict astronomy/space science teacher grading a quiz answer.

Question: ${question}
Expected Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

STRICT GRADING RULES:
1. Answer is CORRECT only if it demonstrates actual knowledge of the concept
2. Answer is INCORRECT if it's:
   - "I don't know" or similar phrases indicating lack of knowledge
   - Completely unrelated to the topic
   - Wrong scientific information
   - Vague or meaningless responses
3. Answer is CORRECT only if it contains the core scientific concept, even if worded differently
4. Partial credit is given only for answers that show genuine understanding

Respond with EXACTLY one word: "CORRECT" or "INCORRECT"
Do not provide any explanation or additional text.
`;

      console.log('GPT 채점 시작...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a strict academic grader for astronomy and space science. You must respond with only "CORRECT" or "INCORRECT" - no other text. Be strict: "I don\'t know" and similar non-answers are always INCORRECT.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        console.error('GPT 채점 API 오류:', response.status);
        // API 실패 시 엄격한 기본 방식으로 fallback
        const userAns = userAnswer.toLowerCase().trim();
        const correct = correctAnswer.toLowerCase().trim();
        
        // "I don't know" 등의 무지 표현은 무조건 오답
        const ignorancePatterns = [
          'i don\'t know', 'i dont know', 'don\'t know', 'dont know',
          'no idea', 'not sure', 'idk', 'dunno', 'unknown',
          '모르겠다', '모름', '몰라', '잘 모르겠어'
        ];
        
        if (ignorancePatterns.some(pattern => userAns.includes(pattern))) {
          console.log('무지 표현 감지, 오답 처리:', userAns);
          return false;
        }
        
        // 정확한 매칭만 정답으로 처리
        return userAns === correct;
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim().toUpperCase();
      
      console.log('GPT 채점 원본 응답:', data.choices[0]?.message?.content);
      console.log('GPT 채점 처리된 결과:', result);
      
      // CORRECT만 정답으로 인정, 나머지는 모두 오답
      const isCorrect = result === 'CORRECT';
      console.log('최종 채점 결과:', isCorrect ? '정답' : '오답');
      
      return isCorrect;
    } catch (error) {
      console.error('GPT 채점 중 오류:', error);
      // 오류 시 엄격한 기본 방식으로 fallback
      const userAns = userAnswer.toLowerCase().trim();
      const correct = correctAnswer.toLowerCase().trim();
      
      // "I don't know" 등의 무지 표현은 무조건 오답
      const ignorancePatterns = [
        'i don\'t know', 'i dont know', 'don\'t know', 'dont know',
        'no idea', 'not sure', 'idk', 'dunno', 'unknown',
        '모르겠다', '모름', '몰라', '잘 모르겠어'
      ];
      
      if (ignorancePatterns.some(pattern => userAns.includes(pattern))) {
        console.log('무지 표현 감지, 오답 처리:', userAns);
        return false;
      }
      
      // 정확한 매칭만 정답으로 처리
      return userAns === correct;
    }
  };

  // 제출(한 문제) → 정오판정 + 진행도 누적(recordAnswer) + AI Explanation 생성
  const handleSubmitAnswer = async () => {
    if (!quizData) return;
    const q = quizData.questions[currentQuestionIndex];
    const a = answers[currentQuestionIndex];
    if (!q || !a || a.selectedAnswer === null) return;

    let isCorrect = false;
    if (q.type === 'multiple-choice') {
      // 정답이 인덱스면 숫자 비교, 텍스트면 텍스트 비교
      if (typeof q.correctAnswer === 'number') {
        isCorrect = a.selectedAnswer === q.correctAnswer;
      } else {
        const chosen =
          typeof a.selectedAnswer === 'number'
            ? (q.options?.[a.selectedAnswer] ?? '')
            : String(a.selectedAnswer);
        isCorrect = String(q.correctAnswer).trim() === String(chosen).trim();
      }
    } else {
      // 주관식: GPT를 사용한 스마트 채점
      try {
        console.log('주관식 답안 GPT 채점 시작...');
        isCorrect = await gradeSubjectiveAnswer(
          q.question,
          String(a.selectedAnswer),
          String(q.correctAnswer)
        );
        console.log('주관식 채점 완료:', isCorrect);
      } catch (error) {
        console.error('주관식 채점 중 오류:', error);
        // 오류 시 기본 방식으로 fallback
        const userAns = String(a.selectedAnswer).toLowerCase().trim();
        const correct = String(q.correctAnswer).toLowerCase().trim();
        isCorrect =
          userAns === correct ||
          userAns.includes(correct.split(' ')[0]) ||
          correct.includes(userAns.split(' ')[0]);
      }
    }

    // 먼저 답변 상태 업데이트 (AI 로딩 상태 포함)
    const next = [...answers];
    next[currentQuestionIndex] = {
      ...next[currentQuestionIndex],
      isCorrect,
      isSubmitted: true,
      isLoadingAI: true,
    };
    setAnswers(next);

    // 누적 진행도 반영 (유저 로그인 상태면 저장)
    if (moduleId) {
      try {
        await recordAnswer(moduleId, isCorrect);
      } catch (e) {
        console.warn('recordAnswer failed:', e);
      }
    }

    // AI Explanation 생성 (비동기)
    try {
      const aiExplanation = await generateAIExplanation(
        q.question,
        a.selectedAnswer,
        q.correctAnswer,
        isCorrect,
        q.options
      );

      // AI 설명 추가
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = {
        ...updatedAnswers[currentQuestionIndex],
        isCorrect,
        isSubmitted: true,
        aiExplanation,
        isLoadingAI: false,
      };
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error('Failed to generate AI explanation:', error);
      // AI 실패 시에도 로딩 상태 해제
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = {
        ...updatedAnswers[currentQuestionIndex],
        isCorrect,
        isSubmitted: true,
        aiExplanation: 'AI explanation could not be generated.',
        isLoadingAI: false,
      };
      setAnswers(updatedAnswers);
    }
  };

  // 폭죽 애니메이션 함수
  const fireConfetti = (score: number) => {
    // 점수에 따라 다른 폭죽 효과
    if (score >= 90) {
      // 완벽한 점수: 골드 폭죽
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
      
      // 연속 폭죽
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500']
        });
      }, 250);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500']
        });
      }, 400);
      
    } else if (score >= 70) {
      // 좋은 점수: 실버 폭죽
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C0C0C0', '#87CEEB', '#98FB98']
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.5 },
          colors: ['#C0C0C0', '#87CEEB']
        });
      }, 300);
      
    } else {
      // 통과 점수: 기본 폭죽
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#9C88FF', '#FF88DC', '#88FFF7']
      });
    }
  };

  // 다음/완료
  const handleNextQuestion = async () => {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setTextAnswer('');
      return;
    }

    // Finish
    const correctCount = answers.filter(x => x.isCorrect).length;
    const totalQuestions = answers.length;
    const score = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

    // 최종 결과 저장
    if (moduleId) {
      try {
        await finalizeQuiz(moduleId, correctCount, totalQuestions);
      } catch (e) {
        console.warn('finalizeQuiz failed:', e);
      }
    }

    // 폭죽 애니메이션 실행!
    fireConfetti(score);

    // 조금 딜레이 후 결과 창 표시
    setTimeout(async () => {
      await Swal.fire({
        title: 'Quiz Completed! 🎉',
        html: `
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">
              ${score >= 90 ? '🏆' : score >= 70 ? '🎖️' : '👏'}
            </div>
            <p style="font-size: 18px; margin-bottom: 16px;">You scored <strong>${score}%</strong></p>
            <p>Correct answers: ${correctCount} out of ${totalQuestions}</p>
            <div style="margin-top: 16px; font-size: 14px; color: #666;">
              ${score >= 90 ? '🌟 Outstanding! Perfect score!' : 
                score >= 70 ? '✨ Great job! Well done!' : 
                '💪 Keep practicing, you\'re improving!'}
            </div>
          </div>
        `,
        icon: score >= 70 ? 'success' : 'info',
        confirmButtonText: 'Back to Quizzes',
        confirmButtonColor: '#1E1E1E',
        backdrop: `
          rgba(0, 0, 0, 0.8)
          url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='confetti' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3ccircle cx='10' cy='10' r='2' fill='%23FFD700' opacity='0.3'/%3e%3ccircle cx='30' cy='20' r='1.5' fill='%23FF6347' opacity='0.3'/%3e%3ccircle cx='20' cy='30' r='1' fill='%2387CEEB' opacity='0.3'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23confetti)'/%3e%3c/svg%3e")
          center
          repeat
        `
      });
    }, 1000); // 1초 후 결과 창 표시

    navigate('/quizzes');
  };

  // 타이핑 애니메이션 컴포넌트
  const AIExplanationTyping: React.FC<{ 
    text: string; 
    questionId: number;
    onComplete?: () => void;
  }> = ({ text, questionId, onComplete }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTypingComplete, setIsTypingComplete] = useState(false);


    useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 1); // 훨씬 빠른 타이핑 속도 (30ms → 2ms)

        return () => clearTimeout(timer);
      } else if (!isTypingComplete) {
        setIsTypingComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, [currentIndex, text, onComplete, isTypingComplete]);

    // 리셋 함수
    useEffect(() => {
      setDisplayText('');
      setCurrentIndex(0);
      setIsTypingComplete(false);
    }, [text]);

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">AI</span>
          </div>
          <span className="text-sm font-medium text-purple-700">AI Explanation</span>
        </div>
        
        <div className="text-gray-800 leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown>
            {displayText}
          </ReactMarkdown>
          {!isTypingComplete && (
            <span className="inline-block w-3 h-5 bg-purple-500 animate-pulse ml-1 rounded-sm"></span>
          )}
        </div>
        
        {isTypingComplete && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="flex items-center gap-2 text-xs text-purple-600">
              <span>✨</span>
              <span>Generated by AI • Powered by OpenAI</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const progress = useMemo(() => {
    if (!quizData) return 0;
    return ((currentQuestionIndex + 1) / Math.max(1, quizData.totalQuestions)) * 100;
  }, [quizData, currentQuestionIndex]);

  if (isLoading || !quizData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (quizData.totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">No quizzes in this module.</div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white relative">
      {/* BG */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/images/quizzes-detail-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-14">
            {/* Back */}
            <button
              onClick={handleBackToModules}
              className="flex items-center gap-2 px-4 py-3 bg-transparent text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Modules
            </button>

            {/* Info */}
            <div className="flex flex-col items-end gap-6">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{quizData.title}</h1>
                </div>
                <div className="bg-gray-200 px-3 py-1 rounded-lg">
                  <span className="text-sm font-semibold text-black">
                    Question {currentQuestionIndex + 1} of {quizData.totalQuestions}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full max-w-4xl h-4 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white backdrop-blur-md border border-black rounded-[36px] p-14">
            <div className="space-y-9">
              {/* Question */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black">{currentQuestion.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' ? (
                  currentQuestion.options?.map((option, index) => {
                    let buttonStyle = 'bg-white border border-gray-400 text-black hover:bg-gray-50';

                    if (currentAnswer?.isSubmitted) {
                      const isTrueIndex =
                        typeof currentQuestion.correctAnswer === 'number'
                          ? index === currentQuestion.correctAnswer
                          : option === String(currentQuestion.correctAnswer);

                      if (isTrueIndex) {
                        buttonStyle = 'bg-green-100 border border-green-500 text-black';
                      } else if (
                        index === currentAnswer.selectedAnswer &&
                        !currentAnswer.isCorrect
                      ) {
                        buttonStyle = 'bg-red-100 border border-red-500 text-black';
                      } else {
                        buttonStyle = 'bg-gray-200 border border-gray-400 text-black';
                      }
                    } else if (currentAnswer?.selectedAnswer === index) {
                      buttonStyle = 'bg-gray-400 border border-gray-400 text-black';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={currentAnswer?.isSubmitted}
                        className={`w-full p-6 rounded-xl text-left transition-colors flex items-center gap-4 ${buttonStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-transparent flex items-center justify-center">
                            <span className="text-lg font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                          </div>
                          <span className="text-lg font-semibold">{option}</span>
                        </div>

                        {currentAnswer?.isSubmitted && (
                          <div className="ml-auto">
                            {(() => {
                              const isTrueIndex =
                                typeof currentQuestion.correctAnswer === 'number'
                                  ? index === currentQuestion.correctAnswer
                                  : option === String(currentQuestion.correctAnswer);
                              if (isTrueIndex) {
                                return (
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                    <Icon name="quizCheck" size={48} className="w-12 h-12" />
                                  </div>
                                );
                              }
                              if (
                                index === currentAnswer.selectedAnswer &&
                                !currentAnswer.isCorrect
                              ) {
                                return (
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                    <Icon name="quizCancel" size={48} className="w-12 h-12" />
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={textAnswer}
                      onChange={e => handleTextAnswerChange(e.target.value)}
                      disabled={currentAnswer?.isSubmitted}
                      placeholder="Type your answer…"
                      className="w-full p-4 border border-gray-400 rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {currentAnswer?.isSubmitted && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-black mb-2">Your answer</h3>
                          <div
                            className={`p-4 rounded-lg border flex items-center gap-3 ${
                              currentAnswer.isCorrect
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                              {currentAnswer.isCorrect ? (
                                <Icon name="quizCheck" size={48} className="w-12 h-12" />
                              ) : (
                                <Icon name="quizCancel" size={48} className="w-12 h-12" />
                              )}
                            </div>
                            <span
                              className={`font-medium ${
                                currentAnswer.isCorrect ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              {currentAnswer.isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                          </div>
                        </div>

                        {!currentAnswer.isCorrect && (
                          <div className="bg-gray-400 border border-gray-400 rounded-xl p-4">
                            <h3 className="font-medium text-gray-700 mb-2">Correct Answer:</h3>
                            <p className="text-gray-700">{String(currentQuestion.correctAnswer)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation */}
              {currentAnswer?.isSubmitted && (
                <div className="space-y-4">

                  {/* AI 설명 */}
                  <div className="bg-purple-50 border border-purple-400 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h3 className="font-bold text-purple-700">AI Explanation</h3>
                      </div>
                      
                      {/* 재시도 버튼 (에러 발생 시에만 표시) */}
                      {!currentAnswer.isLoadingAI && 
                       currentAnswer.aiExplanation && 
                       (currentAnswer.aiExplanation.includes('🤖') || 
                        currentAnswer.aiExplanation.includes('❌') || 
                        currentAnswer.aiExplanation.includes('⚠️') ||
                        currentAnswer.aiExplanation.includes('사용량이 많아') ||
                        currentAnswer.aiExplanation.includes('API 키')) && (
                        <button
                          onClick={async () => {
                            const updatedAnswers = [...answers];
                            updatedAnswers[currentQuestionIndex] = {
                              ...updatedAnswers[currentQuestionIndex],
                              isLoadingAI: true,
                              aiExplanation: undefined,
                            };
                            setAnswers(updatedAnswers);

                            try {
                              const aiExplanation = await generateAIExplanation(
                                currentQuestion.question,
                                currentAnswer.selectedAnswer!,
                                currentQuestion.correctAnswer,
                                currentAnswer.isCorrect!,
                                currentQuestion.options
                              );

                              const finalAnswers = [...answers];
                              finalAnswers[currentQuestionIndex] = {
                                ...finalAnswers[currentQuestionIndex],
                                aiExplanation,
                                isLoadingAI: false,
                              };
                              setAnswers(finalAnswers);
                            } catch (error) {
                              const finalAnswers = [...answers];
                              finalAnswers[currentQuestionIndex] = {
                                ...finalAnswers[currentQuestionIndex],
                                aiExplanation: 'Failed to retry AI explanation.',
                                isLoadingAI: false,
                              };
                              setAnswers(finalAnswers);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                        <span>🔄 Retry</span>
                        </button>
                      )}
                    </div>
                    
                    {currentAnswer.isLoadingAI ? (
                      <div className="flex items-center gap-3 text-purple-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        <span>AI is generating a detailed explanation...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentAnswer.aiExplanation && 
                         !currentAnswer.aiExplanation.includes('API key') && 
                         !currentAnswer.aiExplanation.includes('temporarily unavailable') &&
                         !currentAnswer.aiExplanation.includes('Unable to load') &&
                         !currentAnswer.aiExplanation.includes('Failed to retry') ? (
                          <AIExplanationTyping 
                            text={currentAnswer.aiExplanation}
                            questionId={currentQuestionIndex}
                            onComplete={() => {
                              // 타이핑 완료 후 처리할 로직 (필요 시)
                            }}
                          />
                        ) : (
                          <div className="text-purple-700 whitespace-pre-wrap">
                            {currentAnswer.aiExplanation || 'Unable to load AI explanation.'}
                          </div>
                        )}
                        
                        {/* 상황별 안내 메시지 */}
                        {currentAnswer.aiExplanation && (
                          <>
                            {currentAnswer.aiExplanation.includes('API key') && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  💡 <strong>Administrator Notice:</strong> OpenAI API key configuration is required.
                                </p>
                              </div>
                            )}
                            
                            {currentAnswer.aiExplanation.includes('temporarily unavailable') && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  💡 <strong>Notice:</strong> This is a temporary issue due to OpenAI API usage limits. 
                                  Please try the retry button after a moment.
                                </p>
                              </div>
                            )}
                            
                            {(currentAnswer.aiExplanation.includes('error') || currentAnswer.aiExplanation.includes('Unable')) && 
                             !currentAnswer.aiExplanation.includes('temporarily unavailable') && 
                             !currentAnswer.aiExplanation.includes('API key') && (
                              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-orange-800">
                                  💡 <strong>Tip:</strong> This might be a network or server issue. Please try the retry button.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>


                  {/* 기본 설명 */}
                  <div className="bg-blue-50 border border-blue-400 rounded-xl p-6">
                    <h3 className="font-bold text-blue-700 mb-2">Explanation</h3>
                    <p className="text-blue-700">{currentQuestion.explanation}</p>
                  </div>

                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end">
                {!currentAnswer?.isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={
                      currentAnswer?.selectedAnswer === null || currentAnswer?.selectedAnswer === ''
                    }
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentAnswer?.isLoadingAI}
                    className="bg-black border border-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {currentAnswer?.isLoadingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating AI explanation...</span>
                      </>
                    ) : (
                      <>
                        {currentQuestionIndex < quizData.questions.length - 1
                          ? 'Next Question'
                          : 'Finish Quiz'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SweetAlert2 custom styles */}
      <style>{`
        .swal-custom-popup { border-radius: 36px !important; padding: 2rem !important; }
        .swal-custom-confirm { background-color: #FF1616 !important; border: none !important; border-radius: 8px !important; padding: 8px 16px !important; font-weight: 500 !important; }
        .swal-custom-cancel { background-color: white !important; color: black !important; border: 1px solid #BDBDBD !important; border-radius: 8px !important; padding: 8px 16px !important; font-weight: 500 !important; }
        .swal-custom-cancel:hover { background-color: #f5f5f5 !important; }
      `}</style>
    </div>
  );
};

export default QuizDetail;

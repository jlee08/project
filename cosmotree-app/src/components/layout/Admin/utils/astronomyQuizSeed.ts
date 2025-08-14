// src/components/admin/utils/astronomyQuizSeed.ts
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { getQuizByModuleId, quizzes } from './quizData';

// 네가 가진 in-memory 퀴즈 데이터 & 타입들 import
// quizzes: Quiz[] 와 getQuizByModuleId(moduleId) 가 있다고 가정

// ====== 네가 제공한 타입 ======
export type Question = MultipleChoiceQuestion | SubjectiveQuestion;

export type Quiz = {
  moduleId: string;
  title: string;
  questions: Question[];
};

export type QuizAnswer = {
  questionId: string;
  answer: number | string; // 객관식: index, 주관식: 텍스트
};

export type QuizResult = {
  moduleId: string;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
};

// (추정) 질문 세부 타입 — 네 데이터 예시에 맞춰서 타이핑
type MultipleChoiceQuestion = {
  id: string;
  type: 'multiple-choice' | 'MultipleChoice';
  question: string;
  options?: string[]; // 예시 데이터에서 사용
  choices?: string[]; // 혹시 다른 키로 들어온 경우도 지원
  correctAnswer?: number; // index 기반 정답
  explanation?: string;
};

type SubjectiveQuestion = {
  id: string;
  type: 'subjective' | 'ShortAnswer';
  question: string;
  sampleAnswer?: string; // 예시 데이터에서 사용
  answer?: string; // 혹시 이미 answer로 들어온 경우도 지원
  explanation?: string;
};

// ====== Firestore에 저장할 포맷 ======
export type FSQuizQuestion = {
  type: 'MultipleChoice' | 'ShortAnswer';
  question: string;
  choices?: string[]; // 객관식만
  answer: string; // 객관식: 정답 텍스트, 주관식: 모범답안 텍스트
  explanation?: string;
};

// type guard
function isMC(q: Question): q is MultipleChoiceQuestion {
  // 소문자/대문자 둘 다 허용
  // @ts-ignore
  return q?.type === 'multiple-choice' || q?.type === 'MultipleChoice';
}
function isSA(q: Question): q is SubjectiveQuestion {
  // @ts-ignore
  return q?.type === 'subjective' || q?.type === 'ShortAnswer';
}

// MC/SA → Firestore 포맷으로 정규화
function normalizeQuestion(q: Question): FSQuizQuestion | null {
  if (isMC(q)) {
    const choices = q.options ?? q.choices ?? [];
    let answerText = '';

    if (typeof q.correctAnswer === 'number' && choices[q.correctAnswer] != null) {
      answerText = choices[q.correctAnswer];
    } else if (typeof (q as any).answer === 'string') {
      // 혹시 이미 정답 텍스트가 들어온 경우
      answerText = (q as any).answer;
    } else {
      // 정답을 알 수 없는 경우 스킵
      return null;
    }

    return {
      type: 'MultipleChoice',
      question: q.question,
      choices,
      answer: answerText,
      explanation: q.explanation,
    };
  }

  if (isSA(q)) {
    const answerText = q.sampleAnswer ?? (q as any).answer ?? '';
    return {
      type: 'ShortAnswer',
      question: q.question,
      answer: answerText,
      explanation: q.explanation,
    };
  }

  return null;
}

function normalizeQuiz(quiz: Quiz): FSQuizQuestion[] {
  const out: FSQuizQuestion[] = [];
  for (const q of quiz.questions) {
    const n = normalizeQuestion(q);
    if (n) out.push(n);
  }
  return out;
}

type SeedCtx = { onLog?: (m: string) => void };

// 모든 모듈 문서를 스캔 → moduleId 매칭되는 퀴즈를 찾아 quizzes 필드로 업데이트
export async function seedAllQuizzes(ctx: SeedCtx = {}) {
  const log = ctx.onLog ?? (() => {});
  const modulesSnap = await getDocs(collection(db, 'modules'));

  let modulesQuizUpdated = 0;
  let questionsSeeded = 0;

  const batch = writeBatch(db);

  modulesSnap.forEach(docSnap => {
    const modId = docSnap.id;
    const quiz = getQuizByModuleId(modId) || quizzes.find(q => q.moduleId === modId);
    if (!quiz) {
      log(`No quiz for module: ${modId} — skipped`);
      return;
    }

    const fsQuestions = normalizeQuiz(quiz);
    if (!fsQuestions.length) {
      log(`Quiz has no valid questions: ${modId} — skipped`);
      return;
    }

    batch.update(doc(db, 'modules', modId), {
      quizzes: fsQuestions,
      quizTitle: quiz.title, // 필요 없으면 제거 가능
    });

    modulesQuizUpdated += 1;
    questionsSeeded += fsQuestions.length;
    log(`Attached ${fsQuestions.length} quiz questions → ${modId}`);
  });

  if (modulesQuizUpdated > 0) {
    await batch.commit();
  }
  log(
    `Quizzes seeding done. modulesQuizUpdated=${modulesQuizUpdated}, questionsSeeded=${questionsSeeded}`
  );

  return { modulesQuizUpdated, questionsSeeded };
}

// 모든 모듈의 quizzes만 비우고 싶을 때
export async function clearAllQuizzes(onLog?: (m: string) => void) {
  const log = onLog ?? (() => {});
  const modulesSnap = await getDocs(collection(db, 'modules'));
  const batch = writeBatch(db);

  let touched = 0;
  modulesSnap.forEach(d => {
    batch.update(doc(db, 'modules', d.id), { quizzes: [] });
    touched++;
  });

  if (touched) await batch.commit();
  log(`Cleared quizzes in ${touched} modules.`);
  return { touched };
}

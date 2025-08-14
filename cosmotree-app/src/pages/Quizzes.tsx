// src/pages/Quizzes.tsx
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/UI/Icon';
import './Quizzes.css';

// Firebase (v9 modular)
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ───────────────────────── Types
type QuizType = 'MultipleChoice' | 'ShortAnswer';

interface MultipleChoiceQuiz {
  type: 'MultipleChoice';
  question: string;
  choices: string[];
  answer: string;
  explanation?: string;
}
interface ShortAnswerQuiz {
  type: 'ShortAnswer';
  question: string;
  answer: string;
  explanation?: string;
}
type QuizItem = MultipleChoiceQuiz | ShortAnswerQuiz;

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface ModuleDoc {
  title: string;
  quizzes: QuizItem[];
  difficulty?: Difficulty;
  createdAt?: Timestamp;
}

interface ModuleCardData {
  id: string; // module doc id
  title: string;
  questions: number;
  icon: string;
  difficulty: Difficulty; // for sorting
  createdAt?: Timestamp; // for sorting
  score?: number; // 0~100
  status?: 'completed' | 'available';
}

// 난이도 정렬 우선순위
const DIFF_RANK: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

// 진행도 문서(유저별)  // CHANGED: completed, scorePercent 포함
interface QuizResultDoc {
  correctCount?: number;
  totalAnswered?: number;
  scorePercent?: number; // 0~100
  completed?: boolean; // Finish 시 true
  lastUpdated?: Timestamp;
}

// ───────────────────────── 진행도 저장 헬퍼 (답안 시도 시)
// 정답/오답 시도할 때마다 호출(선택). 누적 카운터만 올림.
export async function recordAnswer(moduleId: string, isCorrect: boolean) {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, 'users', user.uid, 'quizResults', moduleId);
  await setDoc(
    ref,
    {
      correctCount: increment(isCorrect ? 1 : 0),
      totalAnswered: increment(1),
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}

// ───────────────────────── 퀴즈 종료 저장 헬퍼 (Finish 버튼에서 호출)  // NEW
// Finish 시 최종 결과를 확정 저장. scorePercent와 completed를 함께 기록.
export async function finalizeQuiz(moduleId: string, correctCount: number, totalAnswered: number) {
  const user = auth.currentUser;
  if (!user) return;

  const safeTotal = Math.max(1, totalAnswered);
  const percent = Math.round((correctCount / safeTotal) * 100);

  const ref = doc(db, 'users', user.uid, 'quizResults', moduleId);
  await setDoc(
    ref,
    {
      correctCount,
      totalAnswered,
      scorePercent: percent,
      completed: percent >= 100, // 100%면 완료
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}

// ───────────────────────── 카드
const QuizCard: React.FC<{ quiz: ModuleCardData; index: number }> = ({ quiz, index }) => {
  const isCompleted = quiz.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white border border-gray-300 rounded-[20px] p-4 md:p-6 quiz-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex justify-between items-center gap-2 mb-4 w-full">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Icon name="neurology" size={24} />
          </div>
          {/* difficulty 태그는 비노출(정렬만 사용) */}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-1">{quiz.title}</h3>
        <p className="text-sm text-black">
          {quiz.id} | {quiz.questions} questions
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex justify-between items-center py-5 gap-4 w-full">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Icon name="stars2" size={18} />
            </div>
            <span className="text-sm text-black">Score</span>
          </div>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm font-semibold text-black">
            {typeof quiz.score === 'number' ? `${quiz.score}%` : '-'}
          </span>
        </div>

        {isCompleted ? (
          <Link
            to={`/quiz/${quiz.id}`}
            className="w-full bg-transparent border-2 border-black text-black py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors hover:bg-black hover:text-white"
          >
            Retake Quiz
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                fill="currentColor"
              />
            </svg>
          </Link>
        ) : (
          <Link
            to={`/quiz/${quiz.id}`}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-800"
          >
            Start Quiz
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                fill="currentColor"
              />
            </svg>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// ───────────────────────── 메인
const Quizzes: React.FC = () => {
  const [modules, setModules] = useState<ModuleCardData[]>([]);
  const [progress, setProgress] = useState<Record<string, QuizResultDoc & { moduleId: string }>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  // modules 1회 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'modules'));
        const base = snap.docs.map(d => {
          const data = d.data() as Partial<ModuleDoc>;
          const difficulty: Difficulty = (data.difficulty as Difficulty) ?? 'Beginner';
          const createdAt = data.createdAt;
          const quizzesArr = Array.isArray(data.quizzes) ? (data.quizzes as QuizItem[]) : [];

          const item: ModuleCardData = {
            id: d.id,
            title: data.title ?? d.id,
            questions: quizzesArr.length,
            icon: 'neurology',
            difficulty,
            createdAt,
            score: undefined,
            status: 'available',
          };
          return item;
        });
        if (alive) setModules(base);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // user progress 실시간 구독(로그인 상태에서만)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qRef = collection(db, 'users', user.uid, 'quizResults');
    const unsub = onSnapshot(qRef, snap => {
      const map: Record<string, QuizResultDoc & { moduleId: string }> = {};
      snap.forEach(d => {
        const data = d.data() as Omit<QuizResultDoc, 'moduleId'>;
        // 스프레드 먼저, 마지막에 moduleId를 붙여 중복 덮어쓰기 경고 제거
        map[d.id] = { ...data, moduleId: d.id };
      });
      setProgress(map);
    });
    return () => unsub();
  }, []);

  // 진행도 합치고 정렬
  const mergedSorted = useMemo(() => {
    const withScores = modules.map(m => {
      const p = progress[m.id];

      // score 계산 우선순위: scorePercent(저장값) → correct/total
      let score: number | undefined;
      if (p?.scorePercent != null) {
        score = Math.max(0, Math.min(100, Math.round(p.scorePercent)));
      } else if (p?.totalAnswered && p.totalAnswered > 0) {
        const correct = p.correctCount ?? 0;
        score = Math.round((correct / p.totalAnswered) * 100);
      }

      // 완료 판단: completed 저장값 또는 score === 100
      const status: ModuleCardData['status'] =
        p?.completed || score === 100 ? 'completed' : 'available';

      return { ...m, score, status };
    });

    // 1) 난이도 오름차순 → 2) createdAt 내림차순(최신 먼저)
    return withScores.sort((a, b) => {
      const dr = (DIFF_RANK[a.difficulty] ?? 99) - (DIFF_RANK[b.difficulty] ?? 99);
      if (dr !== 0) return dr;

      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return bt - at;
    });
  }, [modules, progress]);

  return (
    <div
      className="min-h-screen quizzes-page relative"
      style={{ paddingTop: '120px', backgroundImage: 'url(/images/quizzes-bg.png)' }}
    >
      <div className="relative z-10 pb-12 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-start mb-12 md:mb-16 px-4 pt-4 md:pt-8"
        >
          <div className="max-w-7xl px-4 md:px-5 mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Quizzes</h1>
            <p className="text-lg md:text-xl text-white">
              Test your knowledge with module-based quizzes and get instant feedback
            </p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-white/90">Loading quizzes…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {mergedSorted.map((quiz, index) => (
                <QuizCard key={quiz.id} quiz={quiz} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;

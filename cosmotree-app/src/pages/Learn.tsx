// src/pages/Learn.tsx
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/UI/Icon';
import { collection, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import './Learn.css';

// ===== Types from Firestore =====
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

type Lesson = {
  title: string;
  content: string;
};

type ModuleDoc = {
  id: string;
  title: string; // e.g. "Introduction to Astronomy"
  subtitle?: string; // e.g. "Basic concepts and history of astronomy"
  difficulty: Difficulty;
  imageUrl?: string;
  lessons: Lesson[];
  createdAt?: any; // Timestamp
};

// 각 모듈별 유저 진행도 (가정): users/{uid}/moduleProgress/{moduleId} -> { lastCompletedLesson: number }
type UserModuleProgress = {
  lastCompletedLesson: number; // 0-based index, e.g. 2 means lesson #3 completed
};

// ===== Card Props =====
interface LearningModuleProps {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  progress: number; // 0~100
  status: 'available' | 'locked' | 'completed';
  planetColor: string;
  img: string;
}

const getDifficultyColor = (level: Difficulty) => {
  // Keep neutral for now (you can switch to colored pills later)
  return 'bg-gray-100 text-gray-800';
};

const LearningModule: React.FC<LearningModuleProps> = ({
  id,
  title,
  description,
  difficulty,
  progress,
  status,
  planetColor,
  img,
}) => {
  const getButtonText = () => {
    if (status === 'completed') return 'Review';
    if (status === 'locked') return 'Complete previous module';
    return progress > 0 ? 'Continue Learning' : 'Start Learning';
  };

  const getButtonColor = () => {
    if (status === 'locked') return 'bg-gray-500 cursor-not-allowed';
    return 'bg-black hover:bg-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-3xl border border-gray-300 p-6 relative h-full flex flex-col ${
        status === 'locked' ? 'opacity-60' : ''
      }`}
      style={{
        boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.15)',
        minHeight: '480px',
      }}
    >
      
      {status === 'locked' && <div className="absolute inset-0 bg-white/75 rounded-3xl z-10" />}

      {/* 상단 콘텐츠 */}
      <div className="space-y-7">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center justify-between gap-3 w-full">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center p-2"
                style={{ backgroundColor: planetColor }}
              >
                <Icon name="planet" size={24} />
              </div>
              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${getDifficultyColor(difficulty)}`}
              >
                {difficulty}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <img src={img} alt="Module" className="w-full h-32 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-bold text-black line-clamp-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{description}</p>
          </div>
        </div>
      </div>

      {/* 하단(Progress + 버튼) → 카드 바닥으로 */}
      <div className="space-y-4 mt-auto">
        <div className="flex justify-end">
          <span className="text-gray-700 font-medium">{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gray-800 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>

        {/* Action */}
        {status !== 'locked' ? (
          <Link
            to={`/learn/${id}`}
            className={`w-full ${getButtonColor()} text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors`}
          >
            {getButtonText()}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                fill="currentColor"
              />
            </svg>
          </Link>
        ) : (
          <button
            className={`w-full ${getButtonColor()} text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors`}
            disabled
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Learn: React.FC = () => {
  const { user } = useAuth(); // expect { uid }
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({}); // moduleId -> lastCompletedLesson (0-based)
  const [loading, setLoading] = useState(true);

  const DIFF_RANK: Record<Difficulty, number> = {
    Beginner: 0,
    Intermediate: 1,
    Advanced: 2,
  };

  useEffect(() => {
    const colRef = collection(db, 'modules');
    const unsub = onSnapshot(
      colRef,
      snap => {
        const raw: ModuleDoc[] = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title ?? '',
            subtitle: data.subtitle ?? '',
            difficulty: (data.difficulty ?? 'Beginner') as Difficulty,
            imageUrl: data.imageUrl ?? '',
            lessons: Array.isArray(data.lessons) ? data.lessons : [],
            createdAt: data.createdAt, // Firestore Timestamp | undefined
          };
        });

        // ✅ 클라이언트 정렬: 난이도 → createdAt
        const sorted = [...raw].sort((a, b) => {
          const ra = DIFF_RANK[a.difficulty] ?? 999;
          const rb = DIFF_RANK[b.difficulty] ?? 999;
          if (ra !== rb) return ra - rb;

          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return ta - tb;
        });

        console.log('modules (client-sorted): size=', snap.size, sorted);
        setModules(sorted);
        setLoading(false);
      },
      err => {
        console.error('[onSnapshot modules] error:', err);
        setModules([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Live subscribe to user's module progress (users/{uid}/moduleProgress/*)
  useEffect(() => {
    if (!user?.uid) return;

    const colRef = collection(db, 'users', user.uid, 'moduleProgress');
    // 실시간 반영
    const unsub = onSnapshot(colRef, snap => {
      const next: Record<string, number> = {};
      snap.forEach(doc => {
        const d = doc.data() as UserModuleProgress;
        if (typeof d.lastCompletedLesson === 'number') {
          next[doc.id] = d.lastCompletedLesson;
        }
      });
      setProgressMap(next);
    });

    return () => unsub();
  }, [user?.uid]);

  const cards: LearningModuleProps[] = useMemo(() => {
    if (!modules.length) return [];

    return modules.map((m, idx) => {
      const total = m.lessons?.length ?? 0;
      const last = progressMap[m.id]; // 0-based
      const completedCount =
        typeof last === 'number'
          ? Math.min(total, Math.max(0, last + 1)) // last=0 -> 1개 완료
          : 0;

      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      const isCompleted = total > 0 && completedCount >= total;
      const prevCompleted =
        idx === 0
          ? true
          : (() => {
              // 이전 모듈이 완료되었는지 확인
              const prev = modules[idx - 1];
              const prevTotal = prev.lessons?.length ?? 0;
              const prevLast = progressMap[prev.id];
              const prevCompletedCount =
                typeof prevLast === 'number' ? Math.min(prevTotal, Math.max(0, prevLast + 1)) : 0;
              return prevTotal > 0 && prevCompletedCount >= prevTotal;
            })();

      const status: 'available' | 'locked' | 'completed' = isCompleted
        ? 'completed'
        : prevCompleted
          ? 'available'
          : 'locked';

      // 카드 설명: subtitle 우선, 없으면 첫 레슨 content의 앞부분
      const description =
        (m.subtitle && String(m.subtitle)) ||
        (m.lessons?.[0]?.content
          ? String(m.lessons[0].content).split('---')[0].slice(0, 160) + '...'
          : 'Start this module to begin learning.');

      // 이미지: 필드 비었으면 플레이스홀더
      const img =
        m.imageUrl && m.imageUrl.trim() ? m.imageUrl : `/images/module-${(idx % 8) + 1}.png`; // 너가 갖고있는 샘플 이미지 활용

      return {
        id: m.id,
        title: m.title,
        description,
        difficulty: m.difficulty,
        progress,
        status,
        planetColor: 'transparent',
        img,
      };
    });
  }, [modules, progressMap]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Background Planet */}
      <motion.div
        className="fixed top-0 right-0 w-1/3 md:w-1/2 h-screen overflow-hidden pointer-events-none opacity-20 md:opacity-30"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      >
        <img
          src="/images/planet.png"
          alt="Planet Background"
          className="object-cover w-[400px] md:w-[600px] h-auto"
        />
      </motion.div>

      {/* Main */}
      <div className="relative z-10 pt-10 md:pt-14 lg:pt-16 pb-12 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12 max-w-2xl"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2 md:mb-3">
              Learning Modules
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Progress through structured astronomy modules at your own pace
            </p>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="text-gray-600">Loading modules…</div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            >
              {cards.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <LearningModule {...module} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;

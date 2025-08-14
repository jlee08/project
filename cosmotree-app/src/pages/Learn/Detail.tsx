// src/pages/LearnDetail.tsx
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Icon from '../../components/UI/Icon';
import { useAuth } from '../../context/AuthContext';
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface FirestoreLesson {
  title: string;
  content: string;
}
interface FirestoreModule {
  title: string;
  subtitle?: string;
  difficulty: Difficulty;
  imageUrl?: string;
  lessons: FirestoreLesson[];
  createdAt?: any;
}

type UserModuleProgress = {
  lastCompletedLesson: number; // 0-based
};

const LearnDetail: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();

  const [moduleDoc, setModuleDoc] = useState<FirestoreModule | null>(null);
  const [loading, setLoading] = useState(true);

  // 진행도
  const [lastCompleted, setLastCompleted] = useState<number | null>(null);

  // 현재 레슨 인덱스(0-based)
  const [currentIdx, setCurrentIdx] = useState(0);

  // 사이드 토픽 토글
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);

  const navigate = useNavigate();

  // 모듈 로드
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!moduleId) return;
      setLoading(true);
      const ref = doc(db, 'modules', moduleId);
      const snap = await getDoc(ref);
      if (mounted) {
        if (snap.exists()) {
          const data = snap.data() as any;
          const normalized: FirestoreModule = {
            title: data.title,
            subtitle: data.subtitle ?? '',
            difficulty: (data.difficulty ?? 'Beginner') as Difficulty,
            imageUrl: data.imageUrl ?? '',
            lessons: Array.isArray(data.lessons) ? data.lessons : [],
            createdAt: data.createdAt,
          };
          setModuleDoc(normalized);
        } else {
          setModuleDoc(null);
        }
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [moduleId]);

  // 유저 진행도 구독(실시간)
  useEffect(() => {
    if (!user?.uid || !moduleId) return;
    const progressRef = doc(db, 'users', user.uid, 'moduleProgress', moduleId);
    const unsub = onSnapshot(progressRef, snap => {
      if (snap.exists()) {
        const d = snap.data() as UserModuleProgress;
        if (typeof d.lastCompletedLesson === 'number') {
          setLastCompleted(d.lastCompletedLesson);
        } else {
          setLastCompleted(null);
        }
      } else {
        setLastCompleted(null);
      }
    });
    return () => unsub();
  }, [user?.uid, moduleId]);

  // 시작 시점 결정: 진행도가 있으면 그 다음 레슨부터, 없으면 0
  useEffect(() => {
    if (!moduleDoc) return;
    const total = moduleDoc.lessons?.length ?? 0;
    if (total === 0) {
      setCurrentIdx(0);
      return;
    }
    if (typeof lastCompleted === 'number') {
      const next = Math.min(lastCompleted + 1, total - 1);
      setCurrentIdx(next);
    } else {
      setCurrentIdx(0);
    }
  }, [moduleDoc, lastCompleted]);

  const totalLessons = moduleDoc?.lessons?.length ?? 0;

  const progressPercent = useMemo(() => {
    if (!moduleDoc) return 0;
    const total = totalLessons;
    const completedCount =
      typeof lastCompleted === 'number' ? Math.min(total, Math.max(0, lastCompleted + 1)) : 0;
    return total > 0 ? Math.round((completedCount / total) * 100) : 0;
  }, [moduleDoc, totalLessons, lastCompleted]);

  const title = moduleDoc?.title ?? 'Module';
  const difficulty = moduleDoc?.difficulty ?? 'Beginner';

  // 현재 레슨
  const currentLesson = useMemo(() => {
    if (!moduleDoc) return null;
    return moduleDoc.lessons?.[currentIdx] ?? null;
  }, [moduleDoc, currentIdx]);

  // 레슨 클릭 시 이동(진행 저장은 하지 않음 — Next에서만 저장)
  const handleClickLesson = (index: number) => {
    setCurrentIdx(index);
  };

  // Next 클릭: 진행 저장 후 다음 레슨으로
  const handleNext = useCallback(async () => {
    if (!user?.uid || !moduleId || !moduleDoc) return;

    const willCompleteIdx = currentIdx;
    const newLastCompleted =
      typeof lastCompleted === 'number'
        ? Math.max(lastCompleted, willCompleteIdx)
        : willCompleteIdx;

    const ref = doc(db, 'users', user.uid, 'moduleProgress', moduleId);
    await setDoc(ref, { lastCompletedLesson: newLastCompleted } as UserModuleProgress, {
      merge: true,
    });

    // 마지막 레슨이면 /learn으로 이동
    if (currentIdx >= totalLessons - 1) {
      navigate('/learn');
      return;
    }

    // 다음 레슨으로 이동
    const next = Math.min(currentIdx + 1, totalLessons - 1);
    setCurrentIdx(next);
  }, [user?.uid, moduleId, moduleDoc, currentIdx, totalLessons, lastCompleted, navigate]);

  const handlePrev = () => {
    const prev = Math.max(currentIdx - 1, 0);
    setCurrentIdx(prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header mode="dark" fixed />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-gray-700">Loading…</div>
      </div>
    );
  }

  if (!moduleDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header mode="dark" fixed />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-gray-700">Module not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header mode="dark" fixed />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-[420px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: 'url(/images/learn-detail-hero-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-2xl md:text-3xl lg:text-4xl font-bold"
          >
            {title}
          </motion.h1>
        </div>
      </motion.div>

      {/* Main */}
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <Link
                to="/learn"
                className="flex items-center gap-2 text-black hover:text-gray-700 font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                    fill="currentColor"
                  />
                </svg>
                Back to Modules
              </Link>

              <div className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                Lesson {Math.min(currentIdx + 1, totalLessons)} of {totalLessons}
              </div>
            </div>

            <div className="flex gap-4 my-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black mb-2">{title}</h1>
                <p className="text-gray-600 mb-4">
                  {moduleDoc.subtitle || 'Explore the module lessons at your own pace.'}
                </p>
                <span className="inline-block px-3 py-1 rounded text-sm font-semibold bg-gray-200 text-gray-800">
                  {difficulty}
                </span>
              </div>

              {/* Topics (optional, 그냥 토글 UI 유지) */}
              <div className="w-80">
                <button
                  onClick={() => setIsTopicsExpanded(v => !v)}
                  className="w-full flex items-center justify-between gap-2 bg-transparent border border-gray-300 px-4 py-3 rounded-lg font-medium text-black hover:bg-gray-50 transition-colors"
                >
                  Topics Covered
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    animate={{ rotate: isTopicsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                      fill="currentColor"
                    />
                  </motion.svg>
                </button>

                {isTopicsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 bg-transparent border border-gray-300 rounded-lg p-4"
                  >
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Key ideas and terminology</li>
                      <li>• Concepts from each lesson</li>
                      <li>• Suggested next lessons</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-black">Lessons Progress</span>
              <span className="text-lg font-medium text-black">{progressPercent}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
              <motion.div
                className="bg-gray-800 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Lessons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-transparent rounded-3xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-6">Lessons</h3>
                <div className="space-y-4">
                  {moduleDoc.lessons.map((lesson, index) => {
                    const isActive = index === currentIdx;
                    const isCompleted = typeof lastCompleted === 'number' && index <= lastCompleted;
                    return (
                      <motion.button
                        type="button"
                        onClick={() => handleClickLesson(index)}
                        key={`${index}-${lesson.title}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`w-full text-left flex justify-between items-center gap-4 p-4 rounded-xl border transition-colors ${
                          isActive
                            ? 'bg-gray-800 border-gray-800 text-white'
                            : 'bg-transparent border-gray-200 text-black hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold text-sm line-clamp-1">{lesson.title}</span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-white' : 'bg-gray-100'
                          }`}
                          title={isCompleted ? 'Completed' : 'Not completed'}
                        >
                          <Icon name={isCompleted ? 'check' : 'libraryBooks'} size={18} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="space-y-8">
                {/* Lesson Content */}
                <div className="bg-transparent rounded-3xl border border-gray-200 shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    {currentLesson?.title || 'Lesson'}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {(currentLesson?.content || '')
                      .split('\n\n')
                      .filter(Boolean)
                      .map((p, i) => (
                        <p key={i} className="mb-6">
                          {p}
                        </p>
                      ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className={`flex items-center gap-2 bg-transparent border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentIdx === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                        fill="currentColor"
                      />
                    </svg>
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gray-800 border border-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    {currentIdx >= totalLessons - 1 ? 'Finish Module' : 'Next Lesson'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnDetail;

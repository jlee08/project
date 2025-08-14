import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/UI/Icon';
import { getRandomFacts, AstronomyFact } from '../data/astronomyFacts';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import './Dashboard.css';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type FirestoreLesson = { title: string; content: string };
type FirestoreModule = {
  id: string;
  title: string;
  subtitle?: string;
  difficulty: Difficulty;
  imageUrl?: string;
  lessons: FirestoreLesson[];
  createdAt?: any;
};
type UserModuleProgress = { lastCompletedLesson: number }; // 0-based

type QuizResultDoc = {
  correctCount?: number;
  totalAnswered?: number;
  scorePercent?: number; // 0~100
  completed?: boolean;
  lastUpdated?: any; // Firebase Timestamp
};

type QuizHistoryRow = {
  id: string; // moduleId
  topic: string; // module title
  moduleLabel: string; // e.g. moduleId
  score: string; // "85%"
  status: 'complete' | 'pending';
  action: 'retake' | 'start';
  lastUpdatedMs: number; // for sorting
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ---------- Modules progress ----------
  const [modules, setModules] = useState<FirestoreModule[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [quizResults, setQuizResults] = useState<Record<string, QuizResultDoc>>({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [randomFacts, setRandomFacts] = useState<AstronomyFact[]>([]);
  const [selectedFact, setSelectedFact] = useState<AstronomyFact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizRows, setQuizRows] = useState<QuizHistoryRow[]>([]);

  // 모듈 목록 가져오기
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setModulesLoading(true);
      const col = collection(db, 'modules');
      const q = query(col, orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      if (!mounted) return;
      const list: FirestoreModule[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title,
          subtitle: data.subtitle ?? '',
          difficulty: (data.difficulty ?? 'Beginner') as Difficulty,
          imageUrl: data.imageUrl ?? '',
          lessons: Array.isArray(data.lessons) ? data.lessons : [],
          createdAt: data.createdAt,
        };
      });
      setModules(list);
      setModulesLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  // 사용자 진행률 실시간 구독
  useEffect(() => {
    if (!user?.uid) return;
    const colRef = collection(db, 'users', user.uid, 'moduleProgress');
    const unsub = onSnapshot(colRef, snap => {
      const map: Record<string, number> = {};
      snap.forEach(doc => {
        const d = doc.data() as UserModuleProgress;
        if (typeof d.lastCompletedLesson === 'number') {
          map[doc.id] = d.lastCompletedLesson;
        }
      });
      setProgressMap(map);
    });
    return () => unsub();
  }, [user?.uid]);

  // 퀴즈 결과 실시간 구독
  useEffect(() => {
    if (!user?.uid) return;
    const colRef = collection(db, 'users', user.uid, 'quizResults');
    const unsub = onSnapshot(colRef, snap => {
      const results: Record<string, QuizResultDoc> = {};
      snap.forEach(d => {
        const data = d.data() as QuizResultDoc;
        results[d.id] = data;
      });
      setQuizResults(results);
    });
    return () => unsub();
  }, [user?.uid]);

  // 랜덤 천문학 상식 생성
  useEffect(() => {
    setRandomFacts(getRandomFacts(10));
  }, []);

  // 모달 오픈 시 바디 스크롤 방지
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // 클린업 함수
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  // MyPage.tsx 스타일의 퀴즈 히스토리 구독
  useEffect(() => {
    if (!user?.uid) return;
    const colRef = collection(db, 'users', user.uid, 'quizResults');
    const unsub = onSnapshot(colRef, snap => {
      const rows: QuizHistoryRow[] = [];
      snap.forEach(d => {
        const data = d.data() as QuizResultDoc;
        const moduleId = d.id;

        const score =
          typeof data.scorePercent === 'number'
            ? Math.max(0, Math.min(100, Math.round(data.scorePercent)))
            : (data.totalAnswered || 0) > 0
              ? Math.round(((data.correctCount || 0) / (data.totalAnswered || 1)) * 100)
              : 0;

        // 퀴즈 완료 조건을 더 현실적으로 수정: 시도했으면 완료로 간주
        const completed = !!data.completed || (data.totalAnswered || 0) > 0 || score > 0;
        
        // 상태 표시: 높은 점수면 complete, 낮은 점수면 pending으로 표시
        const displayStatus = (!!data.completed || score >= 70) ? 'complete' : 'pending';

        rows.push({
          id: moduleId,
          topic: modules.find(m => m.id === moduleId)?.title || moduleId,
          moduleLabel: moduleId,
          score: `${score}%`,
          status: displayStatus,
          action: (!!data.completed || score >= 70) ? 'retake' : 'start',
          lastUpdatedMs: data.lastUpdated?.toMillis?.() ?? 0,
        });
      });

      // 최신 활동 우선 정렬
      rows.sort((a, b) => b.lastUpdatedMs - a.lastUpdatedMs);
      setQuizRows(rows);
    });
    return () => unsub();
  }, [user?.uid, modules]);

  // 진행률 계산
  const moduleStats = useMemo(() => {
    let completedModules = 0;
    let totalProgress = 0;
    let averageQuizScore = 0;
    let completedQuizzes = 0;
    let bestQuizScore = 0;
    let bestQuizModule = '';
    let totalLessons = 0;
    let completedLessons = 0;

    modules.forEach(m => {
      const total = m.lessons?.length ?? 0;
      totalLessons += total;
      
      const last = progressMap[m.id];
      const completedCount = typeof last === 'number' ? Math.min(total, Math.max(0, last + 1)) : 0;
      completedLessons += completedCount;
      
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      
      if (progress >= 100 && total > 0) {
        completedModules++;
      }
      totalProgress += progress;

      // 퀴즈 점수 계산 (MyPage.tsx 방식 적용)
      const quizResult = quizResults[m.id];
      if (quizResult) {
        // MyPage.tsx와 동일한 점수 계산 로직
        const score = typeof quizResult.scorePercent === 'number'
          ? Math.max(0, Math.min(100, Math.round(quizResult.scorePercent)))
          : (quizResult.totalAnswered || 0) > 0
            ? Math.round(((quizResult.correctCount || 0) / (quizResult.totalAnswered || 1)) * 100)
            : 0;
        
        // 퀴즈 완료 조건을 더 현실적으로 수정: 시도했으면 완료로 간주
        const completed = !!quizResult.completed || (quizResult.totalAnswered || 0) > 0 || score > 0;
        
        if (completed) {
          completedQuizzes++;
          averageQuizScore += score;
          if (score > bestQuizScore) {
            bestQuizScore = score;
            bestQuizModule = m.title;
          }
        }
      }
    });

    if (completedQuizzes > 0) {
      averageQuizScore = Math.round(averageQuizScore / completedQuizzes);
    }

    const overallProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;
    const lessonCompletionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      completedModules,
      totalModules: modules.length,
      overallProgress,
      completedQuizzes,
      averageQuizScore,
      bestQuizScore,
      bestQuizModule,
      totalLessons,
      completedLessons,
      lessonCompletionRate,
      totalQuizRows: quizRows.length, // 시도한 퀴즈 총 개수
      completeQuizRows: quizRows.filter(q => q.status === 'complete').length, // 완료한 퀴즈 개수
      quizCompletionRate: quizRows.length > 0 ? Math.round((quizRows.filter(q => q.status === 'complete').length / quizRows.length) * 100) : 0,
      // 퀴즈를 시도한 고유 모듈 개수 (중복 제거)
      attemptedQuizModules: new Set(quizRows.map(q => q.id)).size,
      // 퀴즈를 완료한 고유 모듈 개수 (중복 제거)
      completedQuizModules: new Set(quizRows.filter(q => q.status === 'complete').map(q => q.id)).size
    };
  }, [modules, progressMap, quizResults, quizRows]);

  // 다음 학습할 모듈 찾기
  const nextModule = useMemo(() => {
    return modules.find(m => {
      const total = m.lessons?.length ?? 0;
      const last = progressMap[m.id];
      const completedCount = typeof last === 'number' ? Math.min(total, Math.max(0, last + 1)) : 0;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      return progress < 100;
    });
  }, [modules, progressMap]);

  // 완료되지 않은 퀴즈 찾기
  const nextQuiz = useMemo(() => {
    return modules.find(m => {
      const quizResult = quizResults[m.id];
      return !quizResult?.completed;
    });
  }, [modules, quizResults]);

  // 모듈 제목 매핑 (MyPage.tsx 스타일)
  const moduleTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    modules.forEach(m => {
      map[m.id] = m.title;
    });
    return map;
  }, [modules]);

  // 핸들러
  const handleContinueLearning = () => {
    if (nextModule) {
      navigate(`/learn/${nextModule.id}`);
    } else {
      navigate('/learn');
    }
  };

  const handleTakeQuiz = () => {
    if (nextQuiz) {
      navigate(`/quiz/${nextQuiz.id}`);
    } else {
      navigate('/quizzes');
    }
  };

  const handleFactClick = (fact: AstronomyFact) => {
    // 모달 열기
    setSelectedFact(fact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFact(null);
  };
  return (
    <div className="min-h-screen relative">
      {/* 갤럭시 배경 */}
      <div className="galaxy-background">
        <div className="shooting-star" style={{ top: '10%', animationDelay: '0s' }}></div>
        <div className="shooting-star" style={{ top: '30%', animationDelay: '2s' }}></div>
        <div className="shooting-star" style={{ top: '50%', animationDelay: '4s' }}></div>
        <div className="shooting-star" style={{ top: '70%', animationDelay: '6s' }}></div>
      </div>
      
      <div className="relative z-10 p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8">
        {/* Top Section - Learning Progress and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Learning Progress Summary */}
          <motion.div
            className="lg:col-span-2 bg-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg "
            style={{
              backgroundImage: `url('/images/dashboard-sec.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-lg md:text-xl font-semibold text-white mt-4 mb-6 md:mb-8">
              Learning Progress Summary
            </h2>

            {/* Progress Visualization */}
            <div className="flex items-center gap-0 md:gap-0 lg:gap-0 mb-6 md:mb-8 overflow-x-auto">
              {/* Dynamic module progress visualization */}
              {modules.slice(0, 10).map((module, index) => {
                const total = module.lessons?.length ?? 0;
                const last = progressMap[module.id];
                const completedCount = typeof last === 'number' ? Math.min(total, Math.max(0, last + 1)) : 0;
                const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                const isCompleted = progress >= 100;
                
                return (
                  <React.Fragment key={module.id}>
                    <div className={`${
                      isCompleted 
                        ? 'bg-white' 
                        : 'bg-white/30 border border-white/50'
                    } rounded-xl md:rounded-2xl p-2 md:p-4 shadow-sm flex-shrink-0`}>
                      {isCompleted ? (
                        <Icon name="rocket" size={20} className="md:w-6 md:h-6 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-300"></div>
                      )}
                    </div>
                    {index < 9 && <div className="w-7 h-0 border-t border-white mx-1 md:mx-2"></div>}
                  </React.Fragment>
                );
              })}
              
              {/* Fill remaining slots if less than 10 modules */}
              {modules.length < 10 && Array.from({ length: 10 - modules.length }).map((_, i) => (
                <React.Fragment key={`empty-${i}`}>
                  <div className="bg-white/30 border border-white/50 rounded-2xl w-16 h-16 shadow-sm flex-shrink-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gray-400/50"></div>
                  </div>
                  {(modules.length + i) < 9 && <div className="w-7 h-0 border-t border-white mx-1 md:mx-2"></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-400 border-dashed my-6"></div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Module Progress Card */}
              <motion.div
                className="bg-white rounded-3xl p-6 border border-gray-300 flex items-center gap-4"
                style={{
                  boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.15)',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                  <Icon name="planet" size={24} />
                </div>
                {modulesLoading ? (
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">
                      {nextModule ? `Current: ${nextModule.title}` : 'All Modules Complete!'}
                    </h3>
                    <p className="text-black text-base">
                      {moduleStats.completedLessons} of {moduleStats.totalLessons} lessons completed ({moduleStats.lessonCompletionRate}%)
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${moduleStats.lessonCompletionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Modules: {moduleStats.completedModules}/{moduleStats.totalModules} ({moduleStats.overallProgress}%)
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quiz Performance Card */}
              <motion.div
                className="bg-white rounded-3xl p-6 border border-gray-300 flex items-center gap-4"
                style={{
                  boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.15)',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                  <Icon name="book" size={24} />
                </div>
                {modulesLoading ? (
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">Quiz Performance</h3>
                    {moduleStats.attemptedQuizModules > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-black text-base">
                            {moduleStats.attemptedQuizModules} of 10 modules attempted
                          </span>
                          {moduleStats.averageQuizScore > 0 && (
                            <span className="bg-green-100 border border-green-300 px-2 py-1 rounded text-sm font-semibold text-green-800">
                              {moduleStats.averageQuizScore}% avg
                            </span>
                          )}
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-700"
                            style={{ width: `${Math.round((moduleStats.attemptedQuizModules / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          {moduleStats.bestQuizModule && (
                            <p className="text-sm text-gray-600">
                              Best: {moduleStats.bestQuizScore}%
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {Math.round((moduleStats.attemptedQuizModules / 10) * 100)}% progress
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-black text-base">No quizzes attempted yet</p>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Take your first quiz to track progress!</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="bg-black rounded-3xl p-8 shadow-lg flex flex-col h-100 align-items-center justify-between"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center justify-around mb-0">
              <h2 className="text-xl font-normal text-white mb-8">Quick Actions</h2>

              {/* Moon Icon */}
              <div className="flex justify-center mb-8">
                <Icon name="moonStars" size={64} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <motion.button
                onClick={handleContinueLearning}
                className="w-full bg-white p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-black font-medium">Continue Learning</span>
                <div className="w-10 h-10 flex items-center justify-center">
                  <Icon name="arrowBack" size={20} className="" />
                </div>
              </motion.button>

              <motion.button
                onClick={handleTakeQuiz}
                className="w-full bg-white p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-black font-medium">Take a Quiz</span>
                <div className="w-10 h-10 flex items-center justify-center">
                  <Icon name="arrowBack" size={20} className="" />
                </div>
              </motion.button>
{/* 
              <motion.button
                className="w-full bg-white p-4 flex justify-between items-center hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-black font-medium">View Achievements</span>
                <div className="w-10 h-10ex items-center justify-center">
                  <Icon name="arrowBack" size={20} className="" />
                </div>
              </motion.button> */}
            </div>
          </motion.div>
        </div>

        {/* Resource Library Section */}
        <motion.div
          className="rounded-3xl p-8 border border-gray-400 bg-transparent"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-white">Resource Library</h2>
            <button 
              onClick={() => setRandomFacts(getRandomFacts(10))}
              className="text-blue-600 hover:text-blue-800 font-medium text-2xl transition-colors"
            >
              🔄
            </button>
          </div>

          {/* Dynamic Astronomy Facts Slider */}
          <Swiper
            modules={[FreeMode, Mousewheel]}
            spaceBetween={24}
            slidesPerView="auto"
            freeMode={true}
            mousewheel={true}
            grabCursor={true}
            className="resource-swiper"
          >
            {randomFacts.map((fact, index) => (
              <SwiperSlide key={`${fact.id}-${index}`} style={{ width: '300px' }}>
                <motion.div
                  className="bg-white rounded-3xl p-6 border border-gray-300 shadow-sm flex flex-col h-[180px] cursor-pointer"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleFactClick(fact)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="rounded-full py-4 ps-2 pe-6 w-fit">
                      <Icon name="book" size={24} />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3
                        className="font-semibold text-black text-base mb-2 line-clamp-2"
                        title={fact.title}
                      >
                        {fact.title}
                      </h3>
                      <p className="text-black text-sm line-clamp-2 mb-2">
                        {fact.description.length > 60 
                          ? `${fact.description.substring(0, 60)}...`
                          : fact.description
                        }
                      </p>
                      <span className="bg-black text-white px-2 py-2 rounded text-xs font-semibold">
                        {fact.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      {/* Astronomy Fact Modal */}
      {isModalOpen && selectedFact && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white rounded-[36px] border border-gray-300 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 flex flex-col gap-10 h-full">
              {/* Header Section */}
              <div className="flex flex-col gap-7">
                {/* Title Section */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-5 items-start">
                    {/* Icon Container */}
                    <div className="bg-gray-100 rounded-lg p-3 w-14 h-auto flex items-center justify-center">
                      <Icon name="book" size={32} className="text-gray-800" />
                    </div>
                    
                    {/* Title and Description */}
                    <div className="flex-1 flex flex-col gap-2">
                      <h2 className="text-2xl font-bold text-black leading-tight">
                        {selectedFact.title}
                      </h2>
                      <p className="text-base text-black leading-6">
                        {selectedFact.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Category Tag */}
                  <div className="flex justify-start mt-2">
                    <span className="bg-black text-white px-2 py-1 rounded text-sm font-semibold">
                      {selectedFact.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="h-[570px] overflow-y-auto">
                  <p className="text-xl text-black leading-8">
                    {selectedFact.description}
                    
                    {/* Extended content for demonstration */}
                    <br /><br />
                    Did you know that this fascinating aspect of astronomy has captured the imagination of scientists and enthusiasts for centuries? 
                    The universe is full of wonders that continue to amaze us with their complexity and beauty.
                    
                    <br /><br />
                    From the smallest particles to the largest cosmic structures, astronomy helps us understand our place in the universe. 
                    Each discovery brings new questions and opens up new avenues for exploration and understanding.
                    
                    <br /><br />
                    The study of astronomy not only satisfies our curiosity about the cosmos but also drives technological advancement 
                    and inspires future generations of scientists and explorers. Whether we're observing distant galaxies or studying 
                    planets in our own solar system, each observation contributes to our growing understanding of the universe.
                    
                    <br /><br />
                    As we continue to develop new technologies and methods of observation, we uncover more secrets of the cosmos. 
                    From radio telescopes to space-based observatories, our tools for studying the universe continue to evolve, 
                    allowing us to see further and with greater clarity than ever before.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-black text-white px-4 py-2 rounded-lg w-28 h-14 font-medium text-base hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

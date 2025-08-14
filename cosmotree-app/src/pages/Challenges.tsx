// src/pages/Challenges.tsx
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/UI/Icon';
import './Challenges.css';

// Firebase (v9 modular)
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ───────────────────────── Types
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface ModuleDoc {
  title: string;
  difficulty?: Difficulty;
  createdAt?: Timestamp;
}

interface ChallengeDoc {
  id?: string;
  templateId?: string | null;
  templateName?: string | null;
  generatedContent: any; // JSON or string
  rawPrompt?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface ChallengeCardData {
  id: string; // challenge doc id
  moduleId: string; // module id
  moduleTitle: string;
  title: string; // extracted from generatedContent
  description: string; // extracted from generatedContent
  difficulty: Difficulty;
  icon: string;
  createdAt?: Timestamp;
  status?: 'available' | 'submitted';
}

// 난이도 정렬 우선순위
const DIFF_RANK: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

// ───────────────────────── 카드 컴포넌트
const ChallengeCard: React.FC<{ challenge: ChallengeCardData; index: number }> = ({ 
  challenge, 
  index 
}) => {
  const isSubmitted = challenge.status === 'submitted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white border border-gray-300 rounded-[20px] p-4 md:p-6 challenge-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex justify-between items-center gap-2 mb-4 w-full">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Icon name="puzzle" size={24} />
          </div>
          <span className="bg-purple-100 border border-purple-300 px-2 py-1 rounded text-xs font-semibold text-purple-800">
            {challenge.difficulty}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-1">{challenge.title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {challenge.moduleTitle}
        </p>
        <p className="text-sm text-black line-clamp-2">
          {challenge.description}
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex justify-between items-center py-5 gap-4 w-full">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Icon name="target" size={18} />
            </div>
            <span className="text-sm text-black">Status</span>
          </div>
          <span className={`px-2 py-1 rounded text-sm font-semibold ${
            isSubmitted 
              ? 'bg-green-100 border border-green-300 text-green-800' 
              : 'bg-gray-100 border border-gray-300 text-gray-800'
          }`}>
            {isSubmitted ? 'Submitted' : 'Available'}
          </span>
        </div>

        <Link
          to={`/challenge/${challenge.moduleId}/${challenge.id}`}
          className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
            isSubmitted
              ? 'bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isSubmitted ? 'View Challenge' : 'Start Challenge'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
              fill="currentColor"
            />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

// ───────────────────────── 메인 컴포넌트
const Challenges: React.FC = () => {
  const [modules, setModules] = useState<Record<string, ModuleDoc & { id: string }>>({});
  const [challenges, setChallenges] = useState<ChallengeCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // 모듈 데이터 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'modules'));
        const moduleMap: Record<string, ModuleDoc & { id: string }> = {};
        snap.docs.forEach(d => {
          const data = d.data() as Partial<ModuleDoc>;
          moduleMap[d.id] = {
            id: d.id,
            title: data.title ?? d.id,
            difficulty: (data.difficulty as Difficulty) ?? 'Beginner',
            createdAt: data.createdAt,
          };
        });
        if (alive) setModules(moduleMap);
      } catch (error) {
        console.error('모듈 로드 실패:', error);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 모든 모듈의 챌린지 데이터 로드
  useEffect(() => {
    const moduleIds = Object.keys(modules);
    if (moduleIds.length === 0) {
      setLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    const allChallenges: ChallengeCardData[] = [];

    let loadedModules = 0;

    moduleIds.forEach(moduleId => {
      const challengesRef = collection(db, `modules/${moduleId}/challenges`);
      const q = query(challengesRef, orderBy('createdAt', 'desc'));
      
      const unsub = onSnapshot(q, (snap) => {
        // 이 모듈의 챌린지들을 allChallenges에서 제거하고 새로 추가
        const filteredChallenges = allChallenges.filter(c => c.moduleId !== moduleId);
        
        const moduleChallenges = snap.docs.map(d => {
          const data = d.data() as ChallengeDoc;
          const moduleData = modules[moduleId];
          
          // generatedContent에서 제목과 설명 추출
          let title = 'Challenge';
          let description = 'Complete this challenge to test your knowledge.';
          
          try {
            if (typeof data.generatedContent === 'string') {
              const content = JSON.parse(data.generatedContent);
              title = content.title || content.missionTitle || content.name || title;
              description = content.description || content.instructions || content.overview || description;
            } else if (typeof data.generatedContent === 'object') {
              const content = data.generatedContent;
              title = content.title || content.missionTitle || content.name || title;
              description = content.description || content.instructions || content.overview || description;
            }
          } catch (error) {
            console.log('챌린지 콘텐츠 파싱 실패:', error);
          }

          // 설명이 너무 길면 자르기
          if (description.length > 120) {
            description = description.substring(0, 120) + '...';
          }

          const challengeCard: ChallengeCardData = {
            id: d.id,
            moduleId,
            moduleTitle: moduleData?.title || moduleId,
            title,
            description,
            difficulty: moduleData?.difficulty || 'Beginner',
            icon: 'puzzle',
            createdAt: data.createdAt,
            status: 'available', // TODO: 실제 제출 상태 확인
          };
          
          return challengeCard;
        });

        // 전체 챌린지 배열 업데이트
        allChallenges.splice(0, allChallenges.length, ...filteredChallenges, ...moduleChallenges);
        
        loadedModules++;
        if (loadedModules === moduleIds.length) {
          setChallenges([...allChallenges]);
          setLoading(false);
        }
      });

      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [modules]);

  // 챌린지 정렬 (난이도 → 생성일시)
  const sortedChallenges = useMemo(() => {
    return [...challenges].sort((a, b) => {
      // 1) 난이도 오름차순
      const dr = (DIFF_RANK[a.difficulty] ?? 99) - (DIFF_RANK[b.difficulty] ?? 99);
      if (dr !== 0) return dr;

      // 2) 생성일시 내림차순(최신 먼저)
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return bt - at;
    });
  }, [challenges]);

  return (
    <div
      className="min-h-screen challenges-page relative"
      style={{ paddingTop: '120px', backgroundImage: 'url(/images/challenges-bg.png)' }}
    >
      <div className="relative z-10 pb-12 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-start mb-12 md:mb-16 px-4 pt-4 md:pt-8"
        >
          <div className="max-w-7xl px-4 md:px-5 mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Challenges</h1>
            <p className="text-lg md:text-xl text-white">
              Take on exciting challenges to apply your knowledge and skills
            </p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-white/90">Loading challenges…</div>
          ) : sortedChallenges.length === 0 ? (
            <div className="text-center text-white/90 py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No Challenges Available</h3>
              <p>Challenges will appear here once they are created by administrators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedChallenges.map((challenge, index) => (
                <ChallengeCard key={`${challenge.moduleId}-${challenge.id}`} challenge={challenge} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;

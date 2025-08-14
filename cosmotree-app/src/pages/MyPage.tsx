// src/pages/MyPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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

type ModuleRow = {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
};

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

const MyPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'module' | 'quiz'>('module');
  const navigate = useNavigate();

  // ---------- Profile state ----------
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const [name, setName] = useState(''); // editable
  const [email, setEmail] = useState(''); // view-only (재인증 이슈로 수정 화면만 비활성)
  const [photoURL, setPhotoURL] = useState<string>('');
  const [photoPath, setPhotoPath] = useState<string>(''); // 삭제용 경로 저장

  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to user profile doc
  useEffect(() => {
    if (!user?.uid) return;
    const refUser = doc(db, 'users', user.uid);
    const unsub = onSnapshot(refUser, snap => {
      const d = snap.data() as any;
      setName(d?.name || user.displayName || '');
      setEmail(d?.email || user.email || '');
      setPhotoURL(d?.photoURL || user.photoURL || '');
      setPhotoPath(d?.photoPath || '');
      setProfileLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // ---------- Modules progress ----------
  const [modules, setModules] = useState<FirestoreModule[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [quizRows, setQuizRows] = useState<QuizHistoryRow[]>([]);

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

  const moduleRows: ModuleRow[] = useMemo(() => {
    return modules.map(m => {
      const total = m.lessons?.length ?? 0;
      const last = progressMap[m.id];
      const completedCount = typeof last === 'number' ? Math.min(total, Math.max(0, last + 1)) : 0;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      let status: ModuleRow['status'] = 'not-started';
      if (progress >= 100 && total > 0) status = 'completed';
      else if (progress > 0) status = 'in-progress';

      const description =
        (m.subtitle && String(m.subtitle)) ||
        (m.lessons?.[0]?.content
          ? String(m.lessons[0].content).split('---')[0].slice(0, 120) + '...'
          : 'Start this module to begin learning.');

      return { id: m.id, title: m.title, description, status, progress };
    });
  }, [modules, progressMap]);

  // ---------- Handlers: Profile photo ----------
  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const f = e.target.files?.[0] || null;
    setNewFile(f);
    setUploadProgress(0);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.uid) return;
    try {
      setDeletingPhoto(true);
      // 기존 스토리지 파일 삭제(경로가 있을 때만)
      if (photoPath) {
        const storageRef = ref(storage, photoPath);
        await deleteObject(storageRef);
      }
      // Firestore/ Auth 정리
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: '', photoPath: '' });
      if (user) await updateProfile(user, { photoURL: '' });
      setPhotoURL('');
      setPhotoPath('');
      setPreview('');
      setNewFile(null);
    } finally {
      setDeletingPhoto(false);
    }
  };

  // ---------- Handlers: Save profile (name + photo) ----------
  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      let nextPhotoURL = photoURL;
      let nextPhotoPath = photoPath;

      // 새 파일 업로드
      if (newFile) {
        // 새 파일 먼저 업로드
        const path = `users/${user.uid}/profile/${Date.now()}_${newFile.name}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, newFile);

        await new Promise<void>((resolve, reject) => {
          task.on(
            'state_changed',
            snap => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
              setUploadProgress(pct);
            },
            reject,
            async () => {
              nextPhotoURL = await getDownloadURL(task.snapshot.ref);
              nextPhotoPath = path;
              resolve();
            }
          );
        });

        // 이전 파일이 있으면 정리(성공적으로 새 파일 올린 후)
        if (photoPath && photoPath !== nextPhotoPath) {
          try {
            await deleteObject(ref(storage, photoPath));
          } catch {
            // 이전 파일이 없어도 무시
          }
        }
      }

      // Firestore 저장
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          name: name || '',
          email: email || user.email || '',
          photoURL: nextPhotoURL || '',
          photoPath: nextPhotoPath || '',
        },
        { merge: true }
      );

      // Auth 프로필 동기화(선택)
      await updateProfile(user, {
        displayName: name || user.displayName || '',
        photoURL: nextPhotoURL || '',
      });

      setPhotoURL(nextPhotoURL);
      setPhotoPath(nextPhotoPath);
      setNewFile(null);
      setPreview('');
      setIsEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setNewFile(null);
    setPreview('');
    setUploadProgress(0);
  };

  const handleEditProfile = () => setIsEditMode(true);

  const handleQuizAction = (action: 'retake' | 'start', moduleId: string) => {
    if (action === 'retake' || action === 'start') {
      // 라우팅으로 바로 이동
      navigate(`/quiz/${moduleId}`);
    }
  };

  const moduleTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    modules.forEach(m => {
      map[m.id] = m.title;
    });
    return map;
  }, [modules]);

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

        const completed = !!data.completed || score === 100;

        rows.push({
          id: moduleId,
          topic: moduleTitleMap[moduleId] || moduleId,
          moduleLabel: moduleId,
          score: `${score}%`,
          status: completed ? 'complete' : 'pending',
          action: completed ? 'retake' : 'start',
          lastUpdatedMs: data.lastUpdated?.toMillis?.() ?? 0,
        });
      });

      // 최신 활동 우선 정렬
      rows.sort((a, b) => b.lastUpdatedMs - a.lastUpdatedMs);
      setQuizRows(rows);
    });
    return () => unsub();
  }, [user?.uid, moduleTitleMap]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="flex justify-center pt-[40px] md:pt-[50px] px-4 md:px-0">
        <div className="w-full max-w-[1128px]">
          <h1 className="text-[24px] md:text-[32px] font-bold text-black leading-[1.3] mb-1">
            My Profile
          </h1>
          <p className="text-[16px] md:text-[20px] text-black leading-[1.5]">
            Track your learning progress and manage your account settings
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex justify-center mt-[20px] md:mt-[30px] px-4 md:px-0">
        <div className="w-full max-w-[1128px] flex flex-col lg:flex-row gap-8 lg:gap-[168px]">
          {/* Profile Card (View) */}
          <div className="w-full lg:w-[480px] h-auto lg:h-[485px] bg-white border border-[#BDBDBD] rounded-[20px] shadow-[0px_4px_60px_0px_rgba(0,0,0,0.1)] p-[24px] md:p-[36px]">
            <div className="flex flex-col gap-[30px] md:gap-[47px] h-full">
              {/* Header */}
              <div className="flex flex-col gap-[20px] md:gap-[32px]">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-[40px] h-[40px] p-2 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <span className="text-[16px] md:text-[18px] text-black leading-[1.5]">
                      Profile Information
                    </span>
                  </div>
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-[#D9D9D9] rounded-full overflow-hidden flex items-center justify-center">
                    {profileLoading ? (
                      <div className="text-xs text-gray-500">Loading…</div>
                    ) : photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">No Photo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 items-center">
                <div className="w-full max-w-[408px]">
                  <div className="bg-white rounded-lg px-4 py-2 w-full h-[56px] flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V4H9V5.5L3 7V9H21ZM12 8C10.9 8 10 8.9 10 10V11H14V10C14 8.9 13.1 8 12 8ZM2 20V18H22V20H2Z"
                        fill="black"
                      />
                    </svg>
                    <span className="text-[18px] md:text-[20px] font-bold text-black">
                      {profileLoading ? 'Loading…' : name || 'Unnamed'}
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-[408px]">
                  <div className="bg-white rounded-lg px-4 py-2 w-full h-[56px] flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                        fill="black"
                      />
                    </svg>
                    <span className="text-[18px] md:text-[20px] text-black">
                      {profileLoading ? 'Loading…' : email || user?.email || 'user@cosmotree.com'}
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-[408px] flex gap-3 mt-4">
                  <button
                    onClick={handleEditProfile}
                    className="flex-1 h-[56px] bg-black text-white rounded-lg text-[16px] font-medium hover:bg-gray-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeletePhoto}
                    disabled={deletingPhoto || !photoURL}
                    className={`h-[56px] px-4 rounded-lg text-[16px] font-medium transition-colors ${
                      deletingPhoto || !photoURL
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
                    }`}
                  >
                    {deletingPhoto ? 'Deleting…' : 'Delete Photo'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          {isEditMode && (
            <div className="w-full lg:w-[480px] h-auto bg-white border border-[#BDBDBD] rounded-[20px] shadow-[0px_4px_60px_0px_rgba(0,0,0,0.1)] p-[24px] md:p-[36px]">
              <div className="flex flex-col gap-6">
                {/* Photo picker */}
                <div className="flex items-center gap-4">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#D9D9D9] flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-600">No Photo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={onPickFile}
                      className="px-4 h-[40px] bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                    >
                      {preview || !photoURL ? 'Upload Photo' : 'Change Photo'}
                    </button>
                    {(preview || newFile) && (
                      <div className="text-xs text-gray-600">
                        {uploadProgress > 0 && uploadProgress < 100
                          ? `Uploading ${uploadProgress}%`
                          : 'Ready to save'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name (editable) */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-[48px] px-3 border border-[#CCCCCC] rounded-lg outline-none"
                    placeholder="Your name"
                  />
                </div>

                {/* Email (view-only) */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full h-[48px] px-3 border border-[#EEEEEE] bg-[#FAFAFA] rounded-lg text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email changes require re-authentication. Handle separately if needed.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className={`flex-1 h-[48px] rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-[#1E1E1E] hover:bg-gray-800'} transition-colors`}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 h-[48px] rounded-lg border border-[#1E1E1E] text-[#1E1E1E] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-[20px] md:mt-[30px] px-4 md:px-0">
        <div className="w-full max-w-[1128px] h-[64px] md:h-[74px] bg-white border border-[#BDBDBD] rounded-[100px] shadow-[0px_4px_60px_0px_rgba(0,0,0,0.1)] p-2">
          <div className="flex h-full">
            <button
              onClick={() => setActiveTab('module')}
              className={`flex-1 rounded-[100px] text-[14px] md:text-[16px] font-normal transition-all ${
                activeTab === 'module' ? 'bg-[#1E1E1E] text-white' : 'text-black hover:bg-gray-50'
              }`}
            >
              Module Progress
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 rounded-[100px] text-[14px] md:text-[16px] font-normal transition-all ${
                activeTab === 'quiz'
                  ? 'bg-[#1E1E1E] text-white border border-black'
                  : 'text-black hover:bg-gray-50'
              }`}
            >
              Quiz History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center mt-[20px] md:mt-[30px] pb-20 px-4 md:px-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[1128px]"
        >
          {activeTab === 'module' ? (
            modulesLoading ? (
              <div className="text-gray-600">Loading your module progress…</div>
            ) : moduleRows.length === 0 ? (
              <div className="text-gray-600">No modules found.</div>
            ) : (
              <div className="space-y-6">
                {moduleRows.map(module => (
                  <div
                    key={module.id}
                    className="bg-white border border-[#BDBDBD] rounded-[20px] shadow-[0px_4px_60px_0px_rgba(0,0,0,0.1)] p-4 md:p-6"
                  >
                    <div className="flex flex-col gap-[20px] md:gap-[25px]">
                      {/* 1) 상단 행 */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-[467px]">
                        {/* 왼쪽 영역 */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[19px] w-full lg:w-auto min-w-0">
                          {/* 썸네일 박스 */}
                          <div className="w-full md:w-[212px] h-[80px] md:h-[98px] bg-[#EEEEEE] border-b border-[#E4E4E4] rounded-[12px] flex items-center justify-center p-4 md:p-6">
                            <div className="text-center min-w-0">
                              {/* 썸네일 안의 타이틀/설명도 과도한 줄바꿈 방지 */}
                              <div
                                className="text-[18px] md:text-[20px] font-bold text-black mb-1 truncate"
                                title={module.title}
                              >
                                {module.title}
                              </div>
                              <div
                                className="text-[12px] md:text-[14px] text-black line-clamp-1"
                                title={module.description}
                              >
                                {module.description}
                              </div>
                            </div>
                          </div>

                          {/* 우측 텍스트 블록(원래 구조 유지) */}
                          <div className="flex flex-col gap-1 min-w-0 md:max-w-[520px]">
                            <div
                              className="text-[18px] md:text-[20px] font-bold text-black truncate"
                              title={module.title}
                            >
                              {module.title}
                            </div>
                            <div
                              className="text-[12px] md:text-[14px] text-black text-opacity-80 line-clamp-2"
                              title={module.description}
                            >
                              {module.description}
                            </div>
                          </div>
                        </div>

                        {/* 상태 배지(오른쪽 고정) */}
                        <div className="bg-[#EEEEEE] rounded-lg px-2 py-1 self-start lg:self-center shrink-0">
                          <span className="text-[12px] md:text-[14px] font-semibold text-black">
                            {module.status === 'completed'
                              ? 'Completed'
                              : module.status === 'in-progress'
                                ? 'In Progress'
                                : 'Not Started'}
                          </span>
                        </div>
                      </div>

                      {/* 2) 진행률 바 (우측에 % 같이 표시해 가독성 ↑) */}
                      <div className="w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-3 md:h-4 bg-[#D9D9D9] rounded-full overflow-hidden min-w-0">
                            <div
                              className="h-full bg-[#333333] rounded-full transition-all duration-300"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                          <span className="text-[12px] md:text-[14px] text-black shrink-0">
                            {module.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white border border-[#BDBDBD] rounded-[20px] shadow-[0px_4px_60px_0px_rgba(0,0,0,0.1)] p-4 md:p-9 overflow-x-auto">
              <div className="min-w-[720px] flex gap-[-8px]">
                {/* Topic */}
                <div className="w-[300px] md:w-[484px]">
                  <div className="border-b border-black p-3 md:p-6">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-black">Topic</h3>
                  </div>
                  {quizRows.length === 0 ? (
                    <div className="p-6 text-gray-500">No quiz history yet.</div>
                  ) : (
                    quizRows.map(row => (
                      <div
                        key={row.id}
                        className="border-b border-[#CCCCCC] p-3 md:p-6 h-[48px] md:h-[56px] flex items-center"
                      >
                        <span className="text-[14px] md:text-[16px] text-black truncate">
                          {row.topic}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Module */}
                <div className="w-[140px] md:w-[180px]">
                  <div className="border-b border-black p-3 md:p-6 text-center">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-black">Module</h3>
                  </div>

                  {quizRows.length === 0
                    ? null
                    : quizRows.map(row => (
                        <div
                          key={row.id}
                          className="border-b border-[#CCCCCC] p-3 md:p-6 h-[48px] md:h-[56px] flex items-center justify-center"
                        >
                          {/* hover 대상 최상위에 group, tooltip 잘리면 안되니 overflow-visible */}
                          <div className="relative group bg-[#EEEEEE] border border-[#BDBDBD] rounded px-2 py-1 max-w-full overflow-visible">
                            {/* 2줄까지만 보여주기 (부모는 overflow-visible 유지) */}
                            <span className="text-[12px] md:text-[14px] font-semibold text-black break-words line-clamp-2">
                              {row.moduleLabel}
                            </span>

                            {/* Tooltip: invisible + opacity 로 부드럽게 표시, 포인터 이벤트 차단 */}
                            <div
                              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                     invisible opacity-0 group-hover:visible group-hover:opacity-100
                     transition-all duration-200 ease-out
                     z-50 bg-black text-white text-xs rounded px-2 py-1
                     whitespace-normal max-w-[220px] break-words shadow-lg
                     pointer-events-none
                     translate-y-1 group-hover:translate-y-0"
                            >
                              {row.moduleLabel}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>

                {/* Score */}
                <div className="w-[100px] md:w-[120px]">
                  <div className="border-b border-black p-3 md:p-6 text-center">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-black">Score</h3>
                  </div>
                  {quizRows.length === 0
                    ? null
                    : quizRows.map(row => (
                        <div
                          key={row.id}
                          className="border-b border-[#CCCCCC] p-3 md:p-6 h-[48px] md:h-[56px] flex items-center justify-center"
                        >
                          <span className="text-[14px] md:text-[16px] text-black">{row.score}</span>
                        </div>
                      ))}
                </div>

                {/* Status */}
                <div className="w-[120px] md:w-[140px]">
                  <div className="border-b border-black p-3 md:p-6 text-center">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-black">Status</h3>
                  </div>
                  {quizRows.length === 0
                    ? null
                    : quizRows.map(row => (
                        <div
                          key={row.id}
                          className="border-b border-[#CCCCCC] p-3 md:p-6 h-[48px] md:h-[56px] flex items-center justify-center"
                        >
                          <div className="flex items-center gap-1">
                            {row.status === 'complete' ? (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  className="md:w-5 md:h-5"
                                >
                                  <path
                                    d="M10 1.67C5.4 1.67 1.67 5.4 1.67 10C1.67 14.6 5.4 18.33 10 18.33C14.6 18.33 18.33 14.6 18.33 10C18.33 5.4 14.6 1.67 10 1.67ZM8.33 14.17L4.17 10L5.34 8.83L8.33 11.82L14.66 5.49L15.83 6.66L8.33 14.17Z"
                                    fill="#00A336"
                                  />
                                </svg>
                                <span className="text-[12px] md:text-[14px] text-[#00A336] hidden md:inline">
                                  Complete
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  className="md:w-5 md:h-5"
                                >
                                  <circle
                                    cx="10"
                                    cy="10"
                                    r="8.33"
                                    stroke="#D9D9D9"
                                    strokeWidth="1.67"
                                    fill="none"
                                  />
                                </svg>
                                <span className="text-[12px] md:text-[14px] text-[#D9D9D9] hidden md:inline">
                                  Pending
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                </div>

                {/* Action */}
                <div className="w-[120px] md:w-[140px]">
                  <div className="border-b border-black p-3 md:p-6 text-center">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-black">Action</h3>
                  </div>
                  {quizRows.length === 0
                    ? null
                    : quizRows.map(row => (
                        <div
                          key={row.id}
                          className="border-b border-[#CCCCCC] p-3 md:p-6 h-[48px] md:h-[56px] flex items-center justify-center"
                        >
                          <button
                            onClick={() => handleQuizAction(row.action, row.id)}
                            className="bg-[#1E1E1E] text-white rounded px-2 py-1 flex items-center gap-1 hover:bg-gray-800 transition-colors"
                          >
                            {row.action === 'retake' ? (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  className="md:w-5 md:h-5"
                                >
                                  <path
                                    d="M14.17 2.5L12.92 3.75L15.42 6.25H10C6.55 6.25 3.75 9.05 3.75 12.5C3.75 15.95 6.55 18.75 10 18.75C13.45 18.75 16.25 15.95 16.25 12.5H14.58C14.58 15.03 12.53 17.08 10 17.08C7.47 17.08 5.42 15.03 5.42 12.5C5.42 9.97 7.47 7.92 10 7.92H15.42L12.92 10.42L14.17 11.67L18.33 7.5L14.17 2.5Z"
                                    fill="white"
                                  />
                                </svg>
                                <span className="text-[12px] md:text-[14px] hidden md:inline">
                                  Retake
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  className="md:w-5 md:h-5"
                                >
                                  <path d="M6.67 4.17V15.83L15.83 10L6.67 4.17Z" fill="white" />
                                </svg>
                                <span className="text-[12px] md:text-[14px] hidden md:inline">
                                  Start
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPage;

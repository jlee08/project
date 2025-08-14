// src/pages/Adimin/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { UserList } from '../../components/layout/Admin/UserList';
import { Sidebar } from '../../components/layout/Admin/Sidebar';
import { LearnList } from '../../components/layout/Admin/LearnList';
import { QuizList } from '../../components/layout/Admin/QuizList';
import { SeedList } from '../../components/layout/Admin/SeedList';
import ChallengeList from '../../components/layout/Admin/ChallengeList';

export default function AdminPage() {
  const [searchParams] = useSearchParams();
  const defaultSection = (searchParams.get('section') as any) || 'Users';
  const [section, setSection] = useState<'Users' | 'Learn' | 'Quiz' | 'Challenge' | 'Seed'>(
    defaultSection
  );

  useEffect(() => {
    const sec = searchParams.get('section') as any;
    if (sec) setSection(sec);
  }, [searchParams]);

  return (
    <div className="flex">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-gray-100 lg:shadow">
        <Sidebar onSelect={sec => setSection(sec)} />
      </div>
      {/* 4) 메인 컨텐츠 */}
      <main className="flex-1 bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6">
          {section === 'Users' && <UserList />}
          {section === 'Learn' && <LearnList />}
          {section === 'Quiz' && <QuizList />}
          {section === 'Challenge' && <ChallengeList />}
          {section === 'Seed' && <SeedList />}
        </div>
      </main>
    </div>
  );
}

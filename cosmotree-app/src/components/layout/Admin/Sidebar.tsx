import { useState } from 'react';

// 사이드바 카테고리 목록을 정의합니다 (각 카테고리에 어울리는 이모지를 추가합니다)
const categoryIcons: Record<string, string> = {
  Users: '👤',
  Learn: '📚',
  Quiz: '❓',
  Challenge: '🏆',
  Seed: '🌱',
};
const categories = ['Users', 'Learn', 'Quiz', 'Challenge', 'Seed'] as const;
type Cat = (typeof categories)[number];

export function Sidebar({ onSelect }: { onSelect: (c: Cat) => void }) {
  const [active, setActive] = useState<Cat>('Users');

  return (
    <div className="h-full w-full bg-gray-100 p-4 overflow-y-auto">
      {categories.map(cat => (
        <div
          key={cat}
          className={`
            p-2 cursor-pointer rounded transition
            ${cat === active ? 'bg-white shadow' : 'hover:bg-gray-200'}
          `}
          onClick={() => {
            setActive(cat);
            onSelect(cat);
          }}
        >
          <span>{categoryIcons[cat]}</span>
          <span className="ml-2 font-medium">{cat}</span>
        </div>
      ))}
    </div>
  );
}

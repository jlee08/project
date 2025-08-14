# Cosmotree - Space Learning Platform

Cosmotree는 우주 탐험과 천문학 학습에 중점을 둔 인터랙티브 교육 플랫폼입니다. React, TypeScript, 그리고 최신 웹 기술로 구축되었습니다.

## 시작하기

### 환경변수 설정

1. 프로젝트 루트에 `.env` 파일을 생성하세요:
```bash
cp .env.example .env
```

2. `.env` 파일에 필요한 API 키를 설정하세요:
```env
# OpenAI API Key (관리자 기능 사용시 필요)
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here

# Firebase Configuration (if needed)
# REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
# REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

⚠️ **보안 주의사항**: `.env` 파일은 절대 Git에 커밋하지 마세요. API 키는 민감한 정보입니다.

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 빌드
npm run build
```

## 주요 기능

- **인터랙티브 대시보드**: 애니메이션 컴포넌트로 학습 진행률 추적
- **커스텀 아이콘 시스템**: Figma 디자인에서 추출한 SVG 아이콘
- **반응형 디자인**: Tailwind CSS를 활용한 모바일 퍼스트 접근
- **부드러운 애니메이션**: 향상된 UX를 위한 Framer Motion

## 🎨 Icon 시스템 사용 가이드

### 사용 가능한 아이콘

| 아이콘명 | 크기 | 설명 | 미리보기 |
|---------|------|------|----------|
| `rocket` | 24x24 | 우주 탐험 테마 | 🚀 |
| `planet` | 27x27 | 행성 요소 | 🪐 |
| `moonStars` | 51x50 | 밤하늘 요소 | 🌙⭐ |
| `book` | 22x27 | 학습 리소스 | 📚 |
| `arrowBack` | 16x16 | 뒤로가기 화살표 | ⬅️ |
| `arrow` | 16x16 | 일반 화살표 | ➡️ |

### 기본 사용법

```tsx
import Icon from '../components/UI/Icon';

// 기본 사용
<Icon name="rocket" size={24} />

// 커스텀 스타일링과 함께
<Icon name="moonStars" size={48} className="text-blue-500" />

// 화살표 회전 (뒤로가기를 앞으로가기로)
<Icon name="arrowBack" size={20} className="rotate-180" />
```

### 고급 사용 예제

```tsx
// 대시보드의 진행률 표시
<div className="bg-white rounded-xl p-4 shadow-sm">
  <Icon name="rocket" size={20} className="text-blue-600" />
</div>

// 카드 장식
<div className="bg-gray-100 rounded-full p-3">
  <Icon name="planet" size={32} />
</div>

// 버튼 아이콘
<button className="flex items-center gap-2">
  <span>Continue Learning</span>
  <Icon name="arrowBack" size={16} className="rotate-180" />
</button>

// 다양한 크기로 사용
<Icon name="book" size={16} />  {/* 작은 크기 */}
<Icon name="book" size={24} />  {/* 중간 크기 */}
<Icon name="book" size={48} />  {/* 큰 크기 */}
```

### Props 옵션

```tsx
interface IconProps {
  name: IconName;           // 필수: 아이콘 이름
  size?: number | string;   // 선택: 크기 (기본값: 24)
  className?: string;       // 선택: CSS 클래스
  alt?: string;            // 선택: 접근성을 위한 alt 텍스트
}
```

### 스타일링 팁

```tsx
// Tailwind CSS 클래스와 함께 사용
<Icon name="moonStars" className="text-yellow-400 hover:text-yellow-500 transition-colors" />

// 애니메이션 효과
<Icon name="rocket" className="animate-pulse" />

// 회전 효과
<Icon name="arrowBack" className="rotate-180 transition-transform hover:rotate-90" />

// 크기 반응형
<Icon name="planet" className="w-6 h-6 md:w-8 md:h-8" />
```

### TypeScript 지원

```tsx
import { IconName, iconInfo } from '../assets/icons';

// 타입 안전한 아이콘 이름 사용
const iconName: IconName = 'rocket';

// 아이콘 메타데이터 접근
const rocketInfo = iconInfo.rocket;
console.log(rocketInfo.description); // "Rocket launch icon for space exploration themes"
```

## 프로젝트 구조

```
src/assets/
├── icons/
│   ├── index.ts           # TypeScript exports와 메타데이터
│   ├── rocket-icon.svg
│   ├── arrow-back.svg
│   ├── moon-stars.svg
│   ├── planet.svg
│   └── book.svg
└── images/
    └── index.ts           # 이미지 exports와 메타데이터

src/components/
├── UI/
│   └── Icon.tsx           # 재사용 가능한 Icon 컴포넌트
└── AssetShowcase.tsx      # 모든 아이콘 데모
```

## 개발 스크립트

### `npm start`

개발 모드에서 앱을 실행합니다.\
[http://localhost:3000](http://localhost:3000)에서 브라우저로 확인할 수 있습니다.

페이지는 편집 시 자동으로 새로고침됩니다.\
콘솔에서 린트 에러도 확인할 수 있습니다.

### `npm test`

인터랙티브 감시 모드에서 테스트를 실행합니다.\
[테스트 실행](https://facebook.github.io/create-react-app/docs/running-tests)에 대한 자세한 정보를 확인하세요.

### `npm run build`

프로덕션용 앱을 `build` 폴더에 빌드합니다.\
프로덕션 모드에서 React를 올바르게 번들링하고 최적의 성능을 위해 빌드를 최적화합니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리
- **Firebase** - 백엔드 서비스
- **Create React App** - 프로젝트 설정

## 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

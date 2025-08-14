---
applyTo: '**'
---

# Cosmotree Development Instructions

## Language Guidelines

### Comments and Logs (Korean)
- All code comments should be written in Korean
- Console logs and error messages should be in Korean
- Variable names and function names should be in English
- Documentation and code explanations should be in Korean

```javascript
// ✅ Good - Korean comments
const fetchUserData = async () => {
  try {
    // 사용자 데이터를 가져옵니다
    const response = await api.get('/users');
    console.log('사용자 데이터 조회 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('사용자 데이터 조회 실패:', error);
    throw error;
  }
};

// ❌ Bad - English comments
const fetchUserData = async () => {
  try {
    // Fetch user data
    const response = await api.get('/users');
    console.log('User data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};
```

### User-Facing Text (English)
- All text displayed to users should be in English
- UI labels, buttons, messages, and notifications should be in English
- Error messages shown to users should be in English
- Form placeholders and validation messages should be in English

```javascript
// ✅ Good - English UI text
const LoginForm = () => {
  return (
    <form>
      <input placeholder="Enter your email" />
      <button>Sign In</button>
      {error && <p>Invalid email or password</p>}
    </form>
  );
};

// ❌ Bad - Korean UI text
const LoginForm = () => {
  return (
    <form>
      <input placeholder="이메일을 입력하세요" />
      <button>로그인</button>
      {error && <p>이메일 또는 비밀번호가 올바르지 않습니다</p>}
    </form>
  );
};
```

## React Component Guidelines

### State Management
- Use clear, descriptive state variable names in English
- Add Korean comments explaining complex state logic
- Use TypeScript interfaces for better type safety

```typescript
// ✅ Good
interface QuizState {
  currentQuestion: number;
  answers: Answer[];
  isSubmitting: boolean;
}

const [quizState, setQuizState] = useState<QuizState>({
  currentQuestion: 0,
  answers: [],
  isSubmitting: false,
});

// 퀴즈 답안을 제출하고 다음 문제로 이동
const handleSubmitAnswer = async (answer: string) => {
  // 제출 중 상태로 변경
  setQuizState(prev => ({ ...prev, isSubmitting: true }));
  
  try {
    // API 호출로 답안 제출
    await submitAnswer(answer);
    console.log('답안 제출 완료');
  } catch (error) {
    console.error('답안 제출 실패:', error);
  } finally {
    setQuizState(prev => ({ ...prev, isSubmitting: false }));
  }
};
```

### Error Handling
- Internal error logging in Korean
- User-facing error messages in English

```typescript
// ✅ Good
const handleApiCall = async () => {
  try {
    const result = await apiCall();
    console.log('API 호출 성공:', result);
  } catch (error) {
    // 개발자용 로그는 한국어
    console.error('API 호출 중 오류 발생:', error);
    
    // 사용자에게 보여지는 메시지는 영어
    toast.error('Something went wrong. Please try again.');
  }
};
```

### API Integration
- Function names and parameters in English
- Comments explaining API logic in Korean
- User feedback messages in English

```typescript
// ✅ Good
const generateAIExplanation = async (
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> => {
  // OpenAI API를 사용하여 설명 생성
  try {
    console.log('AI 설명 생성 시작...');
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      body: JSON.stringify({ question, userAnswer, correctAnswer })
    });
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI 설명 생성 완료');
    
    return data.explanation;
  } catch (error) {
    console.error('AI 설명 생성 중 오류:', error);
    return 'Unable to generate explanation. Please try again later.';
  }
};
```

## File Naming and Structure
- Component files: PascalCase (e.g., `QuizDetail.tsx`)
- Utility files: camelCase (e.g., `apiHelpers.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Firebase Integration
- Collection and field names in English
- Comments explaining Firestore operations in Korean

```typescript
// ✅ Good
const saveQuizResult = async (userId: string, score: number) => {
  try {
    // Firestore에 퀴즈 결과 저장
    await setDoc(doc(db, 'quiz_results', userId), {
      score,
      completedAt: new Date(),
      userId
    });
    
    console.log('퀴즈 결과 저장 완료');
  } catch (error) {
    console.error('퀴즈 결과 저장 실패:', error);
    throw new Error('Failed to save quiz result');
  }
};
```

## Best Practices
1. **Consistency**: Apply these language rules consistently across the entire codebase
2. **Clarity**: Korean comments should be clear and helpful for Korean developers
3. **User Experience**: English UI text should be natural and user-friendly
4. **Maintenance**: Keep both Korean comments and English UI text up to date when making changes

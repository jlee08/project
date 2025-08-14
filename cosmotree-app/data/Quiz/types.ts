export type LessonMeta = {
  id: string
  title: string
  path: string // public 경로 (/Learn/.../Content.md)
}

export type ModuleMeta = {
  id: string
  title: string
  description?: string
  lessons: LessonMeta[]
}

// Quiz 관련 타입들
export type MultipleChoiceQuestion = {
  id: string
  type: 'multiple-choice'
  question: string
  options: string[]
  correctAnswer: number // 정답 인덱스 (0부터 시작)
  explanation?: string
}

export type SubjectiveQuestion = {
  id: string
  type: 'subjective'
  question: string
  sampleAnswer?: string
  explanation?: string
}

export type Question = MultipleChoiceQuestion | SubjectiveQuestion

export type Quiz = {
  moduleId: string
  title: string
  questions: Question[]
}

export type QuizAnswer = {
  questionId: string
  answer: number | string // 객관식: 선택한 옵션 인덱스, 주관식: 텍스트 답안
}

export type QuizResult = {
  moduleId: string
  answers: QuizAnswer[]
  score: number
  totalQuestions: number
  completedAt: Date
}

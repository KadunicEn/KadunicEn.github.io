export interface Question {
  question: string
  category: string
  value: number
  type?: 'audio' | 'picture' | 'video'
  mediaUrl?: string
  solution?: string
}

export interface Category {
  name: string
  questions: Question[]
}

export const TEAM_COLORS = [
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'blue',
  'violet',
  'grape',
  'pink'
] as const

export type TeamColor = (typeof TEAM_COLORS)[number]

export interface TeamConfig {
  name: string
  color: TeamColor
}

export interface QuizConfig {
  title: string
  teams: TeamConfig[]
  categories: Category[]
}

export const STORAGE_KEYS = {
  config: 'jeopardy-quiz-config',
  scores: 'jeopardy-team-scores',
  answeredQuestions: 'jeopardy-question-answered'
} as const

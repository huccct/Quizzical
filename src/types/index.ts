export interface Score {
  score: number
  number: number
  phrase: string
  [key: string]: number | string
}

export interface QuizResult {
  userAnswer: number | null
  isCorrect: boolean
}

export interface NumberResponse {
  text: string
  number: number
  type?: string
  found?: boolean
}

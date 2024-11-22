export interface Score {
  score: number;
  number: number;
  phrase: string;
  [key: string]: number | string;
}

export interface QuizResult {
  userAnswer: number | null;
  isCorrect: boolean;
}
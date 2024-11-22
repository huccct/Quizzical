export interface Score {
  score: number;
  number: number;
  phrase: string;
}

export interface QuizResult {
  userAnswer: number | null;
  isCorrect: boolean;
}
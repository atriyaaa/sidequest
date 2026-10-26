export type Category =
  | "Outdoors"
  | "Slow living"
  | "Creative"
  | "Connection";

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: Category;
  minutes: number;
  xp: number;
  symbol: string;
  color: string;
  steps: string[];
};

export type Memory = {
  questId: string;
  text: string;
  updatedAt: string;
};

export type Progress = {
  saved: string[];
  started: string[];
  completed: string[];
  memories: Record<string, Memory>;
};
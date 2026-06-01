export type ActionType = 'serve' | 'forehand' | 'backhand' | 'smash' | 'drop' | 'net';
export type ActionStatus = 'success' | 'fail' | 'improve';

export interface Action {
  id?: number;
  type: ActionType;
  frame: number;
  score: number;
  status: ActionStatus;
  notes: string;
}

export interface Video {
  id: number;
  title: string;
  filePath: string;
  duration: number;
  description?: string;
  createdAt: string;
}

export interface Analysis {
  id: number;
  videoId: number;
  overallScore: number;
  successRate: number;
  actions: Action[];
  summary: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VideoWithAnalysis extends Video {
  analysis?: Analysis;
}

export interface StatsData {
  totalVideos: number;
  totalAnalyses: number;
  averageScore: number;
  actionStats: {
    type: ActionType;
    count: number;
    successRate: number;
  }[];
  trendData: {
    date: string;
    score: number;
  }[];
}

export interface UploadResponse {
  success: boolean;
  video?: Video;
  error?: string;
}

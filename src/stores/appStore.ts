import { create } from 'zustand';
import { Video, Analysis, StatsData, Action } from '../types';
import { apiService } from '../services/api';

interface AppState {
  videos: Video[];
  analyses: Analysis[];
  currentVideo: Video | null;
  currentAnalysis: Analysis | null;
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;

  fetchVideos: () => Promise<void>;
  fetchAnalyses: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setCurrentVideo: (video: Video | null) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  uploadVideo: (file: File, title: string, description?: string) => Promise<boolean>;
  createAnalysis: (analysis: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Analysis | null>;
  updateAnalysis: (id: number, analysis: Partial<Analysis>) => Promise<boolean>;
  deleteVideo: (id: number) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  videos: [],
  analyses: [],
  currentVideo: null,
  currentAnalysis: null,
  stats: null,
  isLoading: false,
  error: null,

  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const videos = await apiService.getVideos();
      set({ videos, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAnalyses: async () => {
    set({ isLoading: true, error: null });
    try {
      const analyses = await apiService.getAnalyses();
      set({ analyses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiService.getStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentVideo: (video) => set({ currentVideo: video }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  uploadVideo: async (file, title, description) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.uploadVideo(file, title, description);
      if (response.success && response.video) {
        set((state) => ({
          videos: [response.video!, ...state.videos],
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: response.error || 'Upload failed', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  createAnalysis: async (analysisData) => {
    set({ isLoading: true, error: null });
    try {
      const analysis = await apiService.createAnalysis(analysisData);
      set((state) => ({
        analyses: [analysis, ...state.analyses],
        isLoading: false,
      }));
      return analysis;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },

  updateAnalysis: async (id, analysisData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiService.updateAnalysis(id, analysisData);
      set((state) => ({
        analyses: state.analyses.map((a) => (a.id === id ? updated : a)),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  deleteVideo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteVideo(id);
      set((state) => ({
        videos: state.videos.filter((v) => v.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },
}));

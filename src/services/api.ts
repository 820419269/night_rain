import { Video, Analysis, StatsData, UploadResponse, Action } from '../types';

const API_BASE_URL = 'http://localhost:18080/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async uploadVideo(file: File, title: string, description?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const video = await response.json();
      return { success: true, video };
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getVideos(): Promise<Video[]> {
    return this.request<Video[]>('/videos');
  }

  async getVideo(id: number): Promise<Video> {
    return this.request<Video>(`/videos/${id}`);
  }

  async deleteVideo(id: number): Promise<void> {
    await this.request(`/videos/${id}`, { method: 'DELETE' });
  }

  async createAnalysis(analysis: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<Analysis> {
    return this.request<Analysis>('/analyses', {
      method: 'POST',
      body: JSON.stringify(analysis),
    });
  }

  async getAnalyses(): Promise<Analysis[]> {
    return this.request<Analysis[]>('/analyses');
  }

  async getAnalysis(id: number): Promise<Analysis> {
    return this.request<Analysis>(`/analyses/${id}`);
  }

  async updateAnalysis(id: number, analysis: Partial<Analysis>): Promise<Analysis> {
    return this.request<Analysis>(`/analyses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(analysis),
    });
  }

  async getStats(): Promise<StatsData> {
    return this.request<StatsData>('/analyses/stats');
  }

  async exportReport(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/export/${id}`);
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    return response.blob();
  }
}

export const apiService = new ApiService();

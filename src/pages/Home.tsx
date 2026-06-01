import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VideoUploader } from '../components/VideoUploader';
import { VideoCard } from '../components/VideoCard';
import { useStore } from '../stores/appStore';
import { BarChart3, History, Upload } from 'lucide-react';

export const Home = () => {
  const { videos, analyses, fetchVideos, fetchAnalyses } = useStore();

  useEffect(() => {
    fetchVideos();
    fetchAnalyses();
  }, [fetchVideos, fetchAnalyses]);

  const analysesMap = new Map(analyses.map((a) => [a.videoId, a]));
  const recentVideos = videos.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                羽毛球动作分析
              </h1>
              <p className="text-gray-600 mt-1">智能分析您的羽毛球动作，提升训练效率</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                数据统计
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-5 h-5" />
                历史记录
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">上传训练视频</h2>
              </div>
              <VideoUploader />
            </div>

            {recentVideos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">最近分析</h2>
                  </div>
                  <Link
                    to="/history"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      analysis={analysesMap.get(video.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">快速开始</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">上传视频</p>
                    <p className="text-sm text-gray-500">拖拽或选择羽毛球训练视频</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">标注动作</p>
                    <p className="text-sm text-gray-500">手动标注关键动作和帧数</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">查看分析</p>
                    <p className="text-sm text-gray-500">获取评分和训练建议</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">提示</h3>
              <p className="text-blue-100 text-sm">
                建议上传正面和侧面视角的视频，以便更准确地分析动作细节。视频时长控制在
                30秒-2分钟内效果最佳。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

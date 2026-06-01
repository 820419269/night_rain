import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VideoCard } from '../components/VideoCard';
import { useStore } from '../stores/appStore';
import { History, ArrowLeft } from 'lucide-react';

export const HistoryPage = () => {
  const { videos, analyses, fetchVideos, fetchAnalyses } = useStore();

  useEffect(() => {
    fetchVideos();
    fetchAnalyses();
  }, [fetchVideos, fetchAnalyses]);

  const analysesMap = new Map(analyses.map((a) => [a.videoId, a]));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
              <p className="text-gray-600 mt-1">查看所有训练视频和分析记录</p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无历史记录</h3>
            <p className="text-gray-500 mb-6">开始上传第一个训练视频吧</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              上传视频
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                共 <span className="font-semibold text-gray-900">{videos.length}</span> 个视频
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  analysis={analysesMap.get(video.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

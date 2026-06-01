import { Video, Analysis } from '../types';
import { Play, Clock, Calendar, Trash2 } from 'lucide-react';
import { useStore } from '../stores/appStore';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: Video;
  analysis?: Analysis;
}

export const VideoCard = ({ video, analysis }: VideoCardProps) => {
  const navigate = useNavigate();
  const { deleteVideo } = useStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个视频吗？')) {
      await deleteVideo(video.id);
    }
  };

  const handleClick = () => {
    if (analysis) {
      navigate(`/analysis/${analysis.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>

        {analysis && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            已分析
          </div>
        )}

        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">{video.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(video.createdAt)}
          </span>
        </div>

        {analysis && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">综合评分</span>
              <span className="font-bold text-blue-600">{analysis.overallScore.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${analysis.overallScore}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionAnnotator } from '../components/ActionAnnotator';
import { useStore } from '../stores/appStore';
import { Action } from '../types';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Save } from 'lucide-react';

export const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [actions, setActions] = useState<Action[]>([]);
  const [summary, setSummary] = useState('');
  const { videos, analyses, fetchVideos, fetchAnalyses, createAnalysis, updateAnalysis } = useStore();

  useEffect(() => {
    fetchVideos();
    fetchAnalyses();
  }, [fetchVideos, fetchAnalyses]);

  const currentVideo = videos.find((v) => v.id === Number(id));
  const currentAnalysis = analyses.find((a) => a.id === Number(id));

  useEffect(() => {
    if (currentAnalysis) {
      setActions(currentAnalysis.actions);
      setSummary(currentAnalysis.summary);
    }
  }, [currentAnalysis]);

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">视频加载中...</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const calculateOverallScore = () => {
    if (actions.length === 0) return 0;
    const total = actions.reduce((sum, action) => sum + action.score, 0);
    return total / actions.length;
  };

  const calculateSuccessRate = () => {
    if (actions.length === 0) return 0;
    const successCount = actions.filter((a) => a.status === 'success').length;
    return (successCount / actions.length) * 100;
  };

  const handleSave = async () => {
    const overallScore = calculateOverallScore();
    const successRate = calculateSuccessRate();

    const analysisData = {
      videoId: currentVideo.id,
      overallScore,
      successRate,
      actions,
      summary,
    };

    if (currentAnalysis) {
      await updateAnalysis(currentAnalysis.id, analysisData);
    } else {
      await createAnalysis(analysisData);
    }

    alert('分析结果已保存！');
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              保存分析
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative aspect-video bg-gray-900">
                <video
                  ref={videoRef}
                  src={`http://localhost:8080${currentVideo.filePath}`}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentVideo.title}</h2>
                {currentVideo.description && (
                  <p className="text-gray-600">{currentVideo.description}</p>
                )}
              </div>
            </div>

            <ActionAnnotator actions={actions} onActionsChange={setActions} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">分析结果</h3>
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">综合评分</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {calculateOverallScore().toFixed(1)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">动作数量</p>
                    <p className="text-2xl font-bold text-gray-900">{actions.length}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">成功率</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculateSuccessRate().toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">训练总结</h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="输入训练总结和改进建议..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

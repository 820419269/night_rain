import { useState } from 'react';
import { Action, ActionType, ActionStatus } from '../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface ActionAnnotatorProps {
  actions: Action[];
  onActionsChange: (actions: Action[]) => void;
}

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'serve', label: '发球' },
  { value: 'forehand', label: '正手' },
  { value: 'backhand', label: '反手' },
  { value: 'smash', label: '扣杀' },
  { value: 'drop', label: '放网' },
  { value: 'net', label: '网前' },
];

const STATUS_OPTIONS: { value: ActionStatus; label: string; color: string }[] = [
  { value: 'success', label: '成功', color: 'bg-green-100 text-green-800' },
  { value: 'fail', label: '失败', color: 'bg-red-100 text-red-800' },
  { value: 'improve', label: '待改进', color: 'bg-yellow-100 text-yellow-800' },
];

export const ActionAnnotator = ({ actions, onActionsChange }: ActionAnnotatorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: 'serve' as ActionType,
    frame: 0,
    score: 0,
    status: 'success' as ActionStatus,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'serve',
      frame: 0,
      score: 0,
      status: 'success',
      notes: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    const newAction: Action = {
      id: Date.now(),
      ...formData,
    };
    onActionsChange([...actions, newAction]);
    resetForm();
  };

  const handleEdit = (action: Action) => {
    setEditingId(action.id!);
    setFormData({
      type: action.type,
      frame: action.frame,
      score: action.score,
      status: action.status,
      notes: action.notes,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (editingId === null) return;
    const updatedActions = actions.map((a) =>
      a.id === editingId ? { ...a, ...formData } : a
    );
    onActionsChange(updatedActions);
    resetForm();
  };

  const handleDelete = (id: number) => {
    onActionsChange(actions.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">动作标注</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加动作
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              动作类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.type === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                帧数
              </label>
              <input
                type="number"
                value={formData.frame}
                onChange={(e) =>
                  setFormData({ ...formData, frame: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分 (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFormData({ ...formData, status: status.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.status === status.value
                      ? status.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="动作细节和改进建议..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId !== null ? handleUpdate : handleAdd}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId !== null ? '更新' : '添加'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            暂无标注的动作，点击上方按钮添加
          </p>
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {ACTION_TYPES.find((t) => t.value === action.type)?.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_OPTIONS.find((s) => s.value === action.status)?.color
                    }`}>
                      {STATUS_OPTIONS.find((s) => s.value === action.status)?.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      帧: {action.frame}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>评分: <strong className="text-blue-600">{action.score}</strong></span>
                  </div>
                  {action.notes && (
                    <p className="text-sm text-gray-600 mt-2">{action.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(action)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(action.id!)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

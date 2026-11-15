'use client';

import { Trash2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: { _id: string; name: string; avatar: string } | null;
  dueDate?: string | null;
}

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Task['status']) => void;
}

const priorityColor: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusOptions: { value: Task['status']; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskCard({ task, onDelete, onMove }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-default">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
          <button
            onClick={() => onDelete(task._id)}
            className="text-slate-400 hover:text-red-500 flex-shrink-0 mt-0.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={`text-xs px-1.5 py-0 ${priorityColor[task.priority]}`}>
            {task.priority}
          </Badge>
        </div>

        {task.assigneeId && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
            <img
              src={task.assigneeId.avatar}
              alt={task.assigneeId.name}
              className="h-5 w-5 rounded-full"
            />
            <span>{task.assigneeId.name}</span>
          </div>
        )}

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs mb-3 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex gap-1 flex-wrap">
          {statusOptions
            .filter((s) => s.value !== task.status)
            .map((s) => (
              <button
                key={s.value}
                onClick={() => onMove(task._id, s.value)}
                className="text-xs rounded px-2 py-1 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                Move to {s.label}
              </button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

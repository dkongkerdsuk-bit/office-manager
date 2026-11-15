'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { Button } from '@/components/ui/button';

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: { _id: string; name: string; avatar: string } | null;
  dueDate?: string | null;
}

const COLUMNS: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo', label: 'Todo', color: 'border-slate-300 bg-slate-50' },
  { status: 'in_progress', label: 'In Progress', color: 'border-blue-300 bg-blue-50' },
  { status: 'done', label: 'Done', color: 'border-green-300 bg-green-50' },
];

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then(setTasks);
  };

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
  }, [status]);

  const handleAdd = async (data: {
    title: string;
    priority: string;
    assigneeId: string | null;
    dueDate: string | null;
    status: string;
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const handleMove = async (id: string, newStatus: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  if (status === 'loading' || !session) return null;

  return (
    <AppShell title="Tasks">
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ status: colStatus, label, color }) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className={`rounded-lg border-2 ${color} p-4 min-h-[400px]`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
                  <span className="text-xs rounded-full bg-white px-2 py-0.5 text-slate-500 border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>
                <div>
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </AppShell>
  );
}

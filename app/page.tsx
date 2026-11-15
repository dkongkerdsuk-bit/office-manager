'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, ClipboardList, CheckCircle2, Megaphone } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalEmployees: number;
  pendingTasks: number;
  completedThisWeek: number;
  weeklyData: { day: string; completed: number }[];
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: { name: string } | null;
}

interface Announcement {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
}

const priorityColor: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusColor: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

const statusLabel: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/announcements').then((r) => r.json()),
    ]).then(([statsData, tasksData, announcementsData]) => {
      setStats(statsData);
      setTasks(tasksData.slice(0, 8));
      setAnnouncements(announcementsData);
    });
  }, [status]);

  if (status === 'loading' || !session) return null;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <KpiCard
            title="Total Employees"
            value={stats?.totalEmployees ?? '-'}
            icon={Users}
            description="Across all departments"
          />
          <KpiCard
            title="Pending Tasks"
            value={stats?.pendingTasks ?? '-'}
            icon={ClipboardList}
            description="Todo and in progress"
          />
          <KpiCard
            title="Completed This Week"
            value={stats?.completedThisWeek ?? '-'}
            icon={CheckCircle2}
            description="Tasks done in last 7 days"
          />
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {stats && <WeeklyChart data={stats.weeklyData} />}

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-500" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length === 0 && (
                <p className="text-sm text-slate-400">No announcements</p>
              )}
              {announcements.map((a) => (
                <div key={a._id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-slate-700">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Assignee</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No tasks yet
                      </td>
                    </tr>
                  )}
                  {tasks.map((task) => (
                    <tr key={task._id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{task.title}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${statusColor[task.status]}`}>
                          {statusLabel[task.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${priorityColor[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {task.assigneeId?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

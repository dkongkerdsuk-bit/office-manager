import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import Task from '@/lib/models/Task';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const totalEmployees = await Employee.countDocuments();
  const pendingTasks = await Task.countDocuments({ status: { $in: ['todo', 'in_progress'] } });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeek = await Task.countDocuments({
    status: 'done',
    updatedAt: { $gte: oneWeekAgo },
  });

  // Weekly chart data: past 7 days task completions
  const weeklyData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const count = await Task.countDocuments({
      status: 'done',
      updatedAt: { $gte: start, $lte: end },
    });

    weeklyData.push({ day: days[start.getDay()], completed: count });
  }

  return NextResponse.json({
    totalEmployees,
    pendingTasks,
    completedThisWeek,
    weeklyData,
  });
}

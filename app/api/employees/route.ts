import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const employees = await Employee.find({}).sort({ createdAt: -1 });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { name, department, position, email, status } = body;

  if (!name || !department || !position || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await Employee.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  const employee = await Employee.create({ name, department, position, email, status: status || 'active', avatar });
  return NextResponse.json(employee, { status: 201 });
}

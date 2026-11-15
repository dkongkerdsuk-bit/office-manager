import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// Inline schemas for the seed script
const EmployeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  position: String,
  email: { type: String, unique: true },
  avatar: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'todo' },
  priority: { type: String, default: 'medium' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  dueDate: { type: Date, default: null },
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  body: String,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  role: { type: String, default: 'admin' },
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
  const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
  const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // Clear existing data
  await Promise.all([
    Employee.deleteMany({}),
    Task.deleteMany({}),
    Announcement.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin1234', 12);
  await User.create({
    email: 'admin@company.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin',
  });
  console.log('Created admin user');

  // Create employees
  const employeeData = [
    { name: 'Alice Johnson', department: 'Engineering', position: 'Senior Developer', email: 'alice@company.com', status: 'active' },
    { name: 'Bob Martinez', department: 'Engineering', position: 'Frontend Developer', email: 'bob@company.com', status: 'active' },
    { name: 'Carol White', department: 'Engineering', position: 'DevOps Engineer', email: 'carol@company.com', status: 'active' },
    { name: 'David Lee', department: 'Engineering', position: 'Backend Developer', email: 'david@company.com', status: 'inactive' },
    { name: 'Emma Davis', department: 'Marketing', position: 'Marketing Manager', email: 'emma@company.com', status: 'active' },
    { name: 'Frank Wilson', department: 'Marketing', position: 'Content Writer', email: 'frank@company.com', status: 'active' },
    { name: 'Grace Taylor', department: 'Marketing', position: 'SEO Specialist', email: 'grace@company.com', status: 'active' },
    { name: 'Henry Brown', department: 'HR', position: 'HR Manager', email: 'henry@company.com', status: 'active' },
    { name: 'Iris Anderson', department: 'HR', position: 'Recruiter', email: 'iris@company.com', status: 'active' },
    { name: 'Jack Thomas', department: 'HR', position: 'HR Coordinator', email: 'jack@company.com', status: 'inactive' },
  ];

  const employees = await Employee.insertMany(
    employeeData.map((e) => ({
      ...e,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name)}&background=random&color=fff`,
    }))
  );
  console.log(`Created ${employees.length} employees`);

  // Create tasks
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const taskData = [
    { title: 'Set up CI/CD pipeline', status: 'done', priority: 'high', assigneeId: employees[2]._id, dueDate: yesterday },
    { title: 'Redesign landing page', status: 'done', priority: 'high', assigneeId: employees[1]._id, dueDate: yesterday },
    { title: 'Write Q4 blog posts', status: 'done', priority: 'medium', assigneeId: employees[5]._id, dueDate: yesterday },
    { title: 'Migrate to PostgreSQL', status: 'in_progress', priority: 'high', assigneeId: employees[3]._id, dueDate: nextWeek },
    { title: 'Build admin dashboard', status: 'in_progress', priority: 'high', assigneeId: employees[0]._id, dueDate: nextWeek },
    { title: 'Launch social media campaign', status: 'in_progress', priority: 'medium', assigneeId: employees[4]._id, dueDate: nextWeek },
    { title: 'Update employee handbook', status: 'in_progress', priority: 'low', assigneeId: employees[7]._id, dueDate: nextWeek },
    { title: 'Implement dark mode', status: 'todo', priority: 'low', assigneeId: employees[1]._id, dueDate: nextWeek },
    { title: 'Conduct performance reviews', status: 'todo', priority: 'medium', assigneeId: employees[8]._id, dueDate: nextWeek },
    { title: 'Optimize database queries', status: 'todo', priority: 'high', assigneeId: employees[0]._id, dueDate: nextWeek },
    { title: 'Create onboarding materials', status: 'todo', priority: 'medium', assigneeId: employees[8]._id, dueDate: nextWeek },
    { title: 'Fix login page bug', status: 'todo', priority: 'high', assigneeId: employees[2]._id, dueDate: nextWeek },
    { title: 'Keyword research for Q1', status: 'todo', priority: 'low', assigneeId: employees[6]._id, dueDate: nextWeek },
    { title: 'Team building event planning', status: 'todo', priority: 'low', assigneeId: employees[7]._id, dueDate: nextWeek },
    { title: 'API documentation', status: 'todo', priority: 'medium', assigneeId: employees[3]._id, dueDate: nextWeek },
  ];

  // Set updatedAt for done tasks to various days this week for chart data
  const doneTasks = taskData.filter((t) => t.status === 'done');
  const tasksWithDates = taskData.map((task, i) => {
    if (task.status === 'done') {
      const d = new Date();
      d.setDate(d.getDate() - (i % 5));
      return { ...task, updatedAt: d };
    }
    return task;
  });

  await Task.insertMany(tasksWithDates);
  console.log(`Created ${taskData.length} tasks`);

  // Create announcements
  await Announcement.insertMany([
    {
      title: 'Office Closure - Holiday Season',
      body: 'The office will be closed from December 24th through January 1st. Please plan accordingly and ensure all critical tasks are completed before the break.',
    },
    {
      title: 'New Benefits Package Available',
      body: 'We are excited to announce an updated benefits package for all full-time employees starting next quarter. Health, dental, and vision coverage have been expanded.',
    },
    {
      title: 'Q4 All-Hands Meeting',
      body: 'Join us for the Q4 all-hands meeting on December 15th at 2:00 PM. We will review company performance, goals for next year, and answer your questions.',
    },
  ]);
  console.log('Created announcements');

  console.log('\nSeed completed successfully!');
  console.log('Login: admin@company.com / admin1234');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

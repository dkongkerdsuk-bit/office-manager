'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import { EmployeeModal } from '@/components/employees/EmployeeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Employee {
  _id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';
}

const DEPARTMENTS = ['All', 'Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

export default function EmployeesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchEmployees = () => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then(setEmployees);
  };

  useEffect(() => {
    if (status === 'authenticated') fetchEmployees();
  }, [status]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = department === 'All' || e.department === department;
      return matchSearch && matchDept;
    });
  }, [employees, search, department]);

  const handleSave = async (data: { name: string; position: string; department: string; email: string; status: 'active' | 'inactive' }) => {
    if (editEmployee) {
      await fetch(`/api/employees/${editEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    fetchEmployees();
    setEditEmployee(null);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchEmployees();
  };

  if (status === 'loading' || !session) return null;

  return (
    <AppShell title="Employees">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={department} onValueChange={(v) => setDepartment(v ?? 'All')}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setEditEmployee(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Employee
          </Button>
        </div>

        <div className="text-sm text-slate-500">
          {filtered.length} of {employees.length} employees
        </div>

        {deleteConfirm && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            Click Delete again to confirm removal of this employee.
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((emp) => (
              <EmployeeCard
                key={emp._id}
                employee={emp}
                onEdit={(e) => { setEditEmployee(e); setModalOpen(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <EmployeeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEmployee(null); }}
        onSave={handleSave}
        employee={editEmployee}
      />
    </AppShell>
  );
}

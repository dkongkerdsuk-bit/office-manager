'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Employee {
  _id?: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

interface EmployeeFormData {
  name: string;
  position: string;
  department: string;
  email: string;
  status: 'active' | 'inactive';
}

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => Promise<void>;
  employee?: Employee | null;
}

const DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

const defaultForm: EmployeeFormData = {
  name: '',
  position: '',
  department: '',
  email: '',
  status: 'active',
};

export function EmployeeModal({ open, onClose, onSave, employee }: EmployeeModalProps) {
  const [form, setForm] = useState<EmployeeFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        status: employee.status,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [employee, open]);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.position.trim()) newErrors.position = 'Position is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Smith"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              placeholder="Senior Developer"
            />
            {errors.position && <p className="text-xs text-red-500">{errors.position}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select
              value={form.department}
              onValueChange={(v) => setForm((p) => ({ ...p, department: v ?? p.department }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="jane@company.com"
              disabled={!!employee}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: (v ?? p.status) as 'active' | 'inactive' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : employee ? 'Update' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

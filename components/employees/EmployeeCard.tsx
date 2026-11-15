import { Pencil, Trash2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Employee {
  _id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 truncate">{employee.name}</p>
                <p className="text-sm text-slate-500 truncate">{employee.position}</p>
              </div>
              <Badge
                variant={employee.status === 'active' ? 'default' : 'secondary'}
                className={
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : 'bg-slate-100 text-slate-500'
                }
              >
                {employee.status}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                {employee.department}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="h-8 px-3"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(employee._id)}
            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  department: string;
  position: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;

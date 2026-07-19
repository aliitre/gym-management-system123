export type SubscriptionStatus = 'active' | 'expired' | 'suspended';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  pricePaid: number;
  trainerId?: string;
  attendanceCount: number;
  weight?: number; // in kg
  height?: number; // in cm
  age?: number;
  gender: 'male' | 'female';
  goal?: string; // e.g. bulk, lean, strength, fitness
  notes?: string;
  aiPlan?: {
    workout: string;
    nutrition: string;
    generatedAt: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  description: string;
  maxSessions?: number;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experienceYears: number;
  salary: number;
  assignedMembersCount: number;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string; // ISO string
  type: 'check-in' | 'check-out';
}

export interface PaymentLog {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  planName: string;
  type: 'new' | 'renewal';
}

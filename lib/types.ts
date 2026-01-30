
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Team {
  id: string;
  teamName: string;
  teamID: string;
  members: TeamMember[];
  leadEmail: string;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  checkedIn: boolean;
  registeredAt: number;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}
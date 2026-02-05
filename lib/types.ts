
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
  teamname: string;
  teamid: string;
  members: TeamMember[];
  leademail: string;
  paymentstatus: PaymentStatus;
  razorpayorderid?: string;
  razorpaypaymentid?: string;
  checkedin: boolean;
  registeredat: number;
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

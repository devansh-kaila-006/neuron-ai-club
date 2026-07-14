
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

export enum BlogCategory {
  GENERAL = 'General',
  TECHNICAL = 'Technical'
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: BlogCategory;
  author_id: string;
  created_at: string;
  updated_at: string;
  upvotes_count: number;
  user_has_upvoted?: boolean;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export enum CapsuleStatus {
  SUBMITTED = 'submitted',
  GENERATED = 'generated',
  REVIEWED = 'reviewed',
  SEALED = 'sealed',
  DELIVERED = 'delivered'
}

export interface Capsule {
  id: string;
  capsule_code: string;
  enrollment_no: string;
  full_name: string;
  branch: string;
  email: string;
  q1_answer: string; // Who they want to become
  q2_answer: string; // 2030 tech prediction
  q3_answer: string; // Advice to future self (private)
  ai_generated_letter?: string;
  status: CapsuleStatus;
  cohort_year: number; // e.g. 2026
  date_sealed?: string;
  date_delivered?: string;
  created_at: string;
}



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

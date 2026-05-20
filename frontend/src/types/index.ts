import { Role, UserStatus, OrderStatus, AvailabilityStatus, ServiceType, NotificationType, MessageType, DayOfWeek } from './enums';

export interface User {
  id: string;
  wallet_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  is_online: boolean;
  avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  skills?: Skill[];
}

export interface Skill {
  id: number;
  category: number | Category;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProviderProfile {
  id: number;
  user: User;
  bio: string;
  availability_status: AvailabilityStatus;
  reliability: number;
  successful_orders: number;
  failed_orders: number;
  created_at: string;
  skills: ProviderSkill[];
  districts: ProviderDistrict[];
  schedule: ProviderSchedule[];
}

export interface ProviderSkill {
  id: number;
  provider: number;
  skill: Skill;
  service_type: ServiceType;
  experience_years: number;
  price_from: string;
  price_to: string;
  description?: string;
}

export interface ProviderDistrict {
  id: number;
  provider: number;
  district_name: string;
}

export interface ProviderSchedule {
  id: number;
  provider: number;
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export interface ProviderApplication {
  id: number;
  user: User;
  about_me: string;
  why_join: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_note?: string;
  created_at: string;
  updated_at: string;
  skills?: {
    skill_id: number;
    service_type: ServiceType;
    experience_years: number;
    price_from: string;
    price_to: string;
    description?: string;
  }[];
  districts?: string[];
}

export interface Order {
  id: number;
  user: User;
  provider: ProviderProfile;
  skill: Skill | null;
  status: OrderStatus;
  description: string;
  address: string;
  preferred_date?: string | null;
  is_successful?: boolean | null;
  auto_completed: boolean;
  awaiting_confirm_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  order: number | Order;
  reviewer: User;
  reviewee: User;
  skill: Skill | null;
  rating: number;
  comment: string;
  from_role: 'USER' | 'PROVIDER';
  created_at: string;
}

export interface Message {
  id: number;
  order: number;
  sender: User;
  content: string;
  type: MessageType;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  user?: User | null;
  sender?: User | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  is_global: boolean;
  link?: string;
  created_at: string;
}

export interface AdminChat {
  id: number;
  admin: User;
  target_user: User;
  created_at: string;
}

export interface AdminChatMessage {
  id: number;
  chat: number;
  sender: User;
  content: string;
  created_at: string;
}

export type Provider = ProviderProfile;


import {
  User,
  ProviderApplication,
  Order,
  ProviderSchedule
} from './index';
import {
  Role,
  UserStatus,
  OrderStatus,
  ServiceType,
  DayOfWeek,
  NotificationType
} from './enums';

// ==========================================
// Authentication API Contracts
// ==========================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export type RegisterResponse = User;

// ==========================================
// Provider Application & Management Contracts
// ==========================================

export interface ApplyProviderSkillPayload {
  skill_id: number;
  service_type: ServiceType;
  experience_years: number;
  price_from: string;
  price_to: string;
  description?: string;
}

export interface ApplyProviderRequest {
  about_me: string;
  why_join: string;
  districts: string[];
  skills: ApplyProviderSkillPayload[];
}

export type ApplyProviderResponse = ProviderApplication;

export interface UpdateScheduleItem {
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export interface UpdateScheduleRequest {
  schedule: UpdateScheduleItem[];
}

export interface UpdateScheduleResponse {
  schedule: ProviderSchedule[];
}

// ==========================================
// Order API Contracts
// ==========================================

export interface CreateOrderRequest {
  provider_id: number;
  skill_id: number | null;
  description: string;
  address: string;
  preferred_date?: string | null;
}

export type CreateOrderResponse = Order;

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export type UpdateOrderStatusResponse = Order;

// ==========================================
// Super Admin Suite Contracts
// ==========================================

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export type UpdateUserStatusResponse = User;

export interface UpdateUserRoleRequest {
  role: Role;
}

export type UpdateUserRoleResponse = User;

export interface ReviewProviderApplicationRequest {
  status: 'APPROVED' | 'REJECTED';
  rejection_note?: string;
}

export type ReviewProviderApplicationResponse = ProviderApplication;

export interface ResolveDisputeRequest {
  resolution_comment: string;
  refund_to_user: boolean;
}

export interface ResolveDisputeResponse {
  id: number;
  order_id: number;
  resolved_by_id: string;
  resolution_comment: string;
  refund_to_user: boolean;
  resolved_at: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  is_global: boolean;
  user_id?: string | null;
}

export interface BroadcastNotificationResponse {
  success: boolean;
  notification_id?: number;
  message: string;
}

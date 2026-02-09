// Enums
export type UserRole = 'ADMIN' | 'STAFF';

export type WorkOrderStatus = 'CREATED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type MediaType = 'ENTRY_VIDEO_EXTERNAL' | 'ENTRY_VIDEO_INTERNAL' | 'ENTRY_DETAIL_PHOTO' | 'DELIVERY_VIDEO';

export type WorkOrderEventType = 'CREATED' | 'STATUS_CHANGED' | 'MEDIA_ADDED' | 'NOTE_UPDATED' | 'CANCELLED';

export type NotificationType = 'STARTED' | 'READY';
export type NotificationChannel = 'MOCK' | 'WHATSAPP' | 'SMS';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'FAILED';

// Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  plate: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalog {
  id: string;
  name: string;
  price_cents: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  vehicle_id: string;
  customer_id: string;
  status: WorkOrderStatus;
  notes: string | null;
  created_by: string;
  cancelled_by: string | null;
  started_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  customer?: Customer;
  services?: WorkOrderService[];
  media?: Media[];
  events?: WorkOrderEvent[];
}

export interface WorkOrderService {
  id: string;
  work_order_id: string;
  service_id: string;
  quantity: number;
  service?: ServiceCatalog;
}

export interface Media {
  id: string;
  work_order_id: string;
  type: MediaType;
  bucket: string;
  object_key: string;
  mime_type: string;
  size_bytes: number;
  caption: string | null;
  created_by: string;
  created_at: string;
}

export interface WorkOrderEvent {
  id: string;
  work_order_id: string;
  type: WorkOrderEventType;
  from_status: WorkOrderStatus | null;
  to_status: WorkOrderStatus | null;
  message: string | null;
  actor_user_id: string;
  created_at: string;
  actor?: User;
}

export interface NotificationLog {
  id: string;
  work_order_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  to_phone: string;
  payload_json: Record<string, unknown>;
  provider_message_id: string | null;
  status: NotificationStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

// API Payloads
export interface CreateWorkOrderPayload {
  plate: string;
  customer_phone: string;
  customer_name?: string;
  services: { service_id: string; quantity: number }[];
}

export interface StatusTransitionPayload {
  status: WorkOrderStatus;
}

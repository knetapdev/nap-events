// ==================== ENUMS ====================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROMOTER = 'promoter',
  STAFF = 'staff',
  USER = 'user',
}

export enum TicketType {
  FREE = 'free',
  VIP = 'vip',
  GENERAL = 'general',
  EARLY_BIRD = 'early_bird',
}

export enum TicketStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  USED = 'used',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// ==================== INTERFACES ====================

export interface ICompanySettings {
  timezone: string;
  currency: string;
  language: string;
}

export interface ICompany {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  taxId?: string;
  isActive: boolean;
  settings: ICompanySettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventAssignment {
  _id: string;
  userId: string;
  eventId: string;
  role: UserRole;
  permissions: string[];
  assignedBy: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketConfig {
  type: TicketType;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  maxPerUser: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  isActive: boolean;
}

export interface IEvent {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string;
  status: EventStatus;
  ticketConfigs: ITicketConfig[];
  shareableLink: string;
  createdBy: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicket {
  _id: string;
  eventId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  ticketType: TicketType;
  status: TicketStatus;
  qrCode: string;
  checkInTime?: Date;
  checkedInBy?: string;
  price: number;
  purchasedAt: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegistrationLink {
  _id: string;
  eventId: string;
  code: string;
  ticketType: TicketType;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// ==================== PERMISSION TYPES ====================

export const PERMISSIONS = {
  // Company permissions
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',

  // Event permissions
  EVENT_CREATE: 'event:create',
  EVENT_READ: 'event:read',
  EVENT_UPDATE: 'event:update',
  EVENT_DELETE: 'event:delete',
  EVENT_PUBLISH: 'event:publish',

  // Ticket permissions
  TICKET_CREATE: 'ticket:create',
  TICKET_READ: 'ticket:read',
  TICKET_UPDATE: 'ticket:update',
  TICKET_DELETE: 'ticket:delete',
  TICKET_CHECKIN: 'ticket:checkin',

  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ASSIGN: 'user:assign',

  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: [
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_PUBLISH,
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_CHECKIN,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_ASSIGN,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  [UserRole.PROMOTER]: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.REPORT_VIEW,
  ],
  [UserRole.STAFF]: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_CHECKIN,
  ],
  [UserRole.USER]: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.TICKET_READ,
  ],
};

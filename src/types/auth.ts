export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  user_role: "citizen" | "admin" | "moderator";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  address?: Record<string, any>;
  profile_picture_url?: string;
  language_preference: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FraudReport {
  id: string;
  user_id: string;
  report_type: "call" | "sms" | "whatsapp" | "email";
  fraudulent_number: string;
  incident_date: string;
  incident_time?: string;
  description: string;
  fraud_category:
    | "financial_fraud"
    | "impersonation"
    | "lottery_scam"
    | "investment_fraud"
    | "job_fraud"
    | "other";
  evidence_urls?: string[];
  status: "pending" | "under_review" | "verified" | "rejected" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  is_read: boolean;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  error: AuthError | null;
  data?: any;
}

export type UserRole = "citizen" | "admin" | "moderator";

export interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (data: SignInData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (data: UpdatePasswordData) => Promise<AuthResponse>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  deleteAccount: () => Promise<AuthResponse>;
}

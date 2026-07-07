export interface StudentProfile {
  id?: string;
  full_name: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  name: string;
  program: string;
  age?: number;
  parent_id?: string | null;
  profiles?: StudentProfile | null;
  created_at?: string;
}

export interface Payment {
  id?: string;
  student_id: string;
  month: string;
  amount: number;
  status: string;
  payment_method?: string | null;
  receipt_url?: string | null;
  payment_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentResult {
  amount: number;
  status: string;
  payment_method?: string | null;
  payment_date?: string | null;
  receipt_url?: string | null;
}

export interface PayObject {
  amount: number | string;
  month: string;
  payment_method: string;
  payment_date: string | null | undefined;
}

export interface Notification {
  id?: string;
  type?: string;
  title: string;
  message: string;
  action?: string | (() => void) | null;
  created_at?: string;
  read?: boolean;
}

export interface Schedule {
  id: string;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  room?: string | null;
}

export interface LmsMaterial {
  id: string;
  type: string;
  title: string;
  program: string;
  created_at: string;
  description?: string | null;
  file_url?: string | null;
  due_date?: string | null;
}

export interface LmsSubmission {
  id: string;
  material_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  grade?: string | null;
  notes?: string | null;
  students?: {
    name: string;
  } | null;
}

export interface Reward {
  id: string;
  reason: string;
  coins: number;
  created_at: string;
}

export interface LandingSettings {
  landing_faq?: any;
  hero_title?: string;
  hero_subtitle?: string;
  hero_desc?: string;
  hero_image?: string;
  theme?: string;
  maintenance_mode?: boolean;
  allow_public_copy?: string;
  [key: string]: any;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  caption?: string | null;
  image_url: string;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  text: string;
  created_at?: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  module_name: string;
  grade: string;
  tutor_name: string;
  cert_number: string;
  custom_image_url: string;
  report_id: string;
  issue_date: string;
  created_at?: string;
}

export interface Report {
  id: string;
  student_id: string;
  module_name: string;
  speaking_score: number;
  grammar_score: number;
  vocabulary_score: number;
  active_score: number;
  tutor_notes?: string | null;
  created_at: string;
  students?: Student | null;
}





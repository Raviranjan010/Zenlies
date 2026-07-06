timport { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface BasicResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Resume {
  id: number;
  user_id: string;
  title: string;
  resume_text?: string;
  ats_score?: number;
  category?: string;
  resume_json?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_resumes: number;
  avg_score: number;
  best_score: number;
  categories: string[];
  total_analyses: number;
}

export interface DashboardResponse {
  success: boolean;
  user: User;
  stats: DashboardStats;
  recent_activity: {
    id: number;
    title: string;
    ats_score?: number;
    category?: string;
    date: string;
  }[];
}

export interface AnalyzeResumeResponse {
  success: boolean;
  ats_score: number;
  category: string;
  detected_skills: string[];
  missing_keywords: string[];
  suggestions: string[];
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_URL.replace(/\/$/, '')}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: any = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text };
    }

    if (!response.ok || data.success === false) {
      const errorMsg = data.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error on ${path}:`, error);
    throw error;
  }
}

export const api = {
  login: (body: { email: string; password?: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  register: (body: { name?: string; email: string; password?: string }) =>
    request<BasicResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        full_name: body.name,
      }),
    }),

  verifyOtp: (body: { email: string; otp: string }) =>
    request<AuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email,
        otp: body.otp,
        code: body.otp,
      }),
    }),

  resendOtp: (body: { email: string }) =>
    request<BasicResponse>('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<BasicResponse>('/api/auth/logout', {
      method: 'POST',
    }),

  googleLogin: (body: { google_token: string }) =>
    request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        google_token: body.google_token,
        id_token: body.google_token,
      }),
    }),

  getMe: () =>
    request<{ user: User }>('/api/auth/me', {
      method: 'GET',
    }),

  analyzeResume: async (body: FormData): Promise<AnalyzeResumeResponse> => {
    interface BackendAnalysisResponse {
      success: boolean;
      analysis?: {
        ats_score: number;
        category: string;
        skills: string[];
        missing_keywords: string[];
        suggestions: string[];
      };
      error?: string;
    }
    const res = await request<BackendAnalysisResponse>('/api/analyze-resume', {
      method: 'POST',
      body,
    });

    if (res.success && res.analysis) {
      return {
        success: true,
        ats_score: res.analysis.ats_score,
        category: res.analysis.category,
        detected_skills: res.analysis.skills || [],
        missing_keywords: res.analysis.missing_keywords || [],
        suggestions: res.analysis.suggestions || [],
      };
    }

    return {
      success: false,
      error: res.error || 'Failed to analyze resume',
      ats_score: 0,
      category: '',
      detected_skills: [],
      missing_keywords: [],
      suggestions: [],
    };
  },

  getDashboard: () =>
    request<DashboardResponse>('/api/dashboard', {
      method: 'GET',
    }),

  listResumes: () =>
    request<{ success: boolean; resumes: Resume[] }>('/api/resumes', {
      method: 'GET',
    }),

  saveResume: (body: Partial<Resume>) =>
    request<{ success: boolean; resume: Resume }>('/api/resumes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getResume: (id: number) =>
    request<{ success: boolean; resume: Resume }>(`/api/resumes/${id}`, {
      method: 'GET',
    }),

  deleteResume: (id: number) =>
    request<{ success: boolean }>(`/api/resumes/${id}`, {
      method: 'DELETE',
    }),

  generateSummary: (body: {
    professional_title: string;
    stream_or_category?: string;
    skills?: string;
    experience?: string;
    current_summary?: string;
  }) =>
    request<{ success: boolean; summary: string }>('/api/generate-summary', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  enhanceText: (body: { text: string }) =>
    request<{ success: boolean; enhanced_text: string }>('/api/enhance-text', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  downloadDocx: (data: any) =>
    request<{ success: boolean; docx_b64: string }>('/api/download-docx', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

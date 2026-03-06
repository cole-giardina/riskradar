const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const auth = {
  register: (email: string, password: string, displayName?: string) =>
    api<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    }),
  login: (email: string, password: string) =>
    api<{ access_token?: string; user?: User; needs_2fa?: boolean; pending_token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  verify2FA: (code: string, pendingToken: string) =>
    fetch(`${API_BASE}/auth/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({ code }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Invalid code');
      }
      return res.json();
    }) as Promise<{ access_token: string; user: User }>,
};

export const users = {
  me: () => api<User>('/users/me'),
};

export const breach = {
  check: (email: string) =>
    api<{ found: boolean; breach_count: number; breaches: { name: string }[]; message: string }>(
      '/breach/check',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),
};

export const paste = {
  check: (email: string) =>
    api<{ found: boolean; paste_count: number; pastes: { source: string; id: string }[]; message: string }>(
      '/paste/check',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),
};

export const domain = {
  check: (domain: string) =>
    api<{ found: boolean; breach_count: number; breaches: { name: string }[]; message: string }>(
      '/domain/check',
      { method: 'POST', body: JSON.stringify({ domain }) }
    ),
};

export const password = {
  check: (password: string) =>
    api<{
      entropy: number;
      crack_time_display: string;
      strength_score: number;
      feedback: string[];
      is_pwned: boolean | null;
      pwned_count: number;
    }>('/password/check', { method: 'POST', body: JSON.stringify({ password }) }),
  checkReuse: (passwords: string[]) =>
    api<{
      pwned_indices: number[];
      pwned_counts: Record<number, number>;
      duplicate_groups: number[][];
      reuse_detected: boolean;
      any_pwned: boolean;
    }>('/password/check-reuse', { method: 'POST', body: JSON.stringify({ passwords }) }),
};

export const quiz = {
  getQuestions: () =>
    api<{ id: string; question: string; options: string[]; risk_if_no: string }[]>(
      '/quiz/questions'
    ),
  submit: (responses: Record<string, string>) =>
    api<{ score_impact: number; risks_identified: string[]; recommendations: string[] }>(
      '/quiz/submit',
      { method: 'POST', body: JSON.stringify({ responses }) }
    ),
};

export const dashboard = {
  get: () =>
    api<{
      current_score: SecurityScore | null;
      score_history: { score: number; date: string }[];
      risks: string[];
      recommendations: string[];
      percentile: number | null;
      industry_average: number;
    }>('/dashboard'),
  calculate: (data: {
    breach_count: number;
    password_strength: number | null;
    quiz_score: number;
    risks: string[];
    recommendations: string[];
  }) =>
    api<SecurityScore>('/dashboard/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const tips = {
  get: () => api<{ tips: string[] }>('/tips'),
};

export const profile = {
  setup2FA: () => api<{ secret: string; qr_code: string }>('/profile/2fa/setup', { method: 'POST' }),
  verify2FASetup: (code: string) =>
    api<{ enabled: boolean }>('/profile/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  disable2FA: (code: string) =>
    api<{ enabled: boolean }>('/profile/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  updatePublic: (username: string | null, enabled: boolean) =>
    api<{ username: string | null; enabled: boolean }>('/profile/public', {
      method: 'PUT',
      body: JSON.stringify({ username, enabled }),
    }),
};

export const reminders = {
  get: () =>
    api<{ reminders: { id: number; type: string; due_date: string; enabled: boolean }[] }>('/reminders'),
  create: (type: string, daysFromNow?: number) =>
    api<{ id: number; type: string; due_date: string }>('/reminders', {
      method: 'POST',
      body: JSON.stringify({ reminder_type: type, days_from_now: daysFromNow ?? 7 }),
    }),
  delete: (id: number) => api<{ deleted: boolean }>(`/reminders/${id}`, { method: 'DELETE' }),
};

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string;
  totp_enabled?: boolean;
  public_username?: string | null;
  public_profile_enabled?: boolean;
  last_scan_at?: string | null;
}

export interface SecurityScore {
  id: number;
  score: number;
  breach_count: number;
  password_strength: number | null;
  risks: string[];
  recommendations: string[];
  created_at: string;
}

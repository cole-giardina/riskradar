const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

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

export const phishing = {
  analyze: (rawEmail: string) =>
    api<PhishingAnalyzeResponse>('/phishing/analyze', {
      method: 'POST',
      body: JSON.stringify({ raw_email: rawEmail }),
    }),
};

export interface PhishingLinkMismatch {
  anchor_text: string;
  href: string;
  display_domain_guess: string | null;
  href_host: string;
  note: string;
}

export interface PhishingFeatures {
  sender: string | null;
  subject: string | null;
  body_char_count: number;
  body_snippet: string;
  urls: string[];
  unique_registered_domains: string[];
  urgency_keyword_hits: string[];
  link_mismatches: PhishingLinkMismatch[];
  parsing_notes: string[];
}

export interface PhishingDetection {
  verdict: 'phishing' | 'suspicious' | 'safe';
  confidence: number;
  signals: string[];
  explanation: string;
}

export interface PhishingAnalyzeResponse {
  features: PhishingFeatures;
  detection: PhishingDetection;
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

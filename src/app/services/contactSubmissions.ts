const DEFAULT_WP_BASE = 'https://api.ebemglobal.com';

const wpBaseUrl = ((import.meta.env.VITE_WP_BASE_URL as string | undefined) ?? DEFAULT_WP_BASE).replace(/\/+$/, '');

export interface SubmitContactSubmissionInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SubmitContactSubmissionResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
}

export async function submitContactSubmission(input: SubmitContactSubmissionInput): Promise<SubmitContactSubmissionResponse> {
  const response = await fetch(`${wpBaseUrl}/wp-json/custom/v1/contact-submission`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = (payload.message as string | undefined) ?? text ?? 'Unable to submit contact form';
    throw new Error(message);
  }

  return payload as unknown as SubmitContactSubmissionResponse;
}


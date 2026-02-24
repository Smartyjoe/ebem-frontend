const DEFAULT_WP_BASE_URL = 'http://localhost';

const wpBaseUrl = (import.meta.env.VITE_WP_BASE_URL ?? DEFAULT_WP_BASE_URL).replace(/\/+$/, '');

export interface SubmitProductRequestInput {
  title: string;
  description: string;
  name: string;
  email: string;
  file?: File | null;
}

export interface SubmitProductRequestResponse {
  id: number;
  status: string;
  mediaUrl: string | null;
}

export async function submitProductRequest(input: SubmitProductRequestInput): Promise<SubmitProductRequestResponse> {
  const formData = new FormData();
  formData.append('product_title', input.title);
  formData.append('description', input.description);
  formData.append('name', input.name);
  formData.append('email', input.email);

  if (input.file) {
    formData.append('reference_file', input.file);
  }

  const response = await fetch(`${wpBaseUrl}/wp-json/custom/v1/product-request`, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    error?: string;
    id?: number;
    status?: string;
    media_url?: string | null;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Unable to submit product request');
  }

  return {
    id: payload.id ?? 0,
    status: payload.status ?? 'pending',
    mediaUrl: payload.media_url ?? null,
  };
}

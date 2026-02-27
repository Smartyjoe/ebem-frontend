import { useMemo, useState } from 'react';

type ListResponse<T> = {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

type ProductRequestItem = {
  id: number;
  title: string;
  description: string;
  name: string;
  email: string;
  status: string;
  admin_response?: string;
  created_at?: string;
};

type ContactSubmissionItem = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_note?: string;
  created_at?: string;
};

const DEFAULT_WP_BASE = (import.meta.env.VITE_WP_BASE_URL as string | undefined) ?? 'https://api.ebemglobal.com';

function basicToken(username: string, appPassword: string): string {
  return btoa(`${username}:${appPassword}`);
}

export default function RequestTest() {
  const [wpBase, setWpBase] = useState(DEFAULT_WP_BASE);
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState<'products' | 'contacts' | 'create_contact' | null>(null);
  const [error, setError] = useState('');
  const [productRequests, setProductRequests] = useState<ListResponse<ProductRequestItem> | null>(null);
  const [contactSubmissions, setContactSubmissions] = useState<ListResponse<ContactSubmissionItem> | null>(null);
  const [raw, setRaw] = useState('');

  const authHeader = useMemo(() => {
    if (!username.trim() || !appPassword.trim()) return '';
    return `Basic ${basicToken(username.trim(), appPassword.trim())}`;
  }, [appPassword, username]);

  const fetchAdminList = async (path: 'product-requests' | 'contact-submissions') => {
    if (!authHeader) {
      setError('Enter WP username and application password first.');
      return;
    }

    setLoading(path === 'product-requests' ? 'products' : 'contacts');
    setError('');
    setRaw('');
    try {
      const url = `${wpBase.replace(/\/+$/, '')}/wp-json/custom/v1/${path}?page=1&per_page=20`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authHeader,
        },
      });

      const text = await response.text();
      setRaw(text);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText || ''} - ${text}`);
      }

      const json = JSON.parse(text) as ListResponse<ProductRequestItem> | ListResponse<ContactSubmissionItem>;
      if (path === 'product-requests') {
        setProductRequests(json as ListResponse<ProductRequestItem>);
      } else {
        setContactSubmissions(json as ListResponse<ContactSubmissionItem>);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(null);
    }
  };

  const createContactSubmission = async () => {
    setLoading('create_contact');
    setError('');
    setRaw('');
    try {
      const url = `${wpBase.replace(/\/+$/, '')}/wp-json/custom/v1/contact-submission`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Request Test User',
          email: 'request.test@example.com',
          subject: `Contact test ${Date.now()}`,
          message: 'This is a temporary contact submission test payload.',
        }),
      });

      const text = await response.text();
      setRaw(text);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText || ''} - ${text}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create request failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-[#f8f8f6]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Request Test</h1>
        <p className="text-sm text-gray-600 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
          Temporary test page to verify WordPress admin fetch for product requests and contact submissions.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <input
            value={wpBase}
            onChange={(event) => setWpBase(event.target.value)}
            placeholder="WP Base URL"
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="WP Username"
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <input
            value={appPassword}
            onChange={(event) => setAppPassword(event.target.value)}
            placeholder="WP Application Password"
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => { void createContactSubmission(); }}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading === 'create_contact' ? 'Creating...' : 'Create Test Contact Submission'}
          </button>
          <button
            onClick={() => { void fetchAdminList('product-requests'); }}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-black text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading === 'products' ? 'Loading...' : 'Fetch Product Requests'}
          </button>
          <button
            onClick={() => { void fetchAdminList('contact-submissions'); }}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-black text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading === 'contacts' ? 'Loading...' : 'Fetch Contact Submissions'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>Product Requests</h2>
            {!productRequests && <p className="text-sm text-gray-500">No data loaded yet.</p>}
            {productRequests && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Total: {productRequests.total}</p>
                {productRequests.items.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.name} • {item.email}</p>
                    <p className="text-xs mt-1">Status: {item.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>Contact Submissions</h2>
            {!contactSubmissions && <p className="text-sm text-gray-500">No data loaded yet.</p>}
            {contactSubmissions && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Total: {contactSubmissions.total}</p>
                {contactSubmissions.items.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium">{item.subject}</p>
                    <p className="text-xs text-gray-500">{item.name} • {item.email}</p>
                    <p className="text-xs mt-1">Status: {item.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Raw Response</h3>
          <pre className="text-xs whitespace-pre-wrap break-words text-gray-700">{raw || 'No response yet.'}</pre>
        </section>
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton instance of the Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper function to make authenticated requests to our backend
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Check if we have a valid session with access token
  if (!session?.access_token || sessionError) {
    throw new Error('No valid session found');
  }

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-b763bb62${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // If we get an unauthorized error, it might be because the token is expired
    if (response.status === 401) {
      throw new Error('Invalid access token');
    }
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

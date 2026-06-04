'use client';

import { createBrowserClient } from '@supabase/ssr';

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseConfig } from './env';

export function createClient() {
  if (!hasSupabaseConfig) return null;
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig) return null;
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

export const supabase = getSupabaseBrowserClient();

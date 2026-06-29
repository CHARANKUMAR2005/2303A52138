const env = import.meta.env;

export const API_BASE = env.VITE_API_BASE ?? '/evaluation-service';

export const AUTH_CREDENTIALS = {
  email:        env.VITE_AUTH_EMAIL ?? '2303a52138@sru.edu.in',
  name:         env.VITE_AUTH_NAME ?? 'p.charankumar',
  rollNo:       env.VITE_AUTH_ROLL_NO ?? '2303a52138',
  accessCode:   env.VITE_AUTH_ACCESS_CODE ?? 'bDreAq',
  clientID:     env.VITE_AUTH_CLIENT_ID ?? '94ca2bd7-2f3e-4e98-ae26-4006f2057af8',
  clientSecret: env.VITE_AUTH_CLIENT_SECRET ?? 'zfRDNPvEBXzVaNKv',
};

export const PAGE_SIZE = 5;
export const FETCH_LIMIT = 100;

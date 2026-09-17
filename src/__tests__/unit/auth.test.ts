/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, requireAuth, requireRole } from '@/lib/dal/auth';
import * as serverSupabase from '@/lib/supabase/server';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT: ${url}`);
    (err as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  }),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map([['x-pathname', '/patient']])),
}));

describe('Auth DAL - getCurrentUser & requireAuth & requireRole', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn(),
            single: vi.fn(),
          }),
        }),
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    };

    vi.spyOn(serverSupabase, 'createSupabaseServerClient').mockResolvedValue(mockSupabase as any);
  });

  it('should return null when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('should return profile data when profile exists in DB', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'patient@example.com',
          user_metadata: { full_name: 'Jane Doe', role: 'patient' },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'user-123',
              role: 'patient',
              full_name: 'Jane Doe',
              avatar_url: null,
              is_active: true,
            },
            error: null,
          }),
        }),
      }),
    });

    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.id).toBe('user-123');
    expect(user?.role).toBe('patient');
    expect(user?.full_name).toBe('Jane Doe');
  });

  it('should safely construct fallback profile when profiles query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-456',
          email: 'fallback@example.com',
          user_metadata: { full_name: 'Fallback Patient', role: 'patient' },
        },
      },
      error: null,
    });

    // Simulate DB query failure/exception
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockRejectedValue(new Error('DB table not accessible')),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockRejectedValue(new Error('Upsert failed')),
        }),
      }),
    });

    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.id).toBe('user-456');
    expect(user?.role).toBe('patient');
    expect(user?.full_name).toBe('Fallback Patient');
    expect(user?.is_active).toBe(true);
  });

  it('requireAuth should redirect to /login when unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT: /login');
  });

  it('requireRole should return user for matching role without redirecting', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-789',
          email: 'patient@example.com',
          user_metadata: { full_name: 'Patient User', role: 'patient' },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'user-789',
              role: 'patient',
              full_name: 'Patient User',
              avatar_url: null,
              is_active: true,
            },
            error: null,
          }),
        }),
      }),
    });

    const user = await requireRole('patient');
    expect(user.role).toBe('patient');
    expect(user.id).toBe('user-789');
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdmin } from '@/lib/dal/admin';
import * as serverSupabase from '@/lib/supabase/server';

describe('Admin DAL - requireAdmin', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      rpc: vi.fn(),
    };

    vi.spyOn(serverSupabase, 'createSupabaseServerClient').mockResolvedValue(mockSupabase as any);
  });

  it('should pass without throwing if user is an admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-123' } } });
    mockSupabase.rpc.mockResolvedValue({ data: 'admin', error: null });

    // Should not throw
    await expect(requireAdmin()).resolves.toBeUndefined();
    expect(mockSupabase.auth.getUser).toHaveBeenCalledOnce();
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_role');
  });

  it('should throw "Unauthorized" if no user is found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    await expect(requireAdmin()).rejects.toThrow('Unauthorized');
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('should throw "Forbidden: Admin access required" if user is not an admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'patient-123' } } });
    // Mock the RPC returning 'patient' instead of 'admin'
    mockSupabase.rpc.mockResolvedValue({ data: 'patient', error: null });

    await expect(requireAdmin()).rejects.toThrow('Forbidden: Admin access required');
  });

  it('should throw "Forbidden: Admin access required" if rpc returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'patient-123' } } });
    // Mock the RPC returning an error
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('RPC failed') });

    await expect(requireAdmin()).rejects.toThrow('Forbidden: Admin access required');
  });
});

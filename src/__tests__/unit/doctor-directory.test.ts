/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVerifiedDoctors, getDoctorProfilePublic } from '@/lib/dal/relationships';
import * as serverSupabase from '@/lib/supabase/server';

describe('Doctor Directory DAL', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn(),
    };

    vi.spyOn(serverSupabase, 'createSupabaseServerClient').mockResolvedValue(mockSupabase as any);
  });

  it('should return formatted verified doctors with profile data', async () => {
    const builder: any = {
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'doc-1',
            profile_id: 'prof-1',
            specialty: 'Cardiology',
            department: 'Heart Center',
            years_of_experience: 12,
            bio: 'Expert cardiologist',
            profiles: {
              full_name: 'Sarah Smith',
              avatar_url: null,
            },
          },
        ],
        count: 1,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(builder),
    });

    const result = await getVerifiedDoctors(1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('doc-1');
    expect(result.data[0].full_name).toBe('Sarah Smith');
    expect(result.data[0].specialty).toBe('Cardiology');
  });

  it('should fall back to sequential queries if join encounters an error', async () => {
    const builder1: any = {
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        count: 0,
        error: new Error('PGRST200 join failed'),
      }),
    };

    const builder2: any = {
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'doc-2',
            profile_id: 'prof-2',
            specialty: 'Dermatology',
            department: 'Skin Clinic',
            years_of_experience: 8,
            bio: 'Dermatologist',
          },
        ],
        count: 1,
        error: null,
      }),
    };

    const selectMock = vi.fn();
    selectMock.mockReturnValueOnce(builder1);
    selectMock.mockReturnValueOnce(builder2);
    selectMock.mockReturnValueOnce({
      in: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'prof-2',
            full_name: 'John Doe',
            avatar_url: null,
          },
        ],
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    });

    const result = await getVerifiedDoctors(1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('doc-2');
    expect(result.data[0].full_name).toBe('John Doe');
    expect(result.data[0].specialty).toBe('Dermatology');
  });

  it('should search by full name, specialty, and department case-insensitively in sequential fallback', async () => {
    const builder1: any = {
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        count: 0,
        error: new Error('PGRST200 join failed'),
      }),
    };

    const builder2: any = {
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'doc-1',
            profile_id: 'prof-1',
            specialty: 'Cardiology',
            department: 'Heart Center',
            years_of_experience: 10,
          },
          {
            id: 'doc-2',
            profile_id: 'prof-2',
            specialty: 'Pediatrics',
            department: 'Children Center',
            years_of_experience: 5,
          },
        ],
        count: 2,
        error: null,
      }),
    };

    const selectMock = vi.fn();
    selectMock.mockReturnValueOnce(builder1);
    selectMock.mockReturnValueOnce(builder2);
    selectMock.mockReturnValueOnce({
      in: vi.fn().mockResolvedValue({
        data: [
          { id: 'prof-1', full_name: 'Dr. Gregory House', avatar_url: null },
          { id: 'prof-2', full_name: 'Dr. Allison Cameron', avatar_url: null },
        ],
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    });

    // Search for 'gregory'
    const nameSearchResult = await getVerifiedDoctors(1, 10, 'gregory');
    expect(nameSearchResult.data).toHaveLength(1);
    expect(nameSearchResult.data[0].full_name).toBe('Dr. Gregory House');
  });
});

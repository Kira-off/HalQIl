import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';
import { Role, UserStatus } from '@/src/types/enums';
import { User } from '@/src/types';

const mockUser: User = {
  id: 'user-123',
  wallet_id: 'wallet-123',
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  email: 'john@example.com',
  role: Role.USER,
  status: UserStatus.ACTIVE,
  is_online: true,
  avatar: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('authSlice', () => {
  beforeEach(() => {
    // Reset state before each test
    useAppStore.setState({
      user: null,
      role: null,
    });
  });

  it('should initialize with null user and role', () => {
    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });

  it('should update user and role on setUser', () => {
    useAppStore.getState().setUser(mockUser);

    const state = useAppStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.role).toBe(Role.USER);
  });

  it('should clear user and role on clearUser', () => {
    useAppStore.getState().setUser(mockUser);
    useAppStore.getState().clearUser();

    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });

  it('should support switching role with setRole', () => {
    useAppStore.getState().setUser(mockUser);
    useAppStore.getState().setRole(Role.PROVIDER);

    expect(useAppStore.getState().role).toBe(Role.PROVIDER);

    useAppStore.getState().setRole(Role.SUPER_ADMIN);
    expect(useAppStore.getState().role).toBe(Role.SUPER_ADMIN);

    useAppStore.getState().setRole(null);
    expect(useAppStore.getState().role).toBeNull();
  });
});

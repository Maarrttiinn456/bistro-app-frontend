import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/src/api/generated/model';
import {
    clearSession,
    getAccessToken,
    saveSession,
} from '@/src/auth/authStorage';

jest.mock('expo-secure-store', () => ({
    deleteItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}));

const mockedSecureStore = jest.mocked(SecureStore);

const session: Session = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'bearer',
};

describe('authStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves the serialized session', async () => {
        await saveSession(session);

        expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
            'auth-session',
            JSON.stringify(session),
        );
    });

    it('clears the saved session', async () => {
        await clearSession();

        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
            'auth-session',
        );
    });

    it('returns the access token from a saved session', async () => {
        mockedSecureStore.getItemAsync.mockResolvedValue(
            JSON.stringify(session),
        );

        await expect(getAccessToken()).resolves.toBe('access-token');
    });

    it('returns null when no session is saved', async () => {
        mockedSecureStore.getItemAsync.mockResolvedValue(null);

        await expect(getAccessToken()).resolves.toBeNull();
    });

    it('returns null when the saved session cannot be parsed', async () => {
        mockedSecureStore.getItemAsync.mockResolvedValue('not-json');

        await expect(getAccessToken()).resolves.toBeNull();
    });
});

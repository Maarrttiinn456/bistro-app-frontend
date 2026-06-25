import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Session } from '@/src/api/generated/model';

const AUTH_SESSION_KEY = 'auth-session';

export const saveSession = async (session: Session) => {
    const serializedSession = JSON.stringify(session);

    if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_SESSION_KEY, serializedSession);
        return;
    }

    await SecureStore.setItemAsync(AUTH_SESSION_KEY, serializedSession);
};

const getSession = async (): Promise<Session | null> => {
    const serializedSession =
        Platform.OS === 'web'
            ? localStorage.getItem(AUTH_SESSION_KEY)
            : await SecureStore.getItemAsync(AUTH_SESSION_KEY);

    if (serializedSession === null) {
        return null;
    }

    try {
        return JSON.parse(serializedSession) as Session;
    } catch {
        return null;
    }
};

export const getAccessToken = async () => {
    const session = await getSession();

    return session?.accessToken ?? null;
};

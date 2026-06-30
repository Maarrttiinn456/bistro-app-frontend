import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import {
    login as loginRequest,
    logout as logoutRequest,
    signUp as signUpRequest,
} from '@/src/api/generated/auth/auth';
import type {
    AuthContext as BackendAuthContext,
    LoginBody,
    SignUpBody,
} from '@/src/api/generated/model';
import { AuthProvider } from '@/src/auth/AuthProvider';
import { clearSession, saveSession } from '@/src/auth/authStorage';
import { useAuth } from '@/src/auth/useAuth';

jest.mock('@/src/api/generated/auth/auth', () => ({
    login: jest.fn(),
    logout: jest.fn(),
    signUp: jest.fn(),
}));

jest.mock('@/src/auth/authStorage', () => ({
    clearSession: jest.fn(),
    saveSession: jest.fn(),
}));

const mockedLoginRequest = jest.mocked(loginRequest);
const mockedLogoutRequest = jest.mocked(logoutRequest);
const mockedSignUpRequest = jest.mocked(signUpRequest);
const mockedClearSession = jest.mocked(clearSession);
const mockedSaveSession = jest.mocked(saveSession);

const loginCredentials: LoginBody = {
    email: 'martin@example.com',
    password: 'password',
};

const registerCredentials: SignUpBody = {
    email: 'martin@example.com',
    name: 'Martin',
    password: 'password',
};

const authContext: BackendAuthContext = {
    activeHousehold: null,
    households: [],
    profile: {
        activeHouseholdId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        email: 'martin@example.com',
        goalCarbs: 200,
        goalFat: 70,
        goalKcal: 2200,
        goalProtein: 140,
        id: 'profile-1',
        name: 'Martin',
    },
    session: {
        accessToken: 'access-token',
        expiresIn: 3600,
        refreshToken: 'refresh-token',
        tokenType: 'bearer',
    },
    user: {
        email: 'martin@example.com',
        id: 'user-1',
    },
};

const AuthStateProbe = () => {
    const auth = useAuth();

    const handleLogin = () => {
        void auth.login(loginCredentials).catch(() => undefined);
    };

    const handleRegister = () => {
        void auth.register(registerCredentials).catch(() => undefined);
    };

    const handleLogout = () => {
        void auth.logout().catch(() => undefined);
    };

    return (
        <>
            <Text testID="is-authenticated">
                {String(auth.isAuthenticated)}
            </Text>
            <Text testID="profile-name">{auth.profile?.name ?? 'none'}</Text>
            <Text testID="login-loading">{String(auth.isLoggingIn)}</Text>
            <Text testID="login-error">
                {auth.loginError?.message ?? 'none'}
            </Text>
            <Text testID="register-error">
                {auth.registerError?.message ?? 'none'}
            </Text>
            <Text testID="logout-error">
                {auth.logoutError?.message ?? 'none'}
            </Text>
            <Pressable accessibilityRole="button" onPress={handleLogin}>
                <Text>Login</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleRegister}>
                <Text>Register</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleLogout}>
                <Text>Logout</Text>
            </Pressable>
        </>
    );
};

const renderAuthProvider = () => {
    return render(
        <AuthProvider>
            <AuthStateProbe />
        </AuthProvider>,
    );
};

describe('AuthProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('logs in, stores the session and exposes the profile', async () => {
        const user = userEvent.setup();
        mockedLoginRequest.mockResolvedValue(authContext);

        await renderAuthProvider();

        await user.press(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
                'true',
            );
        });
        expect(mockedLoginRequest).toHaveBeenCalledWith(loginCredentials);
        expect(mockedSaveSession).toHaveBeenCalledWith(authContext.session);
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Martin');
    });

    it('keeps the user unauthenticated and exposes a login error on failure', async () => {
        const user = userEvent.setup();
        mockedLoginRequest.mockRejectedValue(new Error('Login failed'));

        await renderAuthProvider();

        await user.press(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByTestId('login-error')).toHaveTextContent(
                'Login failed',
            );
        });
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'false',
        );
        expect(screen.getByTestId('login-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('profile-name')).toHaveTextContent('none');
    });

    it('registers, stores the session and exposes the profile', async () => {
        const user = userEvent.setup();
        mockedSignUpRequest.mockResolvedValue(authContext);

        await renderAuthProvider();

        await user.press(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
                'true',
            );
        });
        expect(mockedSignUpRequest).toHaveBeenCalledWith(registerCredentials);
        expect(mockedSaveSession).toHaveBeenCalledWith(authContext.session);
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Martin');
    });

    it('logs out, clears the session and resets auth state', async () => {
        const user = userEvent.setup();
        mockedLoginRequest.mockResolvedValue(authContext);
        mockedLogoutRequest.mockResolvedValue({ success: true });

        await renderAuthProvider();

        await user.press(screen.getByRole('button', { name: 'Login' }));
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
                'true',
            );
        });

        await user.press(screen.getByRole('button', { name: 'Logout' }));

        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
                'false',
            );
        });
        expect(mockedLogoutRequest).toHaveBeenCalledTimes(1);
        expect(mockedClearSession).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('profile-name')).toHaveTextContent('none');
    });

    it('keeps auth state when logout fails', async () => {
        const user = userEvent.setup();
        mockedLoginRequest.mockResolvedValue(authContext);
        mockedLogoutRequest.mockRejectedValue(new Error('Logout failed'));

        await renderAuthProvider();

        await user.press(screen.getByRole('button', { name: 'Login' }));
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
                'true',
            );
        });

        await user.press(screen.getByRole('button', { name: 'Logout' }));

        await waitFor(() => {
            expect(screen.getByTestId('logout-error')).toHaveTextContent(
                'Logout failed',
            );
        });
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'true',
        );
        expect(mockedClearSession).not.toHaveBeenCalled();
    });
});

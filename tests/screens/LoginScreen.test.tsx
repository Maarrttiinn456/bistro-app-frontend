import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuth } from '@/src/auth/useAuth';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock('@/src/auth/useAuth', () => ({
    useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

const createAuthValue = (
    overrides: Partial<ReturnType<typeof useAuth>> = {},
): ReturnType<typeof useAuth> => ({
    isAuthenticated: false,
    isLoggingIn: false,
    isLoggingInWithDevToken: false,
    isLoggingOut: false,
    isRestoringSession: false,
    isRegistering: false,
    devLoginError: null,
    login: jest.fn<ReturnType<typeof useAuth>['login']>(),
    loginError: null,
    loginWithDevToken:
        jest.fn<ReturnType<typeof useAuth>['loginWithDevToken']>(),
    logout: jest.fn<ReturnType<typeof useAuth>['logout']>(),
    logoutError: null,
    profile: null,
    register: jest.fn<ReturnType<typeof useAuth>['register']>(),
    registerError: null,
    setIsAuthenticated:
        jest.fn<ReturnType<typeof useAuth>['setIsAuthenticated']>(),
    ...overrides,
});

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN;
        mockedUseAuth.mockReturnValue(createAuthValue());
    });

    it('shows a validation error and does not call login when fields are empty', async () => {
        const user = userEvent.setup();
        const login = jest.fn<ReturnType<typeof useAuth>['login']>();
        mockedUseAuth.mockReturnValue(createAuthValue({ login }));

        await render(<LoginScreen />);

        await user.press(screen.getByRole('button'));

        expect(login).not.toHaveBeenCalled();
        expect(screen.getByText(/e-mail i heslo/)).toBeOnTheScreen();
    });

    it('trims email and passes credentials to login', async () => {
        const user = userEvent.setup();
        const login =
            jest.fn<ReturnType<typeof useAuth>['login']>().mockResolvedValue(
                undefined,
            );
        mockedUseAuth.mockReturnValue(createAuthValue({ login }));

        await render(<LoginScreen />);

        await user.type(screen.getByLabelText('E-mail'), '  a@bistro.test  ');
        await user.type(screen.getByLabelText('Heslo'), 'secret');
        await user.press(screen.getByRole('button'));

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith({
                email: 'a@bistro.test',
                password: 'secret',
            });
        });
    });

    it('disables the submit button while logging in', async () => {
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                isLoggingIn: true,
            }),
        );

        await render(<LoginScreen />);

        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText(/ihla.*uji/i)).toBeOnTheScreen();
    });

    it('shows a backend login error', async () => {
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                loginError: new Error('Invalid credentials'),
            }),
        );

        await render(<LoginScreen />);

        expect(screen.getByText(/e-mail a heslo/)).toBeOnTheScreen();
    });

    it('does not show the demo login button without a dev auth token', async () => {
        await render(<LoginScreen />);

        expect(
            screen.queryByRole('button', { name: 'Přihlásit jako demo' }),
        ).not.toBeOnTheScreen();
    });

    it('calls dev login when the demo login button is pressed', async () => {
        const user = userEvent.setup();
        const loginWithDevToken =
            jest
                .fn<ReturnType<typeof useAuth>['loginWithDevToken']>()
                .mockResolvedValue(undefined);
        process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN = 'dev-token';
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                loginWithDevToken,
            }),
        );

        await render(<LoginScreen />);

        await user.press(
            screen.getByRole('button', { name: 'Přihlásit jako demo' }),
        );

        expect(loginWithDevToken).toHaveBeenCalledTimes(1);
    });

    it('disables the demo login button while dev login is running', async () => {
        process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN = 'dev-token';
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                isLoggingInWithDevToken: true,
            }),
        );

        await render(<LoginScreen />);

        expect(
            screen.getByRole('button', { name: 'Přihlašuji demo...' }),
        ).toBeDisabled();
    });
});

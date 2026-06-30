import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import RegisterScreen from '@/app/(auth)/register';
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
    ...overrides,
});

describe('RegisterScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAuth.mockReturnValue(createAuthValue());
    });

    it('shows a validation error and does not call register when fields are empty', async () => {
        const user = userEvent.setup();
        const register = jest.fn<ReturnType<typeof useAuth>['register']>();
        mockedUseAuth.mockReturnValue(createAuthValue({ register }));

        await render(<RegisterScreen />);

        await user.press(screen.getByRole('button'));

        expect(register).not.toHaveBeenCalled();
        expect(screen.getByText(/e-mail i heslo/)).toBeOnTheScreen();
    });

    it('requires a password with at least six characters', async () => {
        const user = userEvent.setup();
        const register = jest.fn<ReturnType<typeof useAuth>['register']>();
        mockedUseAuth.mockReturnValue(createAuthValue({ register }));

        await render(<RegisterScreen />);

        await user.type(screen.getByLabelText('Jméno'), 'Martin');
        await user.type(screen.getByLabelText('E-mail'), 'martin@test.dev');
        await user.type(screen.getByLabelText('Heslo'), '12345');
        await user.press(screen.getByRole('button'));

        expect(register).not.toHaveBeenCalled();
        expect(screen.getByText(/6 znak/)).toBeOnTheScreen();
    });

    it('trims name and email and passes credentials to register', async () => {
        const user = userEvent.setup();
        const register =
            jest
                .fn<ReturnType<typeof useAuth>['register']>()
                .mockResolvedValue(undefined);
        mockedUseAuth.mockReturnValue(createAuthValue({ register }));

        await render(<RegisterScreen />);

        await user.type(screen.getByLabelText('Jméno'), '  Martin  ');
        await user.type(
            screen.getByLabelText('E-mail'),
            '  martin@test.dev  ',
        );
        await user.type(screen.getByLabelText('Heslo'), 'secret');
        await user.press(screen.getByRole('button'));

        await waitFor(() => {
            expect(register).toHaveBeenCalledWith({
                email: 'martin@test.dev',
                name: 'Martin',
                password: 'secret',
            });
        });
    });

    it('disables the submit button while registering', async () => {
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                isRegistering: true,
            }),
        );

        await render(<RegisterScreen />);

        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText(/Registruji/)).toBeOnTheScreen();
    });

    it('shows a backend register error', async () => {
        mockedUseAuth.mockReturnValue(
            createAuthValue({
                registerError: new Error('Registration failed'),
            }),
        );

        await render(<RegisterScreen />);

        expect(screen.getByText(/Registrace se nepovedla/)).toBeOnTheScreen();
    });
});

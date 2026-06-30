import {
    createContext,
    type ReactNode,
    useEffect,
    useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    getMe,
    login as loginRequest,
    logout as logoutRequest,
    signUp as signUpRequest,
} from '@/src/api/generated/auth/auth';
import type {
    AuthContext as BackendAuthContext,
    LoginBody,
    Profile,
    SignUpBody,
} from '@/src/api/generated/model';
import { clearSession, getSession, saveSession } from '@/src/auth/authStorage';

type AuthContextValue = {
    isAuthenticated: boolean;
    profile: Profile | null;
    isRestoringSession: boolean;
    login: (credentials: LoginBody) => Promise<void>;
    isLoggingIn: boolean;
    loginError: Error | null;
    loginWithDevToken: () => Promise<void>;
    isLoggingInWithDevToken: boolean;
    devLoginError: Error | null;
    register: (credentials: SignUpBody) => Promise<void>;
    isRegistering: boolean;
    registerError: Error | null;
    logout: () => Promise<void>;
    isLoggingOut: boolean;
    logoutError: Error | null;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const queryClient = useQueryClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isRestoringSession, setIsRestoringSession] = useState(true);

    const isAuthenticated = profile !== null;

    const resetAuthState = () => {
        setProfile(null);
    };

    const saveAuthContext = async (authContext: BackendAuthContext) => {
        if (!authContext.session.accessToken) {
            throw new Error('Auth response does not contain an access token');
        }

        await saveSession(authContext.session);
        setProfile(authContext.profile);
    };

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const session = await getSession();

                if (!session?.accessToken) {
                    return;
                }

                const authContext = await getMe();

                setProfile(authContext.profile);
            } catch {
                await clearSession();
                resetAuthState();
            } finally {
                setIsRestoringSession(false);
            }
        };

        void restoreSession();
    }, []);

    const getDevAuthToken = () => {
        return process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN?.trim() ?? '';
    };

    const loginMutation = useMutation<void, Error, LoginBody>({
        mutationFn: async (credentials) => {
            const authContext = await loginRequest(credentials);

            await saveAuthContext(authContext);
        },
        onError: resetAuthState,
    });

    const devLoginMutation = useMutation<void, Error>({
        mutationFn: async () => {
            const devAuthToken = getDevAuthToken();

            if (!devAuthToken) {
                throw new Error('Dev auth token is not configured');
            }

            await saveSession({
                accessToken: devAuthToken,
                expiresIn: null,
                refreshToken: null,
                tokenType: 'bearer',
            });

            const authContext = await getMe();

            setProfile(authContext.profile);
        },
        onError: async () => {
            await clearSession();
            resetAuthState();
        },
    });

    const registerMutation = useMutation<void, Error, SignUpBody>({
        mutationFn: async (credentials) => {
            const authContext = await signUpRequest(credentials);

            await saveAuthContext(authContext);
        },
        onError: resetAuthState,
    });

    const logoutMutation = useMutation<void, Error>({
        mutationFn: async () => {
            const session = await getSession();
            const devAuthToken = getDevAuthToken();
            const isDevSession =
                Boolean(devAuthToken) && session?.accessToken === devAuthToken;

            if (!isDevSession) {
                await logoutRequest();
            }

            await clearSession();
            resetAuthState();
            queryClient.removeQueries();
        },
    });

    const login = async (credentials: LoginBody) => {
        await loginMutation.mutateAsync(credentials);
    };

    const loginWithDevToken = async () => {
        await devLoginMutation.mutateAsync();
    };

    const register = async (credentials: SignUpBody) => {
        await registerMutation.mutateAsync(credentials);
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                profile,
                isRestoringSession,
                login,
                isLoggingIn: loginMutation.isPending,
                loginError: loginMutation.error,
                loginWithDevToken,
                isLoggingInWithDevToken: devLoginMutation.isPending,
                devLoginError: devLoginMutation.error,
                register,
                isRegistering: registerMutation.isPending,
                registerError: registerMutation.error,
                logout,
                isLoggingOut: logoutMutation.isPending,
                logoutError: logoutMutation.error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useEffect,
    useState,
} from 'react';

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
    Session,
    SignUpBody,
} from '@/src/api/generated/model';
import { clearSession, getSession, saveSession } from '@/src/auth/authStorage';

type AuthContextValue = {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<Error | null>(null);
    const [isLoggingInWithDevToken, setIsLoggingInWithDevToken] =
        useState(false);
    const [devLoginError, setDevLoginError] = useState<Error | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<Error | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<Error | null>(null);

    const applyUserContext = (authContext: BackendAuthContext) => {
        setProfile(authContext.profile);
        setIsAuthenticated(true);
    };

    const saveAuthContext = async (authContext: BackendAuthContext) => {
        if (authContext.session.accessToken === null) {
            throw new Error('Auth response does not contain an access token');
        }

        await saveSession(authContext.session);
        applyUserContext(authContext);
    };

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const session = await getSession();

                if (session?.accessToken === null || !session?.accessToken) {
                    return;
                }

                const authContext = await getMe();

                if (isMounted) {
                    applyUserContext(authContext);
                }
            } catch {
                await clearSession();

                if (isMounted) {
                    setProfile(null);
                    setIsAuthenticated(false);
                }
            } finally {
                if (isMounted) {
                    setIsRestoringSession(false);
                }
            }
        };

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const createDevSession = (accessToken: string): Session => ({
        accessToken,
        expiresIn: null,
        refreshToken: null,
        tokenType: 'bearer',
    });

    const getDevAuthToken = () => {
        return process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN?.trim() ?? '';
    };

    const login = async (credentials: LoginBody) => {
        setLoginError(null);
        setIsLoggingIn(true);

        try {
            const authContext = await loginRequest(credentials);

            await saveAuthContext(authContext);
        } catch (error) {
            const loginFailure =
                error instanceof Error
                    ? error
                    : new Error('Login failed unexpectedly');

            setProfile(null);
            setIsAuthenticated(false);
            setLoginError(loginFailure);

            throw loginFailure;
        } finally {
            setIsLoggingIn(false);
        }
    };

    const loginWithDevToken = async () => {
        setDevLoginError(null);
        setIsLoggingInWithDevToken(true);

        const devAuthToken = getDevAuthToken();

        try {
            if (!devAuthToken) {
                throw new Error('Dev auth token is not configured');
            }

            await saveSession(createDevSession(devAuthToken));

            const authContext = await getMe();

            applyUserContext(authContext);
        } catch (error) {
            await clearSession();

            const devLoginFailure =
                error instanceof Error
                    ? error
                    : new Error('Dev login failed unexpectedly');

            setProfile(null);
            setIsAuthenticated(false);
            setDevLoginError(devLoginFailure);

            throw devLoginFailure;
        } finally {
            setIsLoggingInWithDevToken(false);
        }
    };

    const register = async (credentials: SignUpBody) => {
        setRegisterError(null);
        setIsRegistering(true);

        try {
            const authContext = await signUpRequest(credentials);

            await saveAuthContext(authContext);
        } catch (error) {
            const registerFailure =
                error instanceof Error
                    ? error
                    : new Error('Register failed unexpectedly');

            setProfile(null);
            setIsAuthenticated(false);
            setRegisterError(registerFailure);

            throw registerFailure;
        } finally {
            setIsRegistering(false);
        }
    };

    const logout = async () => {
        setLogoutError(null);
        setIsLoggingOut(true);

        try {
            const session = await getSession();
            const devAuthToken = getDevAuthToken();
            const isDevSession =
                devAuthToken.length > 0 && session?.accessToken === devAuthToken;

            if (!isDevSession) {
                await logoutRequest();
            }

            await clearSession();
            setProfile(null);
            setIsAuthenticated(false);
        } catch (error) {
            const logoutFailure =
                error instanceof Error
                    ? error
                    : new Error('Logout failed unexpectedly');

            setLogoutError(logoutFailure);

            throw logoutFailure;
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                profile,
                isRestoringSession,
                login,
                isLoggingIn,
                loginError,
                loginWithDevToken,
                isLoggingInWithDevToken,
                devLoginError,
                register,
                isRegistering,
                registerError,
                logout,
                isLoggingOut,
                logoutError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

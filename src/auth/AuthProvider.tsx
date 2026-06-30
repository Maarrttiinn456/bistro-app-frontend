import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useState,
} from 'react';

import {
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
import { clearSession, saveSession } from '@/src/auth/authStorage';

type AuthContextValue = {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    profile: Profile | null;
    login: (credentials: LoginBody) => Promise<void>;
    isLoggingIn: boolean;
    loginError: Error | null;
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
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<Error | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<Error | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<Error | null>(null);

    const applyAuthContext = async (authContext: BackendAuthContext) => {
        if (authContext.session.accessToken === null) {
            throw new Error('Auth response does not contain an access token');
        }

        await saveSession(authContext.session);
        setProfile(authContext.profile);
        setIsAuthenticated(true);
    };

    const login = async (credentials: LoginBody) => {
        setLoginError(null);
        setIsLoggingIn(true);

        try {
            const authContext = await loginRequest(credentials);

            await applyAuthContext(authContext);
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

    const register = async (credentials: SignUpBody) => {
        setRegisterError(null);
        setIsRegistering(true);

        try {
            const authContext = await signUpRequest(credentials);

            await applyAuthContext(authContext);
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
            await logoutRequest();
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
                login,
                isLoggingIn,
                loginError,
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

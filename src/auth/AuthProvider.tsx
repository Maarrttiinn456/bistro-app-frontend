import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useState,
} from 'react';

import { login as loginRequest } from '@/src/api/generated/auth/auth';
import type { LoginBody, Profile } from '@/src/api/generated/model';
import { saveSession } from '@/src/auth/authStorage';

type AuthContextValue = {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    profile: Profile | null;
    login: (credentials: LoginBody) => Promise<void>;
    isLoggingIn: boolean;
    loginError: Error | null;
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

    const login = useCallback(async (credentials: LoginBody) => {
        setLoginError(null);
        setIsLoggingIn(true);

        try {
            const authContext = await loginRequest(credentials);

            if (authContext.session.accessToken === null) {
                throw new Error('Login response does not contain an access token');
            }

            await saveSession(authContext.session);
            setProfile(authContext.profile);
            setIsAuthenticated(true);
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
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                profile,
                login,
                isLoggingIn,
                loginError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

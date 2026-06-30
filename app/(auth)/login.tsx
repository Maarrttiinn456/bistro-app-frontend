import { useAuth } from '@/src/auth/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const router = useRouter();
    const { isLoggingIn, login, loginError } = useAuth();

    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (trimmedEmail.length === 0 || password.length === 0) {
            setValidationError('Vyplň e-mail i heslo.');
            return;
        }

        setValidationError(null);

        try {
            await login({
                email: trimmedEmail,
                password,
            });
        } catch {
            return;
        }
    };

    const errorMessage =
        validationError ??
        (loginError === null
            ? null
            : 'Přihlášení se nepovedlo. Zkontroluj e-mail a heslo.');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Přihlášení</Text>
            <Text style={styles.subtitle}>
                Přihlas se a pokračuj do bistro aplikace.
            </Text>
            <TextInput
                accessibilityLabel="E-mail"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="E-mail"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                accessibilityLabel="Heslo"
                placeholder="Heslo"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />
            {errorMessage !== null && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                accessibilityRole="button"
                disabled={isLoggingIn}
                style={[styles.button, isLoggingIn && styles.buttonDisabled]}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>
                    {isLoggingIn ? 'Přihlašuji...' : 'Přihlásit se'}
                </Text>
            </Pressable>

            <Text>
                Nemáš účet?{' '}
                <Text
                    style={{ color: '#111827', fontWeight: '600' }}
                    onPress={() => router.push('/register')}
                >
                    Registrovat se
                </Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 12,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        color: '#111827',
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        color: '#667085',
        fontSize: 15,
        marginBottom: 8,
    },
    input: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        paddingVertical: 14,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    errorText: {
        color: '#b42318',
        fontSize: 14,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;

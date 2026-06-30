import { useAuth } from '@/src/auth/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const router = useRouter();
    const { isRegistering, register, registerError } = useAuth();

    const handleRegister = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (
            trimmedName.length === 0 ||
            trimmedEmail.length === 0 ||
            password.length === 0
        ) {
            setValidationError('Vyplň jméno, e-mail i heslo.');
            return;
        }

        if (password.length < 6) {
            setValidationError('Heslo musí mít alespoň 6 znaků.');
            return;
        }

        setValidationError(null);

        try {
            await register({
                name: trimmedName,
                email: trimmedEmail,
                password,
            });
        } catch {
            return;
        }
    };

    const errorMessage =
        validationError ??
        (registerError === null ? null : 'Registrace se nepovedla.');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vytvořit účet</Text>
            <Text style={styles.subtitle}>
                Založ si účet a začni používat bistro aplikaci.
            </Text>
            <TextInput
                accessibilityLabel="Jméno"
                placeholder="Jméno"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
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
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />
            {errorMessage !== null && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                accessibilityRole="button"
                disabled={isRegistering}
                style={[styles.button, isRegistering && styles.buttonDisabled]}
                onPress={handleRegister}
            >
                <Text style={styles.buttonText}>
                    {isRegistering ? 'Registruji...' : 'Vytvořit účet'}
                </Text>
            </Pressable>

            <Text>
                Už máš účet?{' '}
                <Text
                    style={{ color: '#111827', fontWeight: '600' }}
                    onPress={() => router.push('/login')}
                >
                    Přihlásit se
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

export default RegisterScreen;

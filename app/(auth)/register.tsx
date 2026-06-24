import { useSignUp } from '@/src/api/generated/auth/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const signUpMutation = useSignUp({
        mutation: {
            onSuccess: (data) => {
                console.log('Registered:', data);
            },
            onError: (error) => {
                console.log(
                    'Register failed:',
                    error.response?.status,
                    error.response?.data ?? error.message,
                );
            },
        },
    });

    const handleRegister = () => {
        console.log('Registering user with:', { name, email, password });
        signUpMutation.mutate({
            data: {
                name,
                email,
                password,
            },
        });
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />
            <Pressable
                disabled={signUpMutation.isPending}
                style={[
                    styles.button,
                    signUpMutation.isPending && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
            >
                <Text style={styles.buttonText}>Register</Text>
            </Pressable>

            <Text>
                Already have an account?{' '}
                <Text
                    style={{ color: '#111827', fontWeight: '600' }}
                    onPress={() => router.push('/login')}
                >
                    Login
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
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RegisterScreen;

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const LoginScreen = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
            />
            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <Text>
                Don&apos;t have an account?{' '}
                <Text
                    style={{ color: '#111827', fontWeight: '600' }}
                    onPress={() => router.push('/register')}
                >
                    Register
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
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;

import { useAuth } from '@/src/auth/useAuth';
import { Screen } from '@/src/components/Screen';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Today() {
    const { isLoggingOut, logout, logoutError } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            return;
        }
    };

    return (
        <Screen>
            <Text>Dnes</Text>
            {logoutError !== null && (
                <Text style={styles.errorText}>Odhlaseni se nepovedlo.</Text>
            )}
            <Pressable
                disabled={isLoggingOut}
                style={[styles.button, isLoggingOut && styles.buttonDisabled]}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>
                    {isLoggingOut ? 'Odhlasuji...' : 'Odhlasit'}
                </Text>
            </Pressable>
        </Screen>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        marginTop: 16,
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
    errorText: {
        color: '#b42318',
        fontSize: 14,
        marginTop: 12,
    },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModalHeaderProps = {
    closeAccessibilityLabel?: string;
    subtitle?: string;
    title: string;
    onClose: () => void;
};

export const ModalHeader = ({
    closeAccessibilityLabel = 'Zavřít',
    onClose,
    subtitle,
    title,
}: ModalHeaderProps) => {
    return (
        <View style={styles.header}>
            <View style={styles.textContent}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                ) : null}
            </View>
            <Pressable
                accessibilityLabel={closeAccessibilityLabel}
                accessibilityRole="button"
                style={styles.closeButton}
                onPress={onClose}
            >
                <Text style={styles.closeButtonText}>Zavřít</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        justifyContent: 'center',
        minHeight: 40,
        paddingHorizontal: 8,
    },
    closeButtonText: {
        color: '#175cd3',
        fontSize: 15,
        fontWeight: '700',
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
        minHeight: 40,
    },
    subtitle: {
        color: '#667085',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 2,
    },
    textContent: {
        flex: 1,
    },
    title: {
        color: '#111827',
        fontSize: 24,
        fontWeight: '800',
    },
});

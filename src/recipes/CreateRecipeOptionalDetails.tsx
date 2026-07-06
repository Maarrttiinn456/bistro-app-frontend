import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type CreateRecipeOptionalDetailsProps = {
    image: string;
    isOpen: boolean;
    sourceUrl: string;
    steps: string;
    onImageChange: (value: string) => void;
    onSourceUrlChange: (value: string) => void;
    onStepsChange: (value: string) => void;
    onToggle: () => void;
};

export const CreateRecipeOptionalDetails = ({
    image,
    isOpen,
    onImageChange,
    onSourceUrlChange,
    onStepsChange,
    onToggle,
    sourceUrl,
    steps,
}: CreateRecipeOptionalDetailsProps) => {
    return (
        <View style={styles.section}>
            <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={onToggle}
            >
                <Text style={styles.secondaryButtonText}>
                    {isOpen ? 'Skrýt volitelné detaily' : 'Volitelné detaily'}
                </Text>
            </Pressable>
            {isOpen ? (
                <>
                    <TextInput
                        accessibilityLabel="URL obrázku"
                        autoCapitalize="none"
                        placeholder="URL obrázku"
                        style={styles.input}
                        value={image}
                        onChangeText={onImageChange}
                    />
                    <TextInput
                        accessibilityLabel="Zdroj receptu"
                        autoCapitalize="none"
                        placeholder="Zdroj receptu"
                        style={styles.input}
                        value={sourceUrl}
                        onChangeText={onSourceUrlChange}
                    />
                    <TextInput
                        accessibilityLabel="Postup receptu"
                        multiline
                        placeholder="Postup"
                        style={[styles.input, styles.multilineInput]}
                        textAlignVertical="top"
                        value={steps}
                        onChangeText={onStepsChange}
                    />
                </>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        color: '#111827',
        fontSize: 15,
        minHeight: 46,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    multilineInput: {
        minHeight: 120,
    },
    secondaryButton: {
        alignItems: 'center',
        borderColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 42,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '700',
    },
    section: {
        gap: 12,
    },
});

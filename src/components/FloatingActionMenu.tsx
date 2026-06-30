import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type ComponentProps, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type FloatingActionMenuItem = {
    label: string;
    icon: IconName;
    hint?: string;
    disabled?: boolean;
    destructive?: boolean;
    onPress?: () => void;
};

type FloatingActionMenuProps = {
    accessibilityLabel: string;
    closedIcon: IconName;
    items: FloatingActionMenuItem[];
    openIcon?: IconName;
};

export const FloatingActionMenu = ({
    accessibilityLabel,
    closedIcon,
    items,
    openIcon = 'close',
}: FloatingActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTogglePress = () => {
        setIsOpen((currentValue) => !currentValue);
    };

    const handleItemPress = (item: FloatingActionMenuItem) => {
        item.onPress?.();
        setIsOpen(false);
    };

    return (
        <View pointerEvents="box-none" style={styles.container}>
            {isOpen ? (
                <View style={styles.menu}>
                    {items.map((item) => (
                        <Pressable
                            key={item.label}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: item.disabled }}
                            disabled={item.disabled}
                            style={[
                                styles.menuItem,
                                item.disabled ? styles.menuItemDisabled : null,
                            ]}
                            onPress={() => handleItemPress(item)}
                        >
                            <MaterialCommunityIcons
                                color={item.destructive ? '#b42318' : '#111827'}
                                name={item.icon}
                                size={20}
                            />
                            <View style={styles.menuItemLabel}>
                                <Text
                                    style={[
                                        styles.menuItemText,
                                        item.destructive
                                            ? styles.menuItemTextDestructive
                                            : null,
                                        item.disabled
                                            ? styles.menuItemTextDisabled
                                            : null,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {item.hint ? (
                                    <Text style={styles.menuItemHint}>
                                        {item.hint}
                                    </Text>
                                ) : null}
                            </View>
                        </Pressable>
                    ))}
                </View>
            ) : null}
            <Pressable
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                style={styles.button}
                onPress={handleTogglePress}
            >
                <MaterialCommunityIcons
                    color="#ffffff"
                    name={isOpen ? openIcon : closedIcon}
                    size={28}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 28,
        boxShadow: '0 8px 18px rgba(17, 24, 39, 0.24)',
        height: 56,
        justifyContent: 'center',
        width: 56,
    },
    container: {
        alignItems: 'flex-end',
        bottom: 24,
        gap: 12,
        position: 'absolute',
        right: 16,
        zIndex: 10,
    },
    menu: {
        backgroundColor: '#ffffff',
        borderColor: '#eaecf0',
        borderRadius: 8,
        borderWidth: 1,
        boxShadow: '0 8px 24px rgba(17, 24, 39, 0.14)',
        gap: 4,
        minWidth: 196,
        padding: 6,
    },
    menuItem: {
        alignItems: 'center',
        borderRadius: 6,
        flexDirection: 'row',
        gap: 10,
        minHeight: 46,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    menuItemDisabled: {
        opacity: 0.7,
    },
    menuItemHint: {
        color: '#98a2b3',
        fontSize: 12,
    },
    menuItemLabel: {
        gap: 2,
    },
    menuItemText: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '600',
    },
    menuItemTextDestructive: {
        color: '#b42318',
    },
    menuItemTextDisabled: {
        color: '#667085',
    },
});

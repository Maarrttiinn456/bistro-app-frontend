import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
    contentStyle?: StyleProp<ViewStyle>;
    edges?: Edge[];
    style?: StyleProp<ViewStyle>;
}>;

export const screenContentStyles = StyleSheet.create({
    list: {
        backgroundColor: '#fff',
        flexGrow: 1,
        gap: 12,
        paddingBottom: 96,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    modalPlain: {
        backgroundColor: '#fff',
        flex: 1,
        gap: 18,
        paddingBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    modalScroll: {
        backgroundColor: '#fff',
        flexGrow: 1,
        gap: 18,
        paddingBottom: 40,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    plain: {
        backgroundColor: '#fff',
        flex: 1,
        gap: 12,
        paddingBottom: 24,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    scroll: {
        backgroundColor: '#fff',
        flexGrow: 1,
        gap: 18,
        paddingBottom: 40,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
});

export const Screen = ({
    children,
    contentStyle,
    edges = ['left', 'right'],
    style,
}: ScreenProps) => {
    return (
        <SafeAreaView style={[styles.root, style]} edges={edges}>
            {contentStyle ? (
                <View style={contentStyle}>{children}</View>
            ) : (
                children
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        backgroundColor: '#fff',
        flex: 1,
    },
});

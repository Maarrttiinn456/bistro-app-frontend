import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
    return (
        <SafeAreaView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 36 }}
            edges={['left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
}

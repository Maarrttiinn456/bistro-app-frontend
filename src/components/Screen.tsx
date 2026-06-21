import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
    return (
        <SafeAreaView
            style={{ flex: 1, padding: 16 }}
            edges={['top', 'left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
}

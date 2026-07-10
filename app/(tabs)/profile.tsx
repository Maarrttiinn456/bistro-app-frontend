import { Screen, screenContentStyles } from '@/src/components/Screen';
import { Text } from 'react-native';

export default function Profile() {
    return (
        <Screen contentStyle={screenContentStyles.plain}>
            <Text>Profil</Text>
        </Screen>
    );
}

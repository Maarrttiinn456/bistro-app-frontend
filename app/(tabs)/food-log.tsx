import { Screen, screenContentStyles } from '@/src/components/Screen';
import { Text } from 'react-native';

export default function FoodLog() {
    return (
        <Screen contentStyle={screenContentStyles.plain}>
            <Text>Deník jídla</Text>
        </Screen>
    );
}

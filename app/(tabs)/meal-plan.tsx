import { Screen, screenContentStyles } from '@/src/components/Screen';
import { Text } from 'react-native';

export default function MealPlan() {
    return (
        <Screen contentStyle={screenContentStyles.plain}>
            <Text>Plán jídel</Text>
        </Screen>
    );
}

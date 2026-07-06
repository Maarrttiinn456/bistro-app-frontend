import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

const TabLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShadowVisible: true,
                headerStyle: { backgroundColor: '#ffffff' },
                headerTintColor: '#111827',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: '#111827',
                    fontSize: 18,
                    fontWeight: '700',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dnes',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="home"
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="recipes"
                options={{
                    headerShown: false,
                    title: 'Recepty',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="book-open-variant"
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="ingredients"
                options={{
                    headerShown: false,
                    title: 'Ingredience',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="food-apple"
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="meal-plan"
                options={{
                    title: 'Plán',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="calendar-month"
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="food-log"
                options={{
                    title: 'Deník',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="notebook"
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            color={color}
                            name="account-circle"
                            size={size}
                        />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabLayout;

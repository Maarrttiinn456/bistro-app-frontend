import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

const TabLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
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

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    Icon,
    Label,
    NativeTabs,
    VectorIcon,
} from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>Dnes</Label>
                <Icon
                    sf="house.fill"
                    androidSrc={
                        <VectorIcon
                            family={MaterialCommunityIcons}
                            name="home"
                        />
                    }
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="recipes">
                <Label>Recepty</Label>
                <Icon
                    sf="book.fill"
                    androidSrc={
                        <VectorIcon
                            family={MaterialCommunityIcons}
                            name="book-open-variant"
                        />
                    }
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="meal-plan">
                <Label>Plán</Label>
                <Icon
                    sf="calendar"
                    androidSrc={
                        <VectorIcon
                            family={MaterialCommunityIcons}
                            name="calendar-month"
                        />
                    }
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="food-log">
                <Label>Deník</Label>
                <Icon
                    sf="list.bullet"
                    androidSrc={
                        <VectorIcon
                            family={MaterialCommunityIcons}
                            name="notebook"
                        />
                    }
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profile">
                <Label>Profil</Label>
                <Icon
                    sf="person.crop.circle"
                    androidSrc={
                        <VectorIcon
                            family={MaterialCommunityIcons}
                            name="account-circle"
                        />
                    }
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

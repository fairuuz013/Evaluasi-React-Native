import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Profile from '../pages/Profile'
import Home from '../pages/Home'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name='Profile' component={Profile} />
        </Stack.Navigator>
    )
}
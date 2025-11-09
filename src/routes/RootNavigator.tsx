import { NavigationContainer } from "@react-navigation/native";
import BottomTabsNavigator from "./ButtomTabsNavigator";

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <BottomTabsNavigator />
        </NavigationContainer>
    )
}
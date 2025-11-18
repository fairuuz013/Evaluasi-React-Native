import { NavigationContainer } from "@react-navigation/native";
import { CartProvider } from "./src/context/CartContext";
import RootNavigation from "./src/routes/RootNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { AuthProvider } from "./src/context/AuthContext";
import { View, Text } from "react-native"; // IMPORT Text

export default function App() {
  return (
    <ErrorBoundary 
      fallback={(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error loading app</Text> {/* PAKAI TEXT COMPONENT */}
        </View>
      )}
    >
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
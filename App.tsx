import { NavigationContainer } from "@react-navigation/native";
import { CartProvider } from "./src/context/CartContext";
import RootNavigation from "./src/routes/RootNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary >
      <CartProvider>
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      </CartProvider>
    </ErrorBoundary>
  );
}

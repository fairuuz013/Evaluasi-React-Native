import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.log("🔥 GLOBAL ERROR CAUGHT:", error);
    console.log("🔥 COMPONENT STACK:", info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });

    // Cara reset paling mudah → force remount App (ganti key)
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Aplikasi mengalami masalah tak terduga.</Text>

          <Button title="Mulai Ulang Aplikasi" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
});

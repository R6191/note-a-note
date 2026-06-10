import { Stack } from "expo-router";
import { useEffect } from "react";
import { useStore } from "../src/store/useStore";

export default function RootLayout() {
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#e0e0ff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Note a Note" }} />
      <Stack.Screen name="memo/[id]" options={{ title: "メモ" }} />
    </Stack>
  );
}

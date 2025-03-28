
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MediaCompare from "./components/MediaCompare";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./hooks/use-theme";

// Création d'un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MediaCompare />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

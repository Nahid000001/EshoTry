import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ModernHeader } from "@/components/modern/ModernHeader";
import { Chatbot } from "@/components/Chatbot";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import ModernHome from "@/pages/modern/ModernHome";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={ModernHome} />
            <Route path="/checkout" component={Checkout} />
          </>
        )}
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      
      {/* AI Chatbot - Available on all pages */}
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

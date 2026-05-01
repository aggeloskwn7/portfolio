import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
if ('caches' in window) {
    caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
            console.log('Clearing cache:', cacheName);
            caches.delete(cacheName);
        });
    });
}
function Router() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                if (registrations.length > 0) {
                    console.log(`Found ${registrations.length} service worker(s), unregistering...`);
                    registrations.forEach(registration => {
                        registration.unregister();
                    });
                }
            });
        }
    }, []);
    return (<Switch>
      <Route path="/" component={Home}/>
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>);
}
export default App;

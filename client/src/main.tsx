import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
const APP_VERSION = "2.1.0_24042024";
console.log(`App Version: ${APP_VERSION}`);
localStorage.setItem('appVersion', APP_VERSION);
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
            console.log(`Found ${registrations.length} service worker(s), unregistering...`);
            registrations.forEach(registration => {
                console.log('Unregistering service worker:', registration);
                registration.unregister().then(success => {
                    if (success) {
                        console.log('Service worker successfully unregistered');
                        if ('caches' in window) {
                            caches.keys().then(cacheNames => {
                                cacheNames.forEach(cacheName => {
                                    console.log('Deleting cache:', cacheName);
                                    caches.delete(cacheName);
                                });
                            });
                        }
                    }
                });
            });
        }
        else {
            console.log('No service workers found');
        }
    }).catch(error => {
        console.error('Service worker unregistration failed:', error);
    });
}
const pageAccessedByReload = ((window.performance.navigation && window.performance.navigation.type === 1) ||
    window.performance
        .getEntriesByType('navigation')
        .map((nav) => (nav as PerformanceNavigationTiming).type)
        .includes('reload'));
if (!pageAccessedByReload) {
    const lastLoadTime = localStorage.getItem('lastLoadTime');
    const currentTime = Date.now().toString();
    localStorage.setItem('lastLoadTime', currentTime);
    if (lastLoadTime && (parseInt(currentTime) - parseInt(lastLoadTime) > 60 * 60 * 1000)) {
        window.location.reload();
    }
}
const checkForUpdates = () => {
    fetch(`/index.html?cachebust=${Date.now()}`, { cache: 'no-store' })
        .then(response => response.text())
        .then(html => {
        const versionMatch = html.match(/<meta name="version" content="([^"]+)"/);
        if (versionMatch && versionMatch[1]) {
            const serverVersion = versionMatch[1];
            const currentVersion = document.querySelector('meta[name="version"]')?.getAttribute('content');
            console.log(`Server version: ${serverVersion}, Current version: ${currentVersion}`);
            if (serverVersion !== currentVersion && currentVersion !== null) {
                console.log('New version detected, reloading page...');
                window.location.reload();
            }
        }
    })
        .catch(error => {
        console.error('Error checking for updates:', error);
    });
};
setInterval(checkForUpdates, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking for updates...');
        checkForUpdates();
    }
});
createRoot(document.getElementById("root")!).render(<App />);

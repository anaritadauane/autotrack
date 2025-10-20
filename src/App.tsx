import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { supabase, apiRequest } from './utils/supabase/client';
import { Toaster } from './components/ui/sonner';
//@ts-ignore
import logoImage from './assets/logo.png';

type Screen = 'login' | 'dashboard' | 'history' | 'profile' | 'payments';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.access_token && !sessionError) {
          try {
            // Add a small delay to ensure token is fully propagated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get user profile from backend
            const profileData = await apiRequest('/profile');
            setUser({
              name: profileData.user.name,
              avatar: profileData.user.avatar
            });
            setCurrentScreen('dashboard');
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            
            // Try refreshing the session first
            try {
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshedSession?.access_token && !refreshError) {
                // Try again with refreshed token
                const profileData = await apiRequest('/profile');
                setUser({
                  name: profileData.user.name,
                  avatar: profileData.user.avatar
                });
                setCurrentScreen('dashboard');
                return;
              }
            } catch (refreshFetchError) {
              console.error('Refresh and fetch error:', refreshFetchError);
            }
            
            // If everything fails, clear the session
            await supabase.auth.signOut();
            setUser(null);
            setCurrentScreen('login');
          }
        } else {
          // No valid session, stay on login
          setCurrentScreen('login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Clear any potentially invalid session and stay on login
        await supabase.auth.signOut();
        setUser(null);
        setCurrentScreen('login');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData: { name: string; avatar: string }) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentScreen('login');
  };

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <div className="size-full max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="Autotrack" className="w-20 h-20 object-contain animate-pulse" />
          </div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full max-w-md mx-auto bg-background">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {currentScreen === 'dashboard' && user && (
        <DashboardScreen 
          user={user} 
          onNavigate={navigateToScreen}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'history' && user && (
        <HistoryScreen 
          user={user} 
          onNavigate={navigateToScreen}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'profile' && user && (
        <UserProfileScreen 
          user={user} 
          onNavigate={navigateToScreen}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'payments' && user && (
        <PaymentsScreen 
          user={user} 
          onNavigate={navigateToScreen}
          onLogout={handleLogout}
        />
      )}
      <Toaster />
    </div>
  );
}

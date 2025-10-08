import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { supabase, apiRequest } from './utils/supabase/client';
import { Toaster } from 'sonner';

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
        <div className="text-center">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center relative overflow-hidden mx-auto mb-2">
            <span className="text-white font-bold text-sm">T</span>
            <div className="absolute top-0 right-0 w-3 h-8 bg-teal-600"></div>
            <div className="absolute bottom-0 left-1 w-2 h-1 bg-yellow-400"></div>
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

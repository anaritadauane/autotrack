import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase, apiRequest } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (userData: { name: string; avatar: string }) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Add a small delay to ensure token is fully propagated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get user profile from backend with retry logic
      let profileData;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          profileData = await apiRequest('/profile');
          break;
        } catch (profileError) {
          attempts++;
          console.error(`Profile fetch attempt ${attempts} failed:`, profileError);
          
          if (attempts === maxAttempts) {
            throw profileError;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      onLogin({
        name: profileData.user.name,
        avatar: profileData.user.avatar
      });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user via direct fetch to avoid auth issues
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const signupResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b763bb62/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      });
      
      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      // Now sign in the user
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Add a small delay to ensure token is fully propagated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get user profile from backend with retry logic
      let profileData;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          profileData = await apiRequest('/profile');
          break;
        } catch (profileError) {
          attempts++;
          console.error(`Profile fetch attempt ${attempts} failed:`, profileError);
          
          if (attempts === maxAttempts) {
            throw profileError;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      onLogin({
        name: profileData.user.name,
        avatar: profileData.user.avatar
      });
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center relative overflow-hidden">
              <span className="text-white font-bold text-xl">T</span>
              <div className="absolute top-0 right-0 w-6 h-12 bg-teal-600"></div>
              <div className="absolute bottom-0 left-2 w-4 h-2 bg-yellow-400"></div>
              <div className="absolute top-4 left-2 w-1 h-4 bg-gray-800"></div>
            </div>
          </div>
          <span className="text-2xl font-medium text-gray-900">Autotrack</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-left text-gray-900 mb-8">Viaturas</h1>
        
        <div className="space-y-4">
          {isSignUp && (
            <Input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-200 border-0 rounded-xl h-14 text-gray-700 placeholder:text-gray-500"
            />
          )}
          
          <Input
            type="email"
            placeholder="E-mail ou telefone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-200 border-0 rounded-xl h-14 text-gray-700 placeholder:text-gray-500"
          />
          
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-200 border-0 rounded-xl h-14 text-gray-700 placeholder:text-gray-500"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button 
          onClick={isSignUp ? handleSignUp : handleLogin}
          disabled={isLoading}
          className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl mt-8 disabled:opacity-50"
        >
          {isLoading ? 'Carregando...' : (isSignUp ? 'Criar conta' : 'Entra')}
        </Button>

        <div className="flex justify-between pt-8">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-700 hover:text-gray-900"
          >
            {isSignUp ? 'Já tem conta? Entrar' : 'Criar conta'}
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            Esqueceu a senha ?
          </button>
        </div>
      </div>
    </div>
  );
}
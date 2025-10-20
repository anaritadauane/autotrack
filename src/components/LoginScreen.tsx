import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase, apiRequest } from '../utils/supabase/client';
import { motion } from 'motion/react';
import { Car, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import logoImage from '../assets/logo.png';

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
      setError('Por favor preencha todos os campos');
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

      await new Promise(resolve => setTimeout(resolve, 200));

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
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      onLogin({
        name: profileData.user.name,
        avatar: profileData.user.avatar
      });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Falha ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError('Por favor preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
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
        throw new Error(errorData.error || 'Falha ao criar conta');
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 200));

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
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      onLogin({
        name: profileData.user.name,
        avatar: profileData.user.avatar
      });
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      {/* Logo Section */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="flex flex-col items-center gap-3">
          <img src={logoImage} alt="Autotrack" className="w-32 h-32 object-contain" />
          <span className="text-2xl font-medium text-gray-900">Autotrack</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {isSignUp ? 'Comece a gerir suas viaturas hoje' : 'Entre para continuar'}
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl h-14 text-gray-700 placeholder:text-gray-400 focus:border-blue-500 transition-all"
                  />
                </div>
              </motion.div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl h-14 text-gray-700 placeholder:text-gray-400 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl h-14 text-gray-700 placeholder:text-gray-400 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl"
            >
              <p className="text-red-700 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl mt-8 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Carregando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </motion.div>

          <div className="flex justify-between items-center mt-6 text-sm">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-gray-700 hover:text-gray-900"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Criar conta'}
            </button>
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              Esqueceu senha?
            </button>
          </div>
        </div>


      </motion.div>
    </div>
  );
}

import { Home, History, User, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  currentScreen: 'dashboard' | 'history' | 'profile' | 'payments';
  onNavigate: (screen: 'dashboard' | 'history' | 'profile' | 'payments') => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Início'
    },
    { 
      id: 'history', 
      icon: History, 
      label: 'Histórico'
    },
    { 
      id: 'payments', 
      icon: CreditCard, 
      label: 'Pagamentos'
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Perfil'
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className="flex flex-col items-center justify-center min-w-[60px] transition-all"
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <span className={`text-xs mt-1 transition-all ${
                isActive 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

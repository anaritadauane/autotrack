import { Home, Car, User } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: 'dashboard' | 'history' | 'profile' | 'payments';
  onNavigate: (screen: 'dashboard' | 'history' | 'profile' | 'payments' | 'login') => void
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const getIconColor = (screen: string) => {
    return currentScreen === screen ? 'text-gray-900' : 'text-gray-400';
  };

  const getTextColor = (screen: string) => {
    return currentScreen === screen ? 'text-gray-900' : 'text-gray-400';
  };

  return (
    <div className="mt-auto bg-gray-100 p-4">
      <div className="flex justify-around">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center p-2"
        >
          <Home className={`w-6 h-6 ${getIconColor('dashboard')}`} />
          <span className={`text-xs mt-1 ${getTextColor('dashboard')}`}>Início</span>
        </button>
        <button 
          onClick={() => onNavigate('history')}
          className="flex flex-col items-center p-2"
        >
          <Car className={`w-6 h-6 ${getIconColor('history')}`} />
          <span className={`text-xs mt-1 ${getTextColor('history')}`}>Histórico</span>
        </button>
        <button 
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center p-2"
        >
          <User className={`w-6 h-6 ${getIconColor('profile')}`} />
          <span className={`text-xs mt-1 ${getTextColor('profile')}`}>Perfil</span>
        </button>
      </div>
    </div>
  );
}

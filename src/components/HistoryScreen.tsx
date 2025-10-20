import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileText, AlertCircle, CheckCircle, Clock, Calendar, DollarSign, Car, Shield, ClipboardCheck, Sparkles, MoreHorizontal } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from '../assets/logo.png';

interface HistoryScreenProps {
  user: { name: string; avatar: string };
  onNavigate: (screen: 'login' | 'dashboard' | 'history' | 'profile' | 'payments') => void;
  onLogout: () => void;
}

interface HistoryItem {
  id: string;
  date: string;
  type: 'vehicle' | 'insurance' | 'inspection' | 'taxes' | 'document';
  title: string;
  description: string;
  vehicleId?: string;
  vehicleName?: string;
  vehiclePlate?: string;
  status?: string;
  amount?: string;
  dateRange?: string;
  documentType?: string;
}

export function HistoryScreen({ user, onNavigate, onLogout }: HistoryScreenProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'vehicle' | 'insurance' | 'inspection' | 'taxes' | 'document'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/history');
      setHistory(response.history || []);
    } catch (err) {
      console.error('Load history error:', err);
      toast.error('Falha ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return <Car className="w-5 h-5" />;
      case 'insurance':
        return <Shield className="w-5 h-5" />;
      case 'inspection':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'taxes':
        return <DollarSign className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'vehicle':
        return { bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50', label: 'Viatura' };
      case 'insurance':
        return { bg: 'bg-green-500', text: 'text-green-500', lightBg: 'bg-green-50', label: 'Seguro' };
      case 'inspection':
        return { bg: 'bg-orange-500', text: 'text-orange-500', lightBg: 'bg-orange-50', label: 'Inspeção' };
      case 'taxes':
        return { bg: 'bg-purple-500', text: 'text-purple-500', lightBg: 'bg-purple-50', label: 'Impostos' };
      case 'document':
        return { bg: 'bg-gray-500', text: 'text-gray-500', lightBg: 'bg-gray-50', label: 'Documento' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-500', lightBg: 'bg-gray-50', label: 'Outro' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-500">Válido</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">A Expirar</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);

  const filterCounts = {
    all: history.length,
    vehicle: history.filter(h => h.type === 'vehicle').length,
    insurance: history.filter(h => h.type === 'insurance').length,
    inspection: history.filter(h => h.type === 'inspection').length,
    taxes: history.filter(h => h.type === 'taxes').length,
    document: history.filter(h => h.type === 'document').length,
  };

  const filterOptions = [
    { key: 'all', label: 'Todos', icon: Sparkles, count: filterCounts.all },
    { key: 'vehicle', label: 'Viaturas', icon: Car, count: filterCounts.vehicle },
    { key: 'insurance', label: 'Seguros', icon: Shield, count: filterCounts.insurance },
    { key: 'inspection', label: 'Inspeções', icon: ClipboardCheck, count: filterCounts.inspection },
    { key: 'taxes', label: 'Impostos', icon: DollarSign, count: filterCounts.taxes },
    { key: 'document', label: 'Docs', icon: FileText, count: filterCounts.document },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Autotrack" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-semibold">Histórico</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogout}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </button>
          <button>
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-white shadow-sm"
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filter === option.key;
            return (
              <Button
                key={option.key}
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setFilter(option.key as any)}
                className={`whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {option.label} ({option.count})
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
            />
          </div>
        ) : filteredHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center px-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Nenhum histórico encontrado' : `Nenhum item de ${filterOptions.find(f => f.key === filter)?.label} encontrado`}
            </h3>
            <p className="text-gray-500 text-sm">
              Comece adicionando viaturas e gerenciando documentos para ver o histórico aqui.
            </p>
          </motion.div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Group by month */}
            <AnimatePresence>
              {Object.entries(
                filteredHistory.reduce((groups, item) => {
                  const date = new Date(item.date);
                  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const monthName = date.toLocaleDateString('pt-PT', { 
                    year: 'numeric', 
                    month: 'long' 
                  });
                  
                  if (!groups[monthKey]) {
                    groups[monthKey] = { name: monthName, items: [] };
                  }
                  groups[monthKey].items.push(item);
                  return groups;
                }, {} as Record<string, { name: string; items: HistoryItem[] }>)
              ).map(([monthKey, group], groupIndex) => (
                <motion.div 
                  key={monthKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-gray-700 capitalize">
                      {group.name}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {group.items.map((item, itemIndex) => {
                      const config = getTypeConfig(item.type);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                        >
                          <Card className={`overflow-hidden hover:shadow-lg transition-all border-l-4 ${config.bg.replace('bg-', 'border-l-')}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 ${config.lightBg} rounded-xl flex items-center justify-center flex-shrink-0 ${config.text}`}>
                                  {getTypeIcon(item.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                      
                                      {item.vehicleName && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            <Car className="w-3 h-3 mr-1" />
                                            {item.vehicleName} {item.vehiclePlate && `(${item.vehiclePlate})`}
                                          </Badge>
                                          {item.status && getStatusBadge(item.status)}
                                        </div>
                                      )}
                                      
                                      {item.amount && (
                                        <p className="text-sm font-semibold text-green-600 mt-2">
                                          💰 {item.amount}
                                        </p>
                                      )}
                                      
                                      {item.dateRange && (
                                        <p className="text-xs text-gray-500 mt-2">
                                          📅 Validade: {formatDate(item.dateRange)}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="text-right text-xs text-gray-500 ml-2 flex-shrink-0">
                                      <div>{formatDate(item.date)}</div>
                                      <div className="text-xs text-gray-400">{formatTime(item.date)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNavigation currentScreen="history" onNavigate={onNavigate} />
    </div>
  );
}

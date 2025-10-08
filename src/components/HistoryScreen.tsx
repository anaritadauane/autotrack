import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Home, Car, User, MoreHorizontal, FileText, Plus, AlertCircle, CheckCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

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
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'insurance':
        return <AlertCircle className="w-4 h-4 text-green-600" />;
      case 'inspection':
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case 'taxes':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vehicle':
        return 'bg-blue-100 text-blue-800';
      case 'insurance':
        return 'bg-green-100 text-green-800';
      case 'inspection':
        return 'bg-orange-100 text-orange-800';
      case 'taxes':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
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

      {/* Filter Tabs */}
      <div className="p-4 border-b">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Todos', count: filterCounts.all },
            { key: 'vehicle', label: 'Viaturas', count: filterCounts.vehicle },
            { key: 'insurance', label: 'Seguros', count: filterCounts.insurance },
            { key: 'inspection', label: 'Inspeções', count: filterCounts.inspection },
            { key: 'taxes', label: 'Impostos', count: filterCounts.taxes },
            { key: 'document', label: 'Documentos', count: filterCounts.document },
          ].map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() => setFilter(tab.key as any)}
              className="whitespace-nowrap"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Nenhum histórico encontrado' : `Nenhum item de ${filter} encontrado`}
            </h3>
            <p className="text-gray-500 text-sm">
              Comece adicionando viaturas e gerenciando documentos para ver o histórico aqui.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Group by month */}
            {Object.entries(
              filteredHistory.reduce((groups, item) => {
                const date = new Date(item.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('pt-BR', { 
                  year: 'numeric', 
                  month: 'long' 
                });
                
                if (!groups[monthKey]) {
                  groups[monthKey] = { name: monthName, items: [] };
                }
                groups[monthKey].items.push(item);
                return groups;
              }, {} as Record<string, { name: string; items: HistoryItem[] }>)
            ).map(([monthKey, group]) => (
              <div key={monthKey}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-600 capitalize">
                    {group.name}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-gray-300">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getTypeIcon(item.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                    {item.type === 'vehicle' && 'Viatura'}
                                    {item.type === 'insurance' && 'Seguro'}
                                    {item.type === 'inspection' && 'Inspeção'}
                                    {item.type === 'taxes' && 'Impostos'}
                                    {item.type === 'document' && 'Documento'}
                                  </Badge>
                                  {item.status && getStatusBadge(item.status)}
                                </div>
                                
                                <p className="text-sm text-gray-600">{item.description}</p>
                                
                                {item.vehicleName && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.vehicleName} {item.vehiclePlate && `(${item.vehiclePlate})`}
                                  </p>
                                )}
                                
                                {item.amount && (
                                  <p className="text-sm font-medium text-green-600 mt-1">
                                    {item.amount}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right text-xs text-gray-500">
                                {formatDate(item.date)}
                              </div>
                            </div>
                            
                            {item.dateRange && (
                              <div className="text-xs text-gray-500">
                                Validade: {formatDate(item.dateRange)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation currentScreen="history" onNavigate={onNavigate} />
    </div>
  );
}
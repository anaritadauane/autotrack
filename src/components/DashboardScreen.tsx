import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, Search, Bell, TrendingUp, AlertTriangle, CheckCircle, ChevronRight, 
  Car as CarIcon, ArrowUpRight, Filter, MoreHorizontal, Edit, Trash2, User, 
  BarChart3, FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { VehicleCard } from './VehicleCard';
import { VehicleDetails } from './VehicleDetails';
import { VehicleForm } from './VehicleForm';
import { DocumentManager } from './DocumentManager';
import { SearchBar } from './SearchBar';
import { NotificationsCenter } from './NotificationsCenter';
import { StatsComparison } from './StatsComparison';
import { BottomNavigation } from './BottomNavigation';
import { VehicleProgressBar } from './VehicleProgressBar';
import { VehicleDocumentStatus } from './VehicleDocumentStatus';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { VehicleType } from '../utils/vehicleDefaults';
import logoImage from '../assets/logo.png';

interface DashboardScreenProps {
  user: { name: string; avatar: string };
  onNavigate: (screen: 'login' | 'dashboard' | 'history' | 'profile' | 'payments') => void;
  onLogout: () => void;
}

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  color?: string;
  imageUrl?: string;
  type?: VehicleType;
  insurance: { date: string; status: 'valid' | 'expired' | 'warning'; company?: string; policyNumber?: string };
  inspection: { date: string; status: 'valid' | 'expired' | 'warning'; center?: string };
  taxes: { date: string; status: 'valid' | 'expired' | 'warning'; amount?: string };
}

interface Stats {
  totalVehicles: number;
  totalDocuments: number;
  expiredItems: number;
  expiringItems: number;
  validItems: number;
}

export function DashboardScreen({ user, onNavigate, onLogout }: DashboardScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatsComparison, setShowStatsComparison] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadVehicles();
    loadStats();
    loadNotifications();
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = vehicles.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchQuery, vehicles]);

  const loadNotifications = async () => {
    try {
      const response = await apiRequest('/vehicles');
      const vehicles = response.vehicles || [];
      const newNotifications: any[] = [];
      
      vehicles.forEach((vehicle: any) => {
        if (vehicle.insurance?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.insurance.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
            newNotifications.push({
              id: `insurance_${vehicle.id}`,
              type: 'warning',
              title: 'Seguro a Expirar',
              message: `Seguro de ${vehicle.name} expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`,
              icon: 'insurance',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          } else if (daysUntilExpiry < 0) {
            newNotifications.push({
              id: `insurance_${vehicle.id}`,
              type: 'error',
              title: 'Seguro Expirado',
              message: `Seguro de ${vehicle.name} já expirou!`,
              icon: 'insurance',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          }
        }
        
        if (vehicle.inspection?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.inspection.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 14 && daysUntilExpiry >= 0) {
            newNotifications.push({
              id: `inspection_${vehicle.id}`,
              type: 'warning',
              title: 'Inspeção a Expirar',
              message: `Inspeção de ${vehicle.name} expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`,
              icon: 'inspection',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          } else if (daysUntilExpiry < 0) {
            newNotifications.push({
              id: `inspection_${vehicle.id}`,
              type: 'error',
              title: 'Inspeção Expirada',
              message: `Inspeção de ${vehicle.name} já expirou!`,
              icon: 'inspection',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          }
        }
        
        if (vehicle.taxes?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.taxes.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            newNotifications.push({
              id: `taxes_${vehicle.id}`,
              type: 'warning',
              title: 'Impostos a Vencer',
              message: `Impostos de ${vehicle.name} vencem em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`,
              icon: 'taxes',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          } else if (daysUntilExpiry < 0) {
            newNotifications.push({
              id: `taxes_${vehicle.id}`,
              type: 'error',
              title: 'Impostos Vencidos',
              message: `Impostos de ${vehicle.name} já venceram!`,
              icon: 'taxes',
              timestamp: new Date(),
              read: false,
              vehicleName: vehicle.name
            });
          }
        }
      });
      
      setNotifications(newNotifications);
      
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleExportReport = () => {
    toast.success('Relatório exportado com sucesso!');
  };

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/vehicles');
      setVehicles(response.vehicles || []);
      
      if (response.vehicles && response.vehicles.length > 0 && !selectedVehicle) {
        setSelectedVehicle(response.vehicles[0]);
      }
    } catch (err) {
      console.error('Load vehicles error:', err);
      toast.error('Falha ao carregar viaturas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiRequest('/stats');
      setStats(response.stats);
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm('Tem certeza que deseja eliminar esta viatura?')) {
      return;
    }

    try {
      await apiRequest(`/vehicles/${vehicle.id}`, {
        method: 'DELETE'
      });
      
      toast.success('Viatura eliminada com sucesso!');
      await loadVehicles();
      await loadStats();
      
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle(vehicles.length > 1 ? vehicles[0] : null);
      }
    } catch (err) {
      console.error('Delete vehicle error:', err);
      toast.error('Falha ao eliminar viatura');
    }
  };

  const handleVehicleSave = async (savedVehicle: Vehicle) => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
    
    await loadVehicles();
    await loadStats();
    
    setSelectedVehicle(savedVehicle);
  };

  const handleVehicleFormCancel = () => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50 items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-4">
            <motion.img 
              src={logoImage} 
              alt="Autotrack" 
              className="w-24 h-24 object-contain"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <div className="text-gray-700 font-medium">Carregando viaturas...</div>
        </motion.div>
      </div>
    );
  }

  if (showVehicleForm) {
    return (
      <VehicleForm
        vehicle={editingVehicle}
        onSave={handleVehicleSave}
        onCancel={handleVehicleFormCancel}
      />
    );
  }

  if (showDocumentManager && selectedVehicle) {
    return (
      <DocumentManager
        vehicle={selectedVehicle}
        onClose={() => setShowDocumentManager(false)}
      />
    );
  }

  // Prepare chart data
  const statusData = stats ? [
    { name: 'Válidos', value: stats.validItems, color: '#10b981' },
    { name: 'A Expirar', value: stats.expiringItems, color: '#f59e0b' },
    { name: 'Expirados', value: stats.expiredItems, color: '#ef4444' }
  ] : [];

  const vehicleData = vehicles.map(v => ({
    name: v.name.split(' ')[0],
    seguros: v.insurance.status === 'valid' ? 1 : 0,
    inspeções: v.inspection.status === 'valid' ? 1 : 0,
    impostos: v.taxes.status === 'valid' ? 1 : 0
  }));

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b"
      >
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Autotrack" className="w-10 h-10 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="w-6 h-6 text-gray-400" />
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{notifications.filter(n => !n.read).length}</span>
              </div>
            )}
          </motion.button>
          <button>
            <MoreHorizontal className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Welcome */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-medium text-gray-900">Olá, {user.name}</h1>
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Buscar viaturas..."
          showFilters={false}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              <Card className="bg-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Viaturas</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Válidos</p>
                      <p className="text-3xl font-bold text-green-600">{stats.validItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">A Expirar</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.expiringItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Expirados</p>
                      <p className="text-3xl font-bold text-red-600">{stats.expiredItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chart Section */}
          {stats && (stats.validItems + stats.expiringItems + stats.expiredItems) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Estado Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vehicle Type Distribution */}
          {vehicles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CarIcon className="w-5 h-5 text-blue-600" />
                    Distribuição por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VehicleProgressBar vehicles={vehicles} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Document Status by Vehicle */}
          {vehicles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Status dos Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VehicleDocumentStatus vehicles={vehicles} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vehicles Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🚗 Minhas Viaturas
              </h2>
              <Button 
                onClick={handleAddVehicle}
                size="sm" 
                variant="outline" 
                className="rounded-full w-8 h-8 p-0"
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>

            {filteredVehicles.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto p-2">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isSelected={selectedVehicle?.id === vehicle.id}
                    onSelect={() => setSelectedVehicle(vehicle)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-2 border-dashed">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-4">Nenhuma viatura registrada</p>
                <Button onClick={handleAddVehicle} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar primeira viatura
                </Button>
              </Card>
            )}
          </motion.div>

          {/* Vehicle Details */}
          {selectedVehicle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <VehicleDetails 
                vehicle={selectedVehicle} 
                onOpenDocuments={() => setShowDocumentManager(true)}
                onEdit={() => handleEditVehicle(selectedVehicle)}
                onDelete={() => handleDeleteVehicle(selectedVehicle)}
              />
            </motion.div>
          )}

          {/* Stats Comparison Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => setShowStatsComparison(!showStatsComparison)}
              className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              {showStatsComparison ? 'Ocultar Análise' : 'Ver Análise Detalhada'}
            </Button>
          </motion.div>

          {/* Stats Comparison */}
          {showStatsComparison && vehicles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <StatsComparison vehicles={vehicles} />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* <h3 className="font-bold text-gray-900 mb-3">Ações Rápidas</h3> */}
            <div className="space-y-3">
              {/* <Button 
                onClick={() => onNavigate('profile')}
                className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl"
              >
                <User className="w-5 h-5 mr-3" />
                Dados Pessoais
              </Button>
              
              <Button 
                onClick={() => onNavigate('payments')}
                className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl"
              >
                <div className="w-5 h-5 mr-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">$</span>
                </div>
                Pagamentos
              </Button>
              
              <Button 
                onClick={() => onNavigate('history')}
                className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl"
              >
                Histórico
              </Button> */}
              
              <Button 
                onClick={onLogout}
                className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl"
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomNavigation currentScreen="dashboard" onNavigate={onNavigate} />
      
      <NotificationsCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAllNotifications}
      />
    </div>
  );
}

    </div>
  );
}

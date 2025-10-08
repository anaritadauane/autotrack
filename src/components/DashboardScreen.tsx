import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Plus, Home, Car, User, MoreHorizontal, Edit, Trash2, ChevronRight, Calculator, Bell } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { toast } from 'sonner';
import { VehicleCard } from './VehicleCard';
import { VehicleDetails } from './VehicleDetails';
import { VehicleForm } from './VehicleForm';
import { DocumentManager } from './DocumentManager';
import { apiRequest } from '../utils/supabase/client';
import { Vehicle } from '../types/vehicle';


interface DashboardScreenProps {
  user: { name: string; avatar: string };
  onNavigate: (screen: 'dashboard' | 'history' | 'profile' | 'payments' | 'login') => void;
  onLogout: () => void;
}


export function DashboardScreen({ user, onNavigate, onLogout }: DashboardScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load vehicles on component mount and set up auto refresh
  useEffect(() => {
    loadVehicles();
    checkExpiringItems();
    
    // Auto refresh every 5 minutes for expiry notifications
    const interval = setInterval(() => {
      checkExpiringItems();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkExpiringItems = async () => {
    try {
      const response = await apiRequest('/vehicles');
      const vehicles = response.vehicles || [];
      const notifications: { type: string; message: string; }[] = [];
      
      vehicles.forEach((vehicle: any) => {
        // Check insurance expiry
        if (vehicle.insurance?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.insurance.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
            notifications.push({
              type: 'warning',
              message: `Seguro de ${vehicle.name} expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`
            });
          } else if (daysUntilExpiry < 0) {
            notifications.push({
              type: 'error',
              message: `Seguro de ${vehicle.name} já expirou!`
            });
          }
        }
        
        // Check inspection expiry
        if (vehicle.inspection?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.inspection.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 14 && daysUntilExpiry >= 0) {
            notifications.push({
              type: 'warning',
              message: `Inspeção de ${vehicle.name} expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`
            });
          } else if (daysUntilExpiry < 0) {
            notifications.push({
              type: 'error',
              message: `Inspeção de ${vehicle.name} já expirou!`
            });
          }
        }
        
        // Check taxes expiry
        if (vehicle.taxes?.date) {
          const daysUntilExpiry = Math.floor(
            (new Date(vehicle.taxes.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            notifications.push({
              type: 'warning',
              message: `Impostos de ${vehicle.name} vencem em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}!`
            });
          } else if (daysUntilExpiry < 0) {
            notifications.push({
              type: 'error',
              message: `Impostos de ${vehicle.name} já venceram!`
            });
          }
        }
      });
      
      // Show notifications with a small delay
      notifications.forEach((notification, index) => {
        setTimeout(() => {
          if (notification.type === 'error') {
            toast.error(notification.message);
          } else {
            toast.warning(notification.message);
          }
        }, index * 1000); // Stagger notifications
      });
      
    } catch (err) {
      console.error('Check expiring items error:', err);
    }
  };

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/vehicles');
      setVehicles(response.vehicles || []);
      
      // Set first vehicle as selected if none selected
      if (response.vehicles && response.vehicles.length > 0 && !selectedVehicle) {
        setSelectedVehicle(response.vehicles[0]);
      }
    } catch (err) {
      console.error('Load vehicles error:', err);
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
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
      
      // Reload vehicles
      await loadVehicles();
      
      // Clear selection if deleted vehicle was selected
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle(vehicles.length > 1 ? vehicles[0] : null);
      }
    } catch (err) {
      console.error('Delete vehicle error:', err);
      setError('Failed to delete vehicle');
    }
  };

  const handleVehicleSave = async (savedVehicle: Vehicle) => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
    
    // Reload vehicles to get updated data
    await loadVehicles();
    
    // Select the saved vehicle
    setSelectedVehicle(savedVehicle);
  };

  const handleVehicleFormCancel = () => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center relative overflow-hidden mx-auto mb-2">
            <span className="text-white font-bold text-sm">T</span>
            <div className="absolute top-0 right-0 w-3 h-8 bg-teal-600"></div>
            <div className="absolute bottom-0 left-1 w-2 h-1 bg-yellow-400"></div>
          </div>
          <div className="text-gray-600">Carregando viaturas...</div>
        </div>
      </div>
    );
  }

  // Show vehicle form as full screen
  if (showVehicleForm) {
    return (
      <VehicleForm
        vehicle={editingVehicle} 
        onSave={handleVehicleSave}
        onCancel={handleVehicleFormCancel}
      />
    );
  }

  // Show document manager as full screen
  if (showDocumentManager && selectedVehicle) {
    return (
      <DocumentManager
        vehicle={selectedVehicle}
        onClose={() => setShowDocumentManager(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center relative overflow-hidden">
              <span className="text-white font-bold text-sm">T</span>
              <div className="absolute top-0 right-0 w-3 h-8 bg-teal-600"></div>
              <div className="absolute bottom-0 left-1 w-2 h-1 bg-yellow-400"></div>
            </div>
          </div>
        </div>
        <button>
          <MoreHorizontal className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Welcome */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-medium text-gray-900">Olá, {user.name}</h1>
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <Button 
            onClick={() => setError('')} 
            variant="ghost" 
            size="sm" 
            className="mt-1 text-red-700 hover:text-red-900"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Vehicles Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900">Viaturas</h2>
          <Button 
            onClick={handleAddVehicle}
            size="sm" 
            variant="outline" 
            className="rounded-full w-8 h-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Vehicle Cards */}
        {vehicles.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="relative group">
                <VehicleCard
                  vehicle={vehicle}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={() => setSelectedVehicle(vehicle)}
                />
                
                {/* Edit/Delete buttons */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    onClick={() => handleEditVehicle(vehicle)}
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 bg-white shadow-sm"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteVehicle(vehicle)}
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Nenhuma viatura registrada</p>
            <Button onClick={handleAddVehicle} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira viatura
            </Button>
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      {selectedVehicle && (
        <div className="px-4 mb-6">
          <VehicleDetails 
            vehicle={selectedVehicle} 
            onOpenDocuments={() => setShowDocumentManager(true)}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 space-y-3 mb-4">
        <Button className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl">
          <User className="w-5 h-5 mr-3" />
          Dados Pessoais
        </Button>
        
        <Button className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl">
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
        </Button>
        
        <Button 
          onClick={onLogout}
          className="w-full h-12 bg-gray-200 text-gray-700 hover:bg-gray-300 justify-start rounded-xl"
        >
          Logout
        </Button>
      </div>

      {/* Explore Section */}
      {/* <div className="px-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Explorar</h3>
        <div className="space-y-2">
          <button 
            onClick={() => toast.info('Guias e dicas sobre gestão de viaturas em breve!')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xs">⚡</span>
              </div>
              <span className="text-sm">Guias e Dicas</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button 
            onClick={() => toast.info('Relatórios detalhados em desenvolvimento!')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xs">📊</span>
              </div>
              <span className="text-sm">Relatórios</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button 
            onClick={() => toast.info('Sistema de metas para gastos com viaturas em breve!')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xs">🎯</span>
              </div>
              <span className="text-sm">Metas e Objetivos</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button 
            onClick={() => toast.info('Calculadora de custos de viaturas em desenvolvimento!')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm">Calculadora de Custos</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button 
            onClick={() => toast.info('Lembretes automáticos para manutenção em breve!')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm">Lembretes Inteligentes</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div> */}

      <BottomNavigation currentScreen="dashboard" onNavigate={onNavigate} />


    </div>
  );
}
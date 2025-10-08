import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Save, X, Camera, Home, Car } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner'

interface UserProfileScreenProps {
  user: { name: string; avatar: string };
  onNavigate: (screen: 'login' | 'dashboard' | 'history' | 'profile' | 'payments') => void;
  onLogout: () => void;
}

interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  avatar?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export function UserProfileScreen({ user, onNavigate, onLogout }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name,
    avatar: user.avatar
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDocuments: 0,
    expiredItems: 0,
    expiringItems: 0,
    validItems: 0
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiRequest('/profile');
      setProfile(prev => ({
        ...prev,
        ...response.user
      }));
    } catch (err) {
      console.error('Load profile error:', err);
      toast.error('Falha ao carregar perfil');
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

  const handleEditField = (field: string) => {
    setEditingField(field);
    setTempValue(profile[field as keyof UserProfile] || '');
  };

  const handleSaveField = async (field: string) => {
    if (!tempValue.trim()) {
      setEditingField(null);
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData = { [field]: tempValue };
      await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setProfile(prev => ({ ...prev, [field]: tempValue }));
      setEditingField(null);
      toast.success('Perfil atualizado com sucesso');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Falha ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const renderEditableField = (field: string, label: string, value: string, type: string = 'text') => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div className="flex-1">
          <Label className="text-sm text-gray-600">{label}</Label>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => handleSaveField(field)}
                disabled={isLoading}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm">{value || 'Não informado'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditField(field)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (count: number, total: number) => {
    if (count === 0) return 'bg-gray-100 text-gray-600';
    const percentage = (count / total) * 100;
    if (percentage > 50) return 'bg-red-100 text-red-700';
    if (percentage > 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium">Perfil</h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-xl">{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                    variant="outline"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-medium">{profile.name}</h2>
                  <p className="text-sm text-gray-600">{profile.email || 'Email não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalVehicles}</div>
                  <div className="text-sm text-gray-600">Viaturas</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalDocuments}</div>
                  <div className="text-sm text-gray-600">Documentos</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.expiredItems}</div>
                  <div className="text-sm text-gray-600">Expirados</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.expiringItems}</div>
                  <div className="text-sm text-gray-600">A Expirar</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderEditableField('name', 'Nome Completo', profile.name)}
              {renderEditableField('email', 'Email', profile.email || '', 'email')}
              {renderEditableField('phone', 'Telefone', profile.phone || '', 'tel')}
              {renderEditableField('licenseNumber', 'Número da Carta de Condução', profile.licenseNumber || '')}
              {renderEditableField('licenseExpiry', 'Validade da Carta', profile.licenseExpiry || '', 'date')}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderEditableField('address', 'Endereço', profile.address || '')}
              {renderEditableField('city', 'Cidade', profile.city || '')}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderEditableField('emergencyContact', 'Nome do Contacto', profile.emergencyContact || '')}
              {renderEditableField('emergencyPhone', 'Telefone de Emergência', profile.emergencyPhone || '', 'tel')}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => onNavigate('payments')}
              className="w-full h-12 bg-green-600 hover:bg-green-700 justify-start rounded-xl"
            >
              <div className="w-5 h-5 mr-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">$</span>
              </div>
              Gestão de Pagamentos
            </Button>
            
            <Button 
              onClick={onLogout}
              variant="outline"
              className="w-full h-12 text-red-600 border-red-600 hover:bg-red-50 justify-start rounded-xl"
            >
              Terminar Sessão
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Shield, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
// @ts-ignore
import logoImage from '../assets/logo.png';

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
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Falha ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: string, label: string, icon: any, value?: string) => {
    const Icon = icon;
    const isEditing = editingField === field;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all border-2 border-gray-100"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Label className="text-xs text-gray-600 mb-1">{label}</Label>
          {isEditing ? (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="h-8 text-sm border-2"
              autoFocus
            />
          ) : (
            <p className="text-gray-900 font-medium truncate">
              {value || 'Não definido'}
            </p>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                onClick={() => handleSaveField(field)}
                disabled={isLoading}
                className="w-8 h-8 p-0 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingField(null)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditField(field)}
              className="w-8 h-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Autotrack" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-semibold">Meu Perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {profile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0"
                  >
                    <Button 
                      size="sm" 
                      className="w-10 h-10 rounded-full bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                <p className="text-gray-600 mb-4">{profile.email || 'Email não definido'}</p>
                
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                  <Badge variant="outline">
                    Membro desde 2024
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Suas Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{stats.totalVehicles}</div>
                  <div className="text-blue-100 text-sm">Viaturas</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{stats.validItems}</div>
                  <div className="text-green-100 text-sm">Válidos</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{stats.expiringItems}</div>
                  <div className="text-yellow-100 text-sm">A Expirar</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{stats.totalDocuments}</div>
                  <div className="text-purple-100 text-sm">Documentos</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              {renderField('name', 'Nome Completo', User, profile.name)}
              {renderField('email', 'Email', Mail, profile.email)}
              {renderField('phone', 'Telefone', Phone, profile.phone)}
              {renderField('address', 'Endereço', MapPin, profile.address)}
              {renderField('city', 'Cidade', MapPin, profile.city)}
            </div>
          </motion.div>

          {/* License Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Carta de Condução
            </h3>
            <div className="space-y-3">
              {renderField('licenseNumber', 'Número da Carta', Shield, profile.licenseNumber)}
              {renderField('licenseExpiry', 'Data de Validade', Calendar, profile.licenseExpiry)}
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Contacto de Emergência
            </h3>
            <div className="space-y-3">
              {renderField('emergencyContact', 'Nome', User, profile.emergencyContact)}
              {renderField('emergencyPhone', 'Telefone', Phone, profile.emergencyPhone)}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button 
              onClick={() => onNavigate('dashboard')}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Voltar ao Dashboard
            </Button>
            
            <Button 
              onClick={onLogout}
              variant="outline"
              className="w-full h-14 border-2 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
            >
              Sair da Conta
            </Button>
          </motion.div>
        </div>
      </div>

      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} />
    </div>
  );
}

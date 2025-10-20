
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Calendar, Shield, ClipboardCheck, DollarSign, Car, Edit, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { getDefaultImageForType, getVehicleTypeIcon, getVehicleTypeLabel, VehicleType } from '../utils/vehicleDefaults';

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

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onOpenDocuments?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusColor = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'expired': return 'bg-red-500';
  }
};

const getStatusText = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid': return 'Válido';
    case 'warning': return 'A Expirar';
    case 'expired': return 'Expirado';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Não definido';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function VehicleDetails({ vehicle, onOpenDocuments, onEdit, onDelete }: VehicleDetailsProps) {
  const statusItems = [
    {
      icon: Shield,
      label: 'Seguro',
      date: vehicle.insurance.date,
      status: vehicle.insurance.status,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ClipboardCheck,
      label: 'Inspeção',
      date: vehicle.inspection.date,
      status: vehicle.inspection.status,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: DollarSign,
      label: 'Impostos',
      date: vehicle.taxes.date,
      status: vehicle.taxes.status,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  // Get the effective image to display
  const effectiveImage = vehicle.imageUrl || (vehicle.type ? getDefaultImageForType(vehicle.type) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden shadow-lg border-2">
        <CardContent className="p-0">
          {/* Image Header */}
          <div className="relative h-48 bg-gradient-to-br from-white-800 to-white-900 overflow-hidden">
            {effectiveImage ? (
              <ImageWithFallback
                src={effectiveImage}
                alt={vehicle.name}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <Car className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Vehicle Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{vehicle.name}</h2>
                {vehicle.type && (
                  <span className="text-2xl">{getVehicleTypeIcon(vehicle.type)}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {vehicle.plate}
                </span>
                {vehicle.type && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {getVehicleTypeLabel(vehicle.type)}
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {vehicle.year}
                </span>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="p-4 space-y-3">
            {statusItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className={`flex items-center gap-3 p-3 rounded-xl ${item.bgColor} transition-all hover:shadow-md`}>
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <Badge 
                        className={`${getStatusColor(item.status)} text-xs`}
                      >
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2">
            {onOpenDocuments && (
              <Button 
                onClick={onOpenDocuments}
                className="w-full bg-red-500 hover:bg-red-600"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Documentos
              </Button>
            )}
            
            {(onEdit || onDelete) && (
              <div className="grid grid-cols-2 gap-2">
                {onEdit && (
                  <Button 
                    onClick={onEdit}
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    size="lg"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    onClick={onDelete}
                    variant="outline"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

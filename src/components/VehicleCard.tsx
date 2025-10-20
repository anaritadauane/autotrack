
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './ui/badge';
import { Car } from 'lucide-react';
import { getDefaultImageForType, getVehicleTypeIcon, VehicleType } from '../utils/vehicleDefaults';

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

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}

const getStatusColor = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'expired': return 'bg-red-500';
  }
};

const getOverallStatus = (vehicle: Vehicle) => {
  const statuses = [vehicle.insurance.status, vehicle.inspection.status, vehicle.taxes.status];
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('warning')) return 'warning';
  return 'valid';
};

export function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  const overallStatus = getOverallStatus(vehicle);
  
  // Get the effective image to display
  const effectiveImage = vehicle.imageUrl || (vehicle.type ? getDefaultImageForType(vehicle.type) : null);
  
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="flex-shrink-0"
    >
      <Card 
        className={`w-[140px] cursor-pointer transition-all duration-300 overflow-hidden ${ 
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20' 
            : 'shadow-lg hover:shadow-xl'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-0">
          {/* Image Section - Fixed height */}
          <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {effectiveImage ? (
              <ImageWithFallback
                src={effectiveImage}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Car className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Status Badge Overlay */}
            <div className="absolute top-2 right-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(overallStatus)} shadow-lg ring-2 ring-white`}></div>
            </div>

            {/* Vehicle Type Icon */}
            {vehicle.type && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                <span className="text-sm">{getVehicleTypeIcon(vehicle.type)}</span>
              </div>
            )}
          </div>

          {/* Info Section - Fixed height */}
          <div className="p-3 h-[76px] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="font-medium text-sm text-gray-900 truncate">
                {vehicle.name}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {vehicle.plate}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{vehicle.year}</span>
              <Badge 
                variant={overallStatus === 'valid' ? 'default' : 'destructive'} 
                className={`text-xs h-5 ${
                  overallStatus === 'valid' ? 'bg-green-500' : 
                  overallStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                {overallStatus === 'valid' ? '✓' : overallStatus === 'warning' ? '!' : '✗'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

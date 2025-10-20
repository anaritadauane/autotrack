import { motion } from 'motion/react';
import { VEHICLE_TYPES, getVehicleTypeLabel, getVehicleTypeIcon, VehicleType } from '../utils/vehicleDefaults';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface VehicleTypeCount {
  type: VehicleType;
  count: number;
  color: string;
}

interface VehicleProgressBarProps {
  vehicles: Array<{
    type?: VehicleType;
    id: string;
    insurance: { status: 'valid' | 'expired' | 'warning' };
    inspection: { status: 'valid' | 'expired' | 'warning' };
    taxes: { status: 'valid' | 'expired' | 'warning' };
  }>;
}

const TYPE_COLORS: Record<VehicleType, string> = {
  suv: '#3b82f6',      // Blue
  sedan: '#10b981',    // Green
  hatchback: '#f59e0b', // Amber
  pickup: '#8b5cf6',   // Purple
  minivan: '#ec4899',  // Pink
  coupe: '#ef4444',    // Red
  van: '#06b6d4',      // Cyan
  other: '#6b7280'     // Gray
};

export function VehicleProgressBar({ vehicles }: VehicleProgressBarProps) {
  // Count vehicles by type
  const typeCounts: VehicleTypeCount[] = VEHICLE_TYPES.map(vehicleType => {
    const count = vehicles.filter(v => v.type === vehicleType.value).length;
    return {
      type: vehicleType.value,
      count,
      color: TYPE_COLORS[vehicleType.value]
    };
  }).filter(tc => tc.count > 0);

  const totalVehicles = vehicles.length;

  // Calculate percentages
  const typePercentages = typeCounts.map(tc => ({
    ...tc,
    percentage: (tc.count / totalVehicles) * 100
  }));

  // Calculate overall health status
  const calculateVehicleHealth = (vehicle: VehicleProgressBarProps['vehicles'][0]) => {
    const statuses = [vehicle.insurance.status, vehicle.inspection.status, vehicle.taxes.status];
    if (statuses.includes('expired')) return 'expired';
    if (statuses.includes('warning')) return 'warning';
    return 'valid';
  };

  const vehiclesValid = vehicles.filter(v => calculateVehicleHealth(v) === 'valid').length;
  const vehiclesWarning = vehicles.filter(v => calculateVehicleHealth(v) === 'warning').length;
  const vehiclesExpired = vehicles.filter(v => calculateVehicleHealth(v) === 'expired').length;

  const percentValid = totalVehicles > 0 ? (vehiclesValid / totalVehicles) * 100 : 0;
  const percentWarning = totalVehicles > 0 ? (vehiclesWarning / totalVehicles) * 100 : 0;
  const percentExpired = totalVehicles > 0 ? (vehiclesExpired / totalVehicles) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overall Health Status Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-medium text-gray-700">Estado Geral da Frota</h4>
          <span className="text-xs text-gray-500">
            {totalVehicles} {totalVehicles === 1 ? 'Veículo' : 'Veículos'}
          </span>
        </div>
        
        {/* Status Progress Bar */}
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          {percentValid > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentValid}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-green-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span className="font-medium">Válidos</span>
                  </div>
                  <div className="text-gray-300 mt-1">
                    {vehiclesValid} {vehiclesValid === 1 ? 'veículo' : 'veículos'} ({percentValid.toFixed(0)}%)
                  </div>
                </div>
              </div>
              {percentValid > 15 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {percentValid.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
          
          {percentWarning > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentWarning}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="h-full bg-yellow-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">A Expirar</span>
                  </div>
                  <div className="text-gray-300 mt-1">
                    {vehiclesWarning} {vehiclesWarning === 1 ? 'veículo' : 'veículos'} ({percentWarning.toFixed(0)}%)
                  </div>
                </div>
              </div>
              {percentWarning > 15 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {percentWarning.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
          
          {percentExpired > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentExpired}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-red-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span className="font-medium">Expirados</span>
                  </div>
                  <div className="text-gray-300 mt-1">
                    {vehiclesExpired} {vehiclesExpired === 1 ? 'veículo' : 'veículos'} ({percentExpired.toFixed(0)}%)
                  </div>
                </div>
              </div>
              {percentExpired > 15 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {percentExpired.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Status Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Válidos ({vehiclesValid})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">A Expirar ({vehiclesWarning})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Expirados ({vehiclesExpired})</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Distribuição por Tipo</h4>
        
        {/* Type Progress Bar */}
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden flex">
          {typePercentages.map((tp, index) => (
            <motion.div
              key={tp.type}
              initial={{ width: 0 }}
              animate={{ width: `${tp.percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
              className="h-full relative group cursor-pointer"
              style={{ backgroundColor: tp.color }}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{getVehicleTypeIcon(tp.type)}</span>
                    <span className="font-medium">{getVehicleTypeLabel(tp.type)}</span>
                  </div>
                  <div className="text-gray-300 mt-1">
                    {tp.count} {tp.count === 1 ? 'veículo' : 'veículos'} ({tp.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>

              {/* Percentage text inside bar if wide enough */}
              {tp.percentage > 10 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {tp.percentage.toFixed(0)}%
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Type Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
          {typePercentages.map(tp => (
            <motion.div
              key={tp.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tp.color }}
              />
              {/* Icon and label */}
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <span className="text-base">{getVehicleTypeIcon(tp.type)}</span>
                <span className="font-medium">{getVehicleTypeLabel(tp.type)}</span>
                <span className="text-gray-500">
                  ({tp.count})
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
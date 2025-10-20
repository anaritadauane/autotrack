import { motion } from 'motion/react';
import { VEHICLE_TYPES, VehicleType } from '../utils/vehicleDefaults';
import { ImageWithFallback } from './ImageWithFallback';

interface VehicleTypeSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
}

export function VehicleTypeSelector({ value, onChange }: VehicleTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-900">Selecione o Tipo de Veículo</label>
      
      <div className="grid grid-cols-2 gap-3">
        {VEHICLE_TYPES.map((vehicleType, index) => (
          <motion.button
            key={vehicleType.value}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(vehicleType.value)}
            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
              value === vehicleType.value
                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* Image Preview */}
            <div className="relative h-20 overflow-hidden">
              <ImageWithFallback
                src={vehicleType.defaultImage}
                alt={vehicleType.label}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Icon Badge */}
              <div className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                <span className="text-lg">{vehicleType.icon}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5">
              <div className="font-medium text-sm text-gray-900 text-left">
                {vehicleType.label}
              </div>
              <div className="text-xs text-gray-500 text-left mt-0.5">
                {vehicleType.description}
              </div>
            </div>

            {/* Selected Indicator */}
            {value === vehicleType.value && (
              <motion.div
                layoutId="selected-type"
                className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

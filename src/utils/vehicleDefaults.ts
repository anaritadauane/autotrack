import suvImage1 from 'figma:asset/6111758959156ac8878b0f2170ad9e7a793a8c48.png';
import suvImage2 from 'figma:asset/a1a5454e8073ddda775c7b1c9743ceea23f529ce.png';

export type VehicleType = 'suv' | 'sedan' | 'hatchback' | 'pickup' | 'minivan' | 'coupe' | 'van' | 'other';

export interface VehicleTypeOption {
  value: VehicleType;
  label: string;
  defaultImage: string;
  icon?: string;
  description?: string;
}

export const VEHICLE_TYPES: VehicleTypeOption[] = [
  {
    value: 'suv',
    label: 'SUV',
    defaultImage: suvImage1,
    icon: '🚙',
    description: 'Sport Utility Vehicle'
  },
  {
    value: 'sedan',
    label: 'Sedan',
    defaultImage: 'https://images.unsplash.com/photo-1720248800225-78d6bc3442de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWRhbiUyMGNhciUyMHdoaXRlfGVufDF8fHx8MTc2MDg1MzM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🚗',
    description: 'Carro de passageiros'
  },
  {
    value: 'hatchback',
    label: 'Hatchback',
    defaultImage: 'https://images.unsplash.com/photo-1610768583681-fc0ddc5c3986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXRjaGJhY2slMjBjYXJ8ZW58MXx8fHwxNzYwODgyNTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🚘',
    description: 'Carro compacto'
  },
  {
    value: 'pickup',
    label: 'Pick-up',
    defaultImage: 'https://images.unsplash.com/photo-1649793395985-967862a3b73f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWNrdXAlMjB0cnVja3xlbnwxfHx8fDE3NjA4NzgzNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🛻',
    description: 'Camionete'
  },
  {
    value: 'minivan',
    label: 'Minivan',
    defaultImage: 'https://images.unsplash.com/photo-1744287970928-b12cd6429439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pdmFuJTIwZmFtaWx5fGVufDF8fHx8MTc2MDg1MzM2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🚐',
    description: 'Van familiar'
  },
  {
    value: 'coupe',
    label: 'Coupé',
    defaultImage: 'https://images.unsplash.com/photo-1708019932917-bd030be3ae3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwZSUyMHNwb3J0cyUyMGNhcnxlbnwxfHx8fDE3NjA4MjQyMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🏎️',
    description: 'Carro desportivo'
  },
  {
    value: 'van',
    label: 'Van',
    defaultImage: 'https://images.unsplash.com/photo-1587813369290-091c9d432daf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHZhbnxlbnwxfHx8fDE3NjA4NTQwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: '🚚',
    description: 'Van de carga'
  },
  {
    value: 'other',
    label: 'Outro',
    defaultImage: suvImage2,
    icon: '🚗',
    description: 'Outro tipo de veículo'
  }
];

/**
 * Obtém a imagem padrão para um tipo de veículo
 * @param type - Tipo do veículo
 * @returns URL da imagem padrão
 */
export const getDefaultImageForType = (type: VehicleType | undefined): string => {
  if (!type) return VEHICLE_TYPES[0].defaultImage;
  const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
  return vehicleType?.defaultImage || VEHICLE_TYPES[0].defaultImage;
};

/**
 * Obtém o label de um tipo de veículo
 * @param type - Tipo do veículo
 * @returns Label do tipo
 */
export const getVehicleTypeLabel = (type: VehicleType | undefined): string => {
  if (!type) return 'Outro';
  const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
  return vehicleType?.label || 'Outro';
};

/**
 * Obtém o ícone de um tipo de veículo
 * @param type - Tipo do veículo
 * @returns Ícone emoji do tipo
 */
export const getVehicleTypeIcon = (type: VehicleType | undefined): string => {
  if (!type) return '🚗';
  const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
  return vehicleType?.icon || '🚗';
};

/**
 * Obtém informações completas de um tipo de veículo
 * @param type - Tipo do veículo
 * @returns Objeto com todas as informações do tipo
 */
export const getVehicleTypeInfo = (type: VehicleType | undefined): VehicleTypeOption => {
  if (!type) return VEHICLE_TYPES[7]; // 'other'
  const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
  return vehicleType || VEHICLE_TYPES[7];
};
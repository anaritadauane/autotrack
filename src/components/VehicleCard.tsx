import React from 'react';
import { Card, CardContent } from './ui/card';
import { Vehicle } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  return (
    <Card 
      className={`min-w-[120px] h-24 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 h-full flex flex-col justify-center">
        <div className="text-xs text-gray-600 mb-1 text-center leading-tight">
          {vehicle.name}
        </div>
      </CardContent>
    </Card>
  );
}
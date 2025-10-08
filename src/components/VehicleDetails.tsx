import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Vehicle } from '../types/vehicle';



interface VehicleDetailsProps {
  vehicle: Vehicle;
  onOpenDocuments?: () => void;
}

const getStatusColor = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'expired': return 'bg-red-500';
  }
};

const getProgressValue = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid': return 100;
    case 'warning': return 60;
    case 'expired': return 20;
  }
};

export function VehicleDetails({ vehicle, onOpenDocuments }: VehicleDetailsProps) {
  return (
    <Card className="bg-gray-100">
      <CardContent className="p-4">
        <h3 className="text-xl font-medium text-gray-900 text-center mb-4">
          {vehicle.plate}
        </h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress 
            value={Math.min(
              getProgressValue(vehicle.insurance.status),
              getProgressValue(vehicle.inspection.status),
              getProgressValue(vehicle.taxes.status)
            )} 
            className="h-2"
          />
        </div>

        {/* Status Items */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.insurance.status)} mx-auto mb-1`}></div>
            <div className="text-xs font-medium text-gray-900">seguros</div>
            <div className="text-xs text-gray-600">{vehicle.insurance.date}</div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.inspection.status)} mx-auto mb-1`}></div>
            <div className="text-xs font-medium text-gray-900">inspeção</div>
            <div className="text-xs text-gray-600">{vehicle.inspection.date}</div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.taxes.status)} mx-auto mb-1`}></div>
            <div className="text-xs font-medium text-gray-900">Taxa's</div>
            <div className="text-xs text-gray-600">{vehicle.taxes.date}</div>
          </div>
        </div>

        {/* Document Button */}
        {onOpenDocuments && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => {
                toast.info('Abrindo gestor de documentos...');
                onOpenDocuments();
              }} 
              variant="outline" 
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
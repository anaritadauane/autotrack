import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Vehicle } from '../types/vehicle';


interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSave: (vehicle: Vehicle) => void | Promise<void>;
  onCancel: () => void;
}


const getStatusFromDate = (dateStr: string): 'valid' | 'expired' | 'warning' => {
  if (!dateStr) return 'expired';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMonths = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (diffMonths < 0) return 'expired';
  if (diffMonths < 2) return 'warning';
  return 'valid';
};

export function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState<Vehicle>({
    name: vehicle?.name || '',
    plate: vehicle?.plate || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    vin: vehicle?.vin || '',
    color: vehicle?.color || '',
    insurance: {
      date: vehicle?.insurance?.date || '',
      status: vehicle?.insurance?.status || 'expired',
      company: vehicle?.insurance?.company || '',
      policyNumber: vehicle?.insurance?.policyNumber || ''
    },
    inspection: {
      date: vehicle?.inspection?.date || '',
      status: vehicle?.inspection?.status || 'expired',
      center: vehicle?.inspection?.center || ''
    },
    taxes: {
      date: vehicle?.taxes?.date || '',
      status: vehicle?.taxes?.status || 'expired',
      amount: vehicle?.taxes?.amount || ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.plate || !formData.make || !formData.model) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update status based on dates
      const updatedFormData = {
        ...formData,
        insurance: {
          ...formData.insurance,
          status: getStatusFromDate(formData.insurance.date)
        },
        inspection: {
          ...formData.inspection,
          status: getStatusFromDate(formData.inspection.date)
        },
        taxes: {
          ...formData.taxes,
          status: getStatusFromDate(formData.taxes.date)
        }
      };

      let savedVehicle;
      if (vehicle?.id) {
        // Update existing vehicle
        const response = await apiRequest(`/vehicles/${vehicle.id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedFormData)
        });
        savedVehicle = response.vehicle;
      } else {
        // Create new vehicle
        const response = await apiRequest('/vehicles', {
          method: 'POST',
          body: JSON.stringify(updatedFormData)
        });
        savedVehicle = response.vehicle;
      }

      toast.success(vehicle ? 'Viatura atualizada com sucesso!' : 'Viatura adicionada com sucesso!');
      onSave(savedVehicle);
    } catch (err) {
      console.error('Save vehicle error:', err);
      const errorMessage = err instanceof Error ? err.message : (vehicle ? 'Falha ao atualizar viatura' : 'Falha ao adicionar viatura');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = <
  Section extends keyof Pick<Vehicle, 'insurance' | 'inspection' | 'taxes'>
>(
  section: Section,
  field: keyof Vehicle[Section],
  value: any
) => {
  setFormData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value
    }
  }));
};


  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium">{vehicle ? 'Editar Viatura' : 'Nova Viatura'}</h1>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Vehicle Info */}
            <div className="space-y-4">
              <h3 className="font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Viatura *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="ex: TOYOTA HILUX CD6"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="plate">Matrícula *</Label>
                  <Input
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => updateField('plate', e.target.value)}
                    placeholder="ex: AIP 120 MC"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Marca *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => updateField('make', e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="Hilux"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vin">VIN/Chassis</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => updateField('vin', e.target.value)}
                    placeholder="17 dígitos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    placeholder="Branco"
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4">
              <h3 className="font-medium">Seguro</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceDate">Data de Validade</Label>
                  <Input
                    id="insuranceDate"
                    type="date"
                    value={formData.insurance.date}
                    onChange={(e) => updateNestedField('insurance', 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="insuranceCompany">Seguradora</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insurance.company}
                    onChange={(e) => updateNestedField('insurance', 'company', e.target.value)}
                    placeholder="Nome da seguradora"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="policyNumber">Número da Apólice</Label>
                <Input
                  id="policyNumber"
                  value={formData.insurance.policyNumber}
                  onChange={(e) => updateNestedField('insurance', 'policyNumber', e.target.value)}
                  placeholder="Número da apólice"
                />
              </div>
            </div>

            {/* Inspection */}
            <div className="space-y-4">
              <h3 className="font-medium">Inspeção</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionDate">Data de Validade</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspection.date}
                    onChange={(e) => updateNestedField('inspection', 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="inspectionCenter">Centro de Inspeção</Label>
                  <Input
                    id="inspectionCenter"
                    value={formData.inspection.center}
                    onChange={(e) => updateNestedField('inspection', 'center', e.target.value)}
                    placeholder="Nome do centro"
                  />
                </div>
              </div>
            </div>

            {/* Taxes */}
            <div className="space-y-4">
              <h3 className="font-medium">Taxas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxesDate">Data de Validade</Label>
                  <Input
                    id="taxesDate"
                    type="date"
                    value={formData.taxes.date}
                    onChange={(e) => updateNestedField('taxes', 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxesAmount">Valor Pago</Label>
                  <Input
                    id="taxesAmount"
                    value={formData.taxes.amount}
                    onChange={(e) => updateNestedField('taxes', 'amount', e.target.value)}
                    placeholder="1.000,00 MT"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

          </form>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-red-500 hover:bg-red-600"
            onClick={handleSubmit}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
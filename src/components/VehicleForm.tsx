import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ArrowLeft, Upload, X, Car } from 'lucide-react';
import { apiRequest, supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { VEHICLE_TYPES, VehicleType, getDefaultImageForType } from '../utils/vehicleDefaults';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSave: (vehicle: any) => void | Promise<void>;
  onCancel: () => void;
}

interface Vehicle {
  id?: string;
  name: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  color?: string;
  imageUrl?: string;
  type?: VehicleType;
  insurance: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    company?: string;
    policyNumber?: string;
  };
  inspection: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    center?: string;
  };
  taxes: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    amount?: string;
  };
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
    imageUrl: vehicle?.imageUrl || '',
    type: vehicle?.type || 'suv',
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(vehicle?.imageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the effective image to display (user uploaded or default based on type)
  const getEffectiveImage = () => {
    if (imagePreview) return imagePreview;
    if (formData.type) return getDefaultImageForType(formData.type);
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 10MB.');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.plate || !formData.make || !formData.model) {
      setError('Por favor preencha todos os campos obrigatórios');
      toast.error('Por favor preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update status based on dates
      const updatedFormData = {
        ...formData,
        // If no custom image was uploaded, use the default for the type
        imageUrl: imagePreview || getDefaultImageForType(formData.type || 'suv'),
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

      // Upload image if selected
      if (imageFile && savedVehicle.id) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const session = await supabase.auth.getSession();
        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b763bb62/vehicles/${savedVehicle.id}/image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.data.session?.access_token}`
            },
            body: uploadFormData
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          savedVehicle = uploadResult.vehicle;
          toast.success('Imagem da viatura enviada com sucesso!');
        }
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

  type NestedSection = 'insurance' | 'inspection' | 'taxes';

  const updateNestedField = (section: NestedSection, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value
      }
    }));
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
    return vehicleType ? vehicleType.label : 'Veículo';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-white shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {vehicle ? 'Editar Viatura' : 'Nova Viatura'}
          </h1>
        </div>
      </motion.div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200">
                <Label className="block mb-3 font-medium text-gray-900">Imagem da Viatura</Label>
                
                <div className="relative">
                  {getEffectiveImage() ? (
                    <div className="relative rounded-xl overflow-hidden group">
                      <ImageWithFallback
                        src={getEffectiveImage()!}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-100/50 transition-all">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-blue-600" />
                        </div>
                        <Upload className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Carregar Imagem</span>
                        <span className="text-xs text-gray-600">PNG, JPG até 10MB</span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Basic Vehicle Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Viatura *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="ex: TOYOTA HILUX"
                    required
                    className="border-2"
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
                    className="border-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Tipo de Veículo</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: VehicleType) => updateField('type', value)}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Selecione o tipo">
                      {formData.type && (
                        <span className="flex items-center gap-2">
                          <span>{VEHICLE_TYPES.find(vt => vt.value === formData.type)?.icon}</span>
                          <span>{VEHICLE_TYPES.find(vt => vt.value === formData.type)?.label}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((vehicleType) => (
                      <SelectItem key={vehicleType.value} value={vehicleType.value}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{vehicleType.icon}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{vehicleType.label}</span>
                            <span className="text-xs text-gray-500">{vehicleType.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.type && !imagePreview && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <span>💡</span>
                    <span>Imagem padrão de {getVehicleTypeLabel(formData.type)} será usada</span>
                  </p>
                )}
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
                    className="border-2"
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
                    className="border-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="2024"
                    className="border-2"
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
                    className="border-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    placeholder="Branco"
                    className="border-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Insurance */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-100"
            >
              <h3 className="font-semibold text-gray-900">🛡️ Seguro</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceDate">Data de Validade</Label>
                  <Input
                    id="insuranceDate"
                    type="date"
                    value={formData.insurance.date}
                    onChange={(e) => updateNestedField('insurance', 'date', e.target.value)}
                    className="border-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="insuranceCompany">Seguradora</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insurance.company}
                    onChange={(e) => updateNestedField('insurance', 'company', e.target.value)}
                    placeholder="Nome da seguradora"
                    className="border-2"
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
                  className="border-2"
                />
              </div>
            </motion.div>

            {/* Inspection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-100"
            >
              <h3 className="font-semibold text-gray-900">✓ Inspeção</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionDate">Data de Validade</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspection.date}
                    onChange={(e) => updateNestedField('inspection', 'date', e.target.value)}
                    className="border-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inspectionCenter">Centro de Inspeção</Label>
                  <Input
                    id="inspectionCenter"
                    value={formData.inspection.center}
                    onChange={(e) => updateNestedField('inspection', 'center', e.target.value)}
                    placeholder="Nome do centro"
                    className="border-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Taxes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 p-4 bg-green-50 rounded-xl border-2 border-green-100"
            >
              <h3 className="font-semibold text-gray-900">💰 Impostos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxesDate">Data de Validade</Label>
                  <Input
                    id="taxesDate"
                    type="date"
                    value={formData.taxes.date}
                    onChange={(e) => updateNestedField('taxes', 'date', e.target.value)}
                    className="border-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxesAmount">Valor Pago</Label>
                  <Input
                    id="taxesAmount"
                    value={formData.taxes.amount}
                    onChange={(e) => updateNestedField('taxes', 'amount', e.target.value)}
                    placeholder="1.000,00 MT"
                    className="border-2"
                  />
                </div>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t bg-white shadow-lg"
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-red-500 hover:bg-red-600"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

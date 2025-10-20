import { motion } from 'motion/react';
import { Shield, ClipboardCheck, DollarSign, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getVehicleTypeIcon, VehicleType } from '../utils/vehicleDefaults';
import { Card } from './ui/card';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type?: VehicleType;
  insurance: { date: string; status: 'valid' | 'expired' | 'warning' };
  inspection: { date: string; status: 'valid' | 'expired' | 'warning' };
  taxes: { date: string; status: 'valid' | 'expired' | 'warning' };
}

interface VehicleDocumentStatusProps {
  vehicles: Vehicle[];
}

const getStatusIcon = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'expired':
      return <XCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid':
      return 'bg-green-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'expired':
      return 'bg-red-500 text-white';
  }
};

const getStatusBgColor = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'expired':
      return 'bg-red-50 border-red-200';
  }
};

const getStatusLabel = (status: 'valid' | 'expired' | 'warning') => {
  switch (status) {
    case 'valid':
      return 'Válido';
    case 'warning':
      return 'A Expirar';
    case 'expired':
      return 'Expirado';
  }
};

const calculateDaysRemaining = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function VehicleDocumentStatus({ vehicles }: VehicleDocumentStatusProps) {
  // Calculate overall stats
  const totalDocuments = vehicles.length * 3;
  const validCount = vehicles.reduce((acc, v) => 
    acc + (v.insurance.status === 'valid' ? 1 : 0) +
          (v.inspection.status === 'valid' ? 1 : 0) +
          (v.taxes.status === 'valid' ? 1 : 0), 0
  );
  const warningCount = vehicles.reduce((acc, v) => 
    acc + (v.insurance.status === 'warning' ? 1 : 0) +
          (v.inspection.status === 'warning' ? 1 : 0) +
          (v.taxes.status === 'warning' ? 1 : 0), 0
  );
  const expiredCount = vehicles.reduce((acc, v) => 
    acc + (v.insurance.status === 'expired' ? 1 : 0) +
          (v.inspection.status === 'expired' ? 1 : 0) +
          (v.taxes.status === 'expired' ? 1 : 0), 0
  );

  const validPercentage = (validCount / totalDocuments) * 100;
  const warningPercentage = (warningCount / totalDocuments) * 100;
  const expiredPercentage = (expiredCount / totalDocuments) * 100;

  return (
    <div className="space-y-4">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Documentos: {totalDocuments} totais
          </h3>
          <span className="text-sm text-gray-600">
            {validPercentage.toFixed(0)}% válidos
          </span>
        </div>
        
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden flex">
          {validCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${validPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-green-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="font-medium">✓ Válidos</div>
                  <div className="text-gray-300 mt-1">{validCount} documentos ({validPercentage.toFixed(1)}%)</div>
                </div>
              </div>
              {validPercentage > 12 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {validPercentage.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
          
          {warningCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${warningPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="h-full bg-yellow-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="font-medium">⚠ A Expirar</div>
                  <div className="text-gray-300 mt-1">{warningCount} documentos ({warningPercentage.toFixed(1)}%)</div>
                </div>
              </div>
              {warningPercentage > 12 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {warningPercentage.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
          
          {expiredCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expiredPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-red-500 relative group cursor-pointer"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="font-medium">✗ Expirados</div>
                  <div className="text-gray-300 mt-1">{expiredCount} documentos ({expiredPercentage.toFixed(1)}%)</div>
                </div>
              </div>
              {expiredPercentage > 12 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {expiredPercentage.toFixed(0)}%
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-700">Válidos: {validCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-700">A Expirar: {warningCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-700">Expirados: {expiredCount}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Matrix */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Status por Tipo de Documento</h4>
        
        {/* Insurance Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">🛡️ Seguros</span>
            </div>
            <span className="text-xs text-gray-500">{vehicles.length} total</span>
          </div>
          
          {(() => {
            const validInsurance = vehicles.filter(v => v.insurance.status === 'valid').length;
            const warningInsurance = vehicles.filter(v => v.insurance.status === 'warning').length;
            const expiredInsurance = vehicles.filter(v => v.insurance.status === 'expired').length;
            
            const validPercent = (validInsurance / vehicles.length) * 100;
            const warningPercent = (warningInsurance / vehicles.length) * 100;
            const expiredPercent = (expiredInsurance / vehicles.length) * 100;

            return (
              <>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                  {validPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${validPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-green-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✓ Válidos ({validInsurance})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.insurance.status === 'valid').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {validPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {validPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {warningPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${warningPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                      className="h-full bg-yellow-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">⚠ A Expirar ({warningInsurance})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.insurance.status === 'warning').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {warningPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {warningPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {expiredPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${expiredPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-red-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✗ Expirados ({expiredInsurance})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.insurance.status === 'expired').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {expiredPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {expiredPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">{validInsurance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">{warningInsurance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">{expiredInsurance}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Inspection Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">🔧 Inspeções</span>
            </div>
            <span className="text-xs text-gray-500">{vehicles.length} total</span>
          </div>
          
          {(() => {
            const validInspection = vehicles.filter(v => v.inspection.status === 'valid').length;
            const warningInspection = vehicles.filter(v => v.inspection.status === 'warning').length;
            const expiredInspection = vehicles.filter(v => v.inspection.status === 'expired').length;
            
            const validPercent = (validInspection / vehicles.length) * 100;
            const warningPercent = (warningInspection / vehicles.length) * 100;
            const expiredPercent = (expiredInspection / vehicles.length) * 100;

            return (
              <>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                  {validPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${validPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                      className="h-full bg-green-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✓ Válidos ({validInspection})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.inspection.status === 'valid').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {validPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {validPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {warningPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${warningPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-yellow-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">⚠ A Expirar ({warningInspection})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.inspection.status === 'warning').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {warningPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {warningPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {expiredPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${expiredPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="h-full bg-red-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✗ Expirados ({expiredInspection})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.inspection.status === 'expired').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {expiredPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {expiredPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">{validInspection}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">{warningInspection}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">{expiredInspection}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Taxes Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">💰 Impostos</span>
            </div>
            <span className="text-xs text-gray-500">{vehicles.length} total</span>
          </div>
          
          {(() => {
            const validTaxes = vehicles.filter(v => v.taxes.status === 'valid').length;
            const warningTaxes = vehicles.filter(v => v.taxes.status === 'warning').length;
            const expiredTaxes = vehicles.filter(v => v.taxes.status === 'expired').length;
            
            const validPercent = (validTaxes / vehicles.length) * 100;
            const warningPercent = (warningTaxes / vehicles.length) * 100;
            const expiredPercent = (expiredTaxes / vehicles.length) * 100;

            return (
              <>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                  {validPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${validPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-green-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✓ Válidos ({validTaxes})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.taxes.status === 'valid').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {validPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {validPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {warningPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${warningPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="h-full bg-yellow-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">⚠ A Vencer ({warningTaxes})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.taxes.status === 'warning').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {warningPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {warningPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {expiredPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${expiredPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                      className="h-full bg-red-500 relative group cursor-pointer"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="font-medium">✗ Vencidos ({expiredTaxes})</div>
                          <div className="text-gray-300 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                            {vehicles.filter(v => v.taxes.status === 'expired').map(v => (
                              <div key={v.id}>{v.type && getVehicleTypeIcon(v.type)} {v.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {expiredPercent > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                          {expiredPercent.toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">{validTaxes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">{warningTaxes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">{expiredTaxes}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
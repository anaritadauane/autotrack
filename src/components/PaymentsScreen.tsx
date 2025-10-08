import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, CreditCard, Calendar, DollarSign, Plus, CheckCircle, AlertCircle, Clock, Home, Car, User } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';

interface PaymentsScreenProps {
  user: { name: string; avatar: string };
  onNavigate: (screen: 'login' | 'dashboard' | 'history' | 'profile' | 'payments') => void;
  onLogout: () => void;
}

interface Payment {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  type: 'insurance' | 'inspection' | 'taxes' | 'fine';
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  paymentMethod?: string;
  reference?: string;
}

interface PaymentReminder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'insurance' | 'inspection' | 'taxes';
  dueDate: string;
  daysUntilDue: number;
  estimatedAmount?: string;
}

export function PaymentsScreen({ user, onNavigate, onLogout }: PaymentsScreenProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadPayments();
    loadReminders();
  }, []);

  const loadPayments = async () => {
    try {
      // Generate mock payment data based on vehicles for demo
      const vehicles = await apiRequest('/vehicles');
      const mockPayments: Payment[] = [];
      
      vehicles.vehicles?.forEach((vehicle: any) => {
        // Insurance payment
        if (vehicle.insurance?.date) {
          const dueDate = new Date(vehicle.insurance.date);
          const daysToDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          mockPayments.push({
            id: `insurance_${vehicle.id}`,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            vehiclePlate: vehicle.plate,
            type: 'insurance',
            amount: '15,000.00 MT',
            dueDate: vehicle.insurance.date,
            status: daysToDue < 0 ? 'overdue' : daysToDue < 30 ? 'pending' : 'pending',
            description: `Renovação de seguro - ${vehicle.insurance.company || 'Seguradora'}`,
            reference: `SEG${vehicle.id.slice(-6).toUpperCase()}`
          });
        }
        
        // Tax payment
        if (vehicle.taxes?.date) {
          const dueDate = new Date(vehicle.taxes.date);
          const daysToDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          mockPayments.push({
            id: `taxes_${vehicle.id}`,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            vehiclePlate: vehicle.plate,
            type: 'taxes',
            amount: vehicle.taxes.amount || '8,500.00 MT',
            dueDate: vehicle.taxes.date,
            status: daysToDue < 0 ? 'overdue' : 'pending',
            description: 'Impostos sobre veículos',
            reference: `TAX${vehicle.id.slice(-6).toUpperCase()}`
          });
        }

        // Inspection payment
        if (vehicle.inspection?.date) {
          const dueDate = new Date(vehicle.inspection.date);
          const daysToDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysToDue < 30) {
            mockPayments.push({
              id: `inspection_${vehicle.id}`,
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              vehiclePlate: vehicle.plate,
              type: 'inspection',
              amount: '2,500.00 MT',
              dueDate: vehicle.inspection.date,
              status: daysToDue < 0 ? 'overdue' : 'pending',
              description: `Inspeção técnica - ${vehicle.inspection.center || 'Centro de Inspeção'}`,
              reference: `INS${vehicle.id.slice(-6).toUpperCase()}`
            });
          }
        }
      });

      // Add some paid payments for demo
      const paidPayments: Payment[] = [
        {
          id: 'paid_1',
          vehicleId: 'demo',
          vehicleName: 'TOYOTA HILUX',
          vehiclePlate: 'AIP 120 MC',
          type: 'fine',
          amount: '1,000.00 MT',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          status: 'paid',
          description: 'Multa por excesso de velocidade',
          paymentMethod: 'M-Pesa',
          reference: 'FIN123456'
        }
      ];

      setPayments([...mockPayments, ...paidPayments]);
    } catch (err) {
      console.error('Load payments error:', err);
      toast.error('Falha ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const vehicles = await apiRequest('/vehicles');
      const mockReminders: PaymentReminder[] = [];
      
      vehicles.vehicles?.forEach((vehicle: any) => {
        // Check insurance expiry
        if (vehicle.insurance?.date) {
          const dueDate = new Date(vehicle.insurance.date);
          const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue > 0 && daysUntilDue <= 60) {
            mockReminders.push({
              id: `reminder_insurance_${vehicle.id}`,
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              type: 'insurance',
              dueDate: vehicle.insurance.date,
              daysUntilDue,
              estimatedAmount: '15,000.00 MT'
            });
          }
        }
        
        // Check tax expiry
        if (vehicle.taxes?.date) {
          const dueDate = new Date(vehicle.taxes.date);
          const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue > 0 && daysUntilDue <= 60) {
            mockReminders.push({
              id: `reminder_taxes_${vehicle.id}`,
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              type: 'taxes',
              dueDate: vehicle.taxes.date,
              daysUntilDue,
              estimatedAmount: vehicle.taxes.amount || '8,500.00 MT'
            });
          }
        }
      });

      setReminders(mockReminders);
    } catch (err) {
      console.error('Load reminders error:', err);
    }
  };

  const handlePayment = async (payment: Payment) => {
    try {
      // Simulate payment processing
      setIsLoading(true);
      
      // In a real app, this would integrate with payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      setPayments(prev => prev.map(p => 
        p.id === payment.id 
          ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
          : p
      ));
      
      toast.success('Pagamento processado com sucesso!');
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Falha no processamento do pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Em Atraso</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'Seguro';
      case 'inspection':
        return 'Inspeção';
      case 'taxes':
        return 'Impostos';
      case 'fine':
        return 'Multa';
      default:
        return 'Pagamento';
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalPending = pendingPayments.reduce((sum, p) => {
    const amount = parseFloat(p.amount.replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + amount;
  }, 0);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium">Pagamentos</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-red-600">
                    {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                  </div>
                  <div className="text-sm text-gray-600">Total Pendente</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">{paidPayments.length}</div>
                  <div className="text-sm text-gray-600">Pagamentos Feitos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Reminders */}
          {reminders.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{getTypeLabel(reminder.type)} - {reminder.vehicleName}</div>
                        <div className="text-xs text-gray-600">
                          Vence em {reminder.daysUntilDue} dia{reminder.daysUntilDue !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{reminder.estimatedAmount}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(reminder.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pendentes ({pendingPayments.length})</TabsTrigger>
              <TabsTrigger value="paid">Pagos ({paidPayments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum pagamento pendente</p>
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <Card key={payment.id} className={`border-l-4 ${payment.status === 'overdue' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(payment.status)}
                            <h4 className="font-medium">{getTypeLabel(payment.type)}</h4>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{payment.description}</p>
                          <p className="text-xs text-gray-500">{payment.vehicleName} ({payment.vehiclePlate})</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{payment.amount}</div>
                          <div className="text-sm text-gray-600">
                            Vence: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                          </div>
                          {payment.reference && (
                            <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePayment(payment)}
                          disabled={isLoading}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {isLoading ? 'Processando...' : 'Pagar Agora'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          Agendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              {paidPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum pagamento efetuado ainda</p>
                </div>
              ) : (
                paidPayments.map((payment) => (
                  <Card key={payment.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(payment.status)}
                            <h4 className="font-medium">{getTypeLabel(payment.type)}</h4>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{payment.description}</p>
                          <p className="text-xs text-gray-500">{payment.vehicleName} ({payment.vehiclePlate})</p>
                          {payment.paymentMethod && (
                            <div className="text-xs text-green-600 mt-1">
                              Pago via {payment.paymentMethod}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{payment.amount}</div>
                          {payment.paidDate && (
                            <div className="text-sm text-gray-600">
                              Pago: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          {payment.reference && (
                            <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavigation currentScreen="payments" onNavigate={onNavigate} />
    </div>
  );
}
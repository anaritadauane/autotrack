import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CreditCard, Calendar, DollarSign, TrendingUp, Shield, ClipboardCheck, AlertCircle, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
// @ts-ignore
import logoImage from '../assets/logo.png';

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
}

export function PaymentsScreen({ user, onNavigate, onLogout }: PaymentsScreenProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    paidThisMonth: 0,
    upcomingPayments: 0
  });

  useEffect(() => {
    loadPayments();
    calculateStats();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - in production this would fetch from backend
      const mockPayments: Payment[] = [
        {
          id: '1',
          vehicleId: '1',
          vehicleName: 'Toyota Hilux',
          vehiclePlate: 'AIP 120 MC',
          type: 'insurance',
          amount: '15,000 MT',
          dueDate: '2025-11-15',
          paidDate: '2025-10-12',
          status: 'paid',
          description: 'Seguro Anual'
        },
        {
          id: '2',
          vehicleId: '1',
          vehicleName: 'Toyota Hilux',
          vehiclePlate: 'AIP 120 MC',
          type: 'inspection',
          amount: '2,500 MT',
          dueDate: '2025-12-01',
          status: 'pending',
          description: 'Inspeção Periódica'
        },
        {
          id: '3',
          vehicleId: '1',
          vehicleName: 'Toyota Hilux',
          vehiclePlate: 'AIP 120 MC',
          type: 'taxes',
          amount: '8,000 MT',
          dueDate: '2025-10-10',
          status: 'overdue',
          description: 'Imposto de Circulação'
        }
      ];
      setPayments(mockPayments);
    } catch (err) {
      console.error('Load payments error:', err);
      toast.error('Falha ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    // Mock calculation
    setStats({
      totalSpent: 45000,
      pendingPayments: 2,
      paidThisMonth: 15000,
      upcomingPayments: 3
    });
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'insurance':
        return <Shield className="w-5 h-5" />;
      case 'inspection':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'taxes':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'from-blue-500 to-blue-600';
      case 'inspection':
        return 'from-purple-500 to-purple-600';
      case 'taxes':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Atrasado</Badge>;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(p => 
    activeTab === 'all' || p.status === activeTab
  );

  // Chart data
  const monthlySpending = [
    { month: 'Jan', valor: 12000 },
    { month: 'Fev', valor: 8500 },
    { month: 'Mar', valor: 15000 },
    { month: 'Abr', valor: 11000 },
    { month: 'Mai', valor: 9500 },
    { month: 'Jun', valor: 13000 }
  ];

  const expenseByType = [
    { name: 'Seguros', value: 45, color: '#3b82f6' },
    { name: 'Inspeções', value: 20, color: '#a855f7' },
    { name: 'Impostos', value: 35, color: '#10b981' }
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Autotrack" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-semibold">Pagamentos</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs mb-1">Total Gasto</p>
                    <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} MT</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-xs mb-1">Pendentes</p>
                    <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs mb-1">Este Mês</p>
                    <p className="text-2xl font-bold">{stats.paidThisMonth.toLocaleString()} MT</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs mb-1">Próximos</p>
                    <p className="text-2xl font-bold">{stats.upcomingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Gastos Mensais
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlySpending}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="valor" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expense Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Distribuição de Gastos
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={expenseByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={65}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Histórico de Pagamentos
              </h3>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="paid">Pagos</TabsTrigger>
                <TabsTrigger value="overdue">Atrasados</TabsTrigger>
              </TabsList>

              <div className="space-y-3">
                {filteredPayments.length === 0 ? (
                  <Card className="p-8 text-center border-2 border-dashed">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum pagamento encontrado</p>
                  </Card>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`overflow-hidden hover:shadow-xl transition-all border-l-4 bg-gradient-to-r ${getPaymentColor(payment.type).replace('from-', 'border-l-').split(' ')[0]} shadow-lg`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getPaymentColor(payment.type)} rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                              {getPaymentIcon(payment.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900">{payment.description}</h4>
                                  <p className="text-sm text-gray-600">
                                    {payment.vehicleName} ({payment.vehiclePlate})
                                  </p>
                                </div>
                                {getStatusBadge(payment.status)}
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-PT')}</span>
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {payment.amount}
                                </div>
                              </div>

                              {payment.paidDate && (
                                <p className="text-xs text-gray-500 mt-2">
                                  ✓ Pago em {new Date(payment.paidDate).toLocaleDateString('pt-PT')}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <BottomNavigation currentScreen="payments" onNavigate={onNavigate} />
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VehicleType } from '../utils/vehicleDefaults';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type?: VehicleType;
  totalCost?: number;
  monthlyCost?: number;
  insurance?: { date: string; status: string };
  inspection?: { date: string; status: string };
  taxes?: { date: string; status: string };
}

interface StatsComparisonProps {
  vehicles: Vehicle[];
}

export function StatsComparison({ vehicles }: StatsComparisonProps) {
  // Generate comparison data
  const vehicleComparison = vehicles.map(v => ({
    name: v.name.split(' ')[0],
    custo: Math.floor(Math.random() * 30000) + 10000,
    manutencao: Math.floor(Math.random() * 5000) + 1000,
    seguros: Math.floor(Math.random() * 15000) + 5000
  }));

  const monthlyTrend = [
    { mes: 'Jan', custos: 12000, media: 11000 },
    { mes: 'Fev', custos: 8500, media: 11000 },
    { mes: 'Mar', custos: 15000, media: 11500 },
    { mes: 'Abr', custos: 11000, media: 11500 },
    { mes: 'Mai', custos: 9500, media: 11200 },
    { mes: 'Jun', custos: 13000, media: 11500 }
  ];

  const totalSpent = monthlyTrend.reduce((sum, item) => sum + item.custos, 0);
  const averageMonthly = totalSpent / monthlyTrend.length;
  const lastMonth = monthlyTrend[monthlyTrend.length - 1].custos;
  const previousMonth = monthlyTrend[monthlyTrend.length - 2].custos;
  const percentageChange = ((lastMonth - previousMonth) / previousMonth) * 100;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-xs text-blue-100">Total Gasto</span>
              </div>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString()} MT</p>
              <p className="text-xs text-blue-100 mt-1">Últimos 6 meses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-xs text-green-100">Média Mensal</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(averageMonthly).toLocaleString()} MT</p>
              <div className="flex items-center gap-1 mt-1">
                {percentageChange > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">+{percentageChange.toFixed(1)}%</span>
                  </>
                ) : percentageChange < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span className="text-xs">{percentageChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3" />
                    <span className="text-xs">0%</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Tendência de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
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
                <Area 
                  type="monotone" 
                  dataKey="custos" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCustos)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="media" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Gastos Reais</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span className="text-gray-600">Média</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vehicle Comparison */}
      {vehicles.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5 text-purple-600" />
                Comparação de Viaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.slice(0, 3).map((vehicle, index) => {
                  const cost = vehicleComparison[index]?.custo || 0;
                  const maxCost = Math.max(...vehicleComparison.map(v => v.custo));
                  const percentage = (cost / maxCost) * 100;

                  return (
                    <div key={vehicle.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{vehicle.name}</span>
                        <span className="text-sm font-bold text-blue-600">{cost.toLocaleString()} MT</span>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Dica de Poupança</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Seus gastos estão {percentageChange > 0 ? 'acima' : 'abaixo'} da média. 
                  {percentageChange > 10 && ' Considere revisar suas despesas.'}
                </p>
                <Badge className="bg-yellow-500">
                  Meta: 10,000 MT/mês
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Bell, AlertTriangle, CheckCircle, Info, Calendar, Shield, ClipboardCheck, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  icon: 'insurance' | 'inspection' | 'taxes' | 'general';
  timestamp: Date;
  read: boolean;
  vehicleName?: string;
}

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationsCenter({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: NotificationsCenterProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, color: 'red' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle, color: 'yellow' };
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, color: 'green' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info, color: 'blue' };
    }
  };

  const getIconByCategory = (category: string) => {
    switch (category) {
      case 'insurance':
        return Shield;
      case 'inspection':
        return ClipboardCheck;
      case 'taxes':
        return DollarSign;
      default:
        return Bell;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-gradient-to-br from-white to-blue-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Notificações</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-blue-100 text-sm">
                  {unreadCount > 0 ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}` : 'Todas lidas'}
                </p>
                
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-white hover:bg-white/20 text-xs"
                  >
                    Limpar Todas
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sem notificações</h3>
                  <p className="text-sm text-gray-500">
                    Você está em dia! Nenhuma notificação no momento.
                  </p>
                </motion.div>
              ) : (
                notifications.map((notification, index) => {
                  const config = getTypeConfig(notification.type);
                  const TypeIcon = config.icon;
                  const CategoryIcon = getIconByCategory(notification.icon);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                          !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                        }`}
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <CategoryIcon className={`w-6 h-6 ${config.text}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1.5"></div>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              
                              {notification.vehicleName && (
                                <Badge variant="outline" className="text-xs mb-2">
                                  {notification.vehicleName}
                                </Badge>
                              )}

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {notification.timestamp.toLocaleDateString('pt-PT', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

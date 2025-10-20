import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Upload, FileText, Calendar, Plus, Download, X, Shield, ClipboardCheck, DollarSign, File, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentManagerProps {
  vehicle: {
    id: string;
    name: string;
    plate: string;
  };
  onClose: () => void;
}

interface Document {
  id: string;
  vehicleId: string;
  type: 'insurance' | 'inspection' | 'taxes' | 'registration' | 'other';
  name: string;
  description?: string;
  expiryDate?: string;
  fileUrl?: string;
  filePath?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

const documentTypes = [
  { value: 'insurance', label: 'Seguro' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'taxes', label: 'Impostos/Taxas' },
  { value: 'registration', label: 'Registo da Viatura' },
  { value: 'other', label: 'Outro' }
];

export function DocumentManager({ vehicle, onClose }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    expiryDate: '',
    file: null as File | null
  });

  useEffect(() => {
    loadDocuments();
  }, [vehicle.id]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(`/vehicles/${vehicle.id}/documents`);
      setDocuments(response.documents || []);
    } catch (err) {
      console.error('Load documents error:', err);
      setError('Failed to load documents');
      toast.error('Falha ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.name) {
      setError('Por favor preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      let document;
      
      if (formData.file) {
        // Upload file with document data
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        uploadFormData.append('documentData', JSON.stringify({
          type: formData.type,
          name: formData.name,
          description: formData.description,
          expiryDate: formData.expiryDate
        }));

        const session = await supabase.auth.getSession();
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b763bb62/vehicles/${vehicle.id}/documents/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.data.session?.access_token}`
            },
            body: uploadFormData
          }
        );

        if (!response.ok) {
          throw new Error('Falha no upload do arquivo');
        }

        const result = await response.json();
        document = result.document;
        toast.success('Documento com arquivo enviado com sucesso!');
      } else {
        // Store document metadata only
        const documentData = {
          type: formData.type,
          name: formData.name,
          description: formData.description,
          expiryDate: formData.expiryDate
        };

        const response = await apiRequest(`/vehicles/${vehicle.id}/documents`, {
          method: 'POST',
          body: JSON.stringify(documentData)
        });
        
        document = response.document;
        toast.success('Documento adicionado com sucesso!');
      }

      // Reset form and reload documents
      setFormData({
        type: '',
        name: '',
        description: '',
        expiryDate: '',
        file: null
      });
      setShowAddForm(false);
      await loadDocuments();
    } catch (err) {
      console.error('Add document error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao adicionar documento';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    if (!document.filePath) {
      toast.error('Arquivo não disponível para download');
      return;
    }

    try {
      const response = await apiRequest(`/documents/${document.id}/url`);
      if (response.url) {
        // Open download in new tab
        window.open(response.url, '_blank');
        toast.success('Download iniciado');
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Falha ao fazer download do arquivo');
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    if (!confirm('Tem certeza que deseja eliminar este documento?')) {
      return;
    }

    try {
      await apiRequest(`/vehicles/${vehicle.id}/documents/${document.id}`, {
        method: 'DELETE'
      });
      
      toast.success('Documento eliminado com sucesso');
      await loadDocuments();
    } catch (err) {
      console.error('Delete document error:', err);
      toast.error('Falha ao eliminar documento');
    }
  };

  const getStatusBadge = (document: Document) => {
    if (!document.expiryDate) return null;
    
    const expiry = new Date(document.expiryDate);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Expirado</Badge>;
    } else if (diffDays < 30) {
      return <Badge className="bg-yellow-500">Expira em breve</Badge>;
    } else {
      return <Badge className="bg-green-500">Válido</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'insurance':
        return <Shield className="w-5 h-5" />;
      case 'inspection':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'taxes':
        return <DollarSign className="w-5 h-5" />;
      case 'registration':
        return <File className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'from-blue-500 to-blue-600';
      case 'inspection':
        return 'from-purple-500 to-purple-600';
      case 'taxes':
        return 'from-green-500 to-green-600';
      case 'registration':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-medium">Documentos - {vehicle.name}</h1>
            <p className="text-sm text-gray-600">{vehicle.plate}</p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Add Document Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center mb-6"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Seus Documentos
            </h3>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Documento
            </Button>
          </motion.div>

          {/* Add Document Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Upload className="w-5 h-5" />
                      Novo Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                  {formData.file && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <span className="text-sm text-blue-800 block">{formData.file.name}</span>
                        <span className="text-xs text-blue-600">{formatFileSize(formData.file.size)}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentType">Tipo de Documento *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="documentName">Nome do Documento *</Label>
                      <Input
                        id="documentName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ex: Apólice de Seguro 2024"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição adicional do documento"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Data de Validade</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="file">Arquivo</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents List */}
          {isLoading && !showAddForm ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Carregando documentos...</p>
            </motion.div>
          ) : documents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-sm text-gray-500 mb-4">
                Adicione documentos como seguros, inspeções e impostos para manter tudo organizado.
              </p>
              <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Documento
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {documents.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`overflow-hidden hover:shadow-xl transition-all border-l-4 bg-gradient-to-r ${getDocumentColor(document.type).replace('from-', 'border-l-').split(' ')[0]} shadow-lg`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getDocumentColor(document.type)} rounded-xl flex items-center justify-center text-white shadow-md`}>
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900">{document.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {documentTypes.find(t => t.value === document.type)?.label}
                              </Badge>
                            </div>
                            {getStatusBadge(document)}
                          </div>
                        
                        {document.description && (
                          <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {document.expiryDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Validade: {new Date(document.expiryDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          <span>Adicionado: {new Date(document.createdAt).toLocaleDateString('pt-BR')}</span>
                          {document.fileSize && (
                            <span>Tamanho: {formatFileSize(document.fileSize)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        {document.filePath && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
                              onClick={() => handleDownloadDocument(document)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Baixar
                            </Button>
                          </motion.div>
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteDocument(document)}
                            className="shadow-md"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

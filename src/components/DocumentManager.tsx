import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Upload, FileText, Eye, Calendar, Plus, Download, X } from 'lucide-react';
import { apiRequest } from '../utils/supabase/client';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { Vehicle } from '../types/vehicle';

interface DocumentManagerProps {
  vehicle: Vehicle;
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium">Documentos da Viatura</h3>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Documento
            </Button>
          </div>

          {/* Add Document Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
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
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
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
          )}

          {/* Documents List */}
          {isLoading && !showAddForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">Nenhum documento encontrado</p>
              <p className="text-sm text-gray-400">
                Adicione documentos como seguros, inspeções e impostos para manter tudo organizado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <Card key={document.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <h4 className="font-medium">{document.name}</h4>
                          <Badge variant="outline">
                            {documentTypes.find(t => t.value === document.type)?.label}
                          </Badge>
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
                      
                      <div className="flex gap-2">
                        {document.filePath && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadDocument(document)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteDocument(document)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
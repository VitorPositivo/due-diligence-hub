import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useWeights } from '@/contexts/WeightsContext';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Download, Loader2, Info } from 'lucide-react';
import { validateDocument } from '@/utils/validators';
import { getMockRelatorio } from '@/data/mockData';
import { calculateComplianceScore } from '@/lib/scoreCalculator';
import { RelatorioCompliance } from '@/types/compliance';

interface CSVRow {
  documento: string;
  nome?: string;
}

interface QueryResult {
  documento: string;
  nome?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  score?: number;
  error?: string;
  relatorio?: RelatorioCompliance;
}

interface ValidationError {
  row: number;
  documento: string;
  error: string;
}

const BulkQuery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { weights, tipoPerfil } = useWeights();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload');

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(/[,;]/).map(h => h.trim());
    
    const docIndex = headers.findIndex(h => 
      h === 'documento' || h === 'cpf' || h === 'cnpj' || h === 'cpf/cnpj' || h === 'doc'
    );
    const nomeIndex = headers.findIndex(h => 
      h === 'nome' || h === 'razao_social' || h === 'razao social' || h === 'name'
    );

    if (docIndex === -1) {
      throw new Error('Coluna de documento não encontrada. Use: documento, cpf, cnpj ou cpf/cnpj');
    }

    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(/[,;]/).map(v => v.trim().replace(/"/g, ''));
      return {
        documento: values[docIndex] || '',
        nome: nomeIndex !== -1 ? values[nomeIndex] : undefined,
      };
    });
  };

  const validateCSVData = (data: CSVRow[]): { valid: CSVRow[]; errors: ValidationError[] } => {
    const valid: CSVRow[] = [];
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const validation = validateDocument(row.documento);
      if (validation.isValid) {
        valid.push({ ...row, documento: validation.formatted });
      } else {
        errors.push({
          row: index + 2, // +2 for header and 0-index
          documento: row.documento,
          error: validation.errors?.[0] || 'Documento inválido',
        });
      }
    });

    return { valid, errors };
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo CSV',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          toast({
            title: 'Arquivo vazio',
            description: 'O arquivo CSV não contém dados',
            variant: 'destructive',
          });
          return;
        }

        if (data.length > 500) {
          toast({
            title: 'Limite excedido',
            description: 'O arquivo deve ter no máximo 500 registros',
            variant: 'destructive',
          });
          return;
        }

        const { valid, errors } = validateCSVData(data);
        
        setFile(selectedFile);
        setParsedData(valid);
        setValidationErrors(errors);
        setStage('preview');

        toast({
          title: 'Arquivo carregado',
          description: `${valid.length} registros válidos, ${errors.length} com erro`,
        });
      } catch (error) {
        toast({
          title: 'Erro ao processar arquivo',
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(selectedFile);
  }, [toast]);

  const processQueries = async () => {
    setIsProcessing(true);
    setStage('processing');
    setProgress(0);

    const initialResults: QueryResult[] = parsedData.map(row => ({
      documento: row.documento,
      nome: row.nome,
      status: 'pending',
    }));
    setResults(initialResults);

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'processing' } : r
      ));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      try {
        const validation = validateDocument(row.documento);
        const mockReport = getMockRelatorio(row.documento, validation.type!);
        const score = calculateComplianceScore(mockReport, weights, tipoPerfil);
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'success', 
            score,
            relatorio: { ...mockReport, scoreCompliance: score }
          } : r
        ));
      } catch {
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', error: 'Falha na consulta' } : r
        ));
      }

      setProgress(((i + 1) / parsedData.length) * 100);
    }

    setIsProcessing(false);
    setStage('results');
    toast({
      title: 'Processamento concluído',
      description: `${parsedData.length} documentos processados`,
    });
  };

  const exportResults = () => {
    const headers = ['Documento', 'Nome', 'Status', 'Score', 'Erro'];
    const rows = results.map(r => [
      r.documento,
      r.nome || '',
      r.status === 'success' ? 'Sucesso' : 'Erro',
      r.score?.toString() || '',
      r.error || '',
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados_compliance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success text-success-foreground">{score}</Badge>;
    if (score >= 50) return <Badge className="bg-warning text-warning-foreground">{score}</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">{score}</Badge>;
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setResults([]);
    setProgress(0);
    setStage('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consulta em Massa</h1>
            <p className="text-muted-foreground">Upload de arquivo CSV para consultas em lote</p>
          </div>
        </div>

        {/* Upload Stage */}
        {stage === 'upload' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                Upload de Arquivo CSV
              </CardTitle>
              <CardDescription>
                Envie um arquivo CSV com os documentos para consulta em lote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Clique para enviar</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">CSV (máx. 5MB, 500 registros)</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Format Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Formato esperado do CSV</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">O arquivo deve conter uma coluna de documento (CPF ou CNPJ):</p>
                  <code className="block bg-muted p-2 rounded text-xs">
                    documento;nome<br />
                    123.456.789-00;João Silva<br />
                    12.345.678/0001-90;Empresa XYZ
                  </code>
                  <p className="mt-2 text-xs">Separadores aceitos: vírgula (,) ou ponto e vírgula (;)</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Preview Stage */}
        {stage === 'preview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Prévia dos Dados</span>
                  <Badge variant="outline">{file?.name}</Badge>
                </CardTitle>
                <CardDescription>
                  {parsedData.length} registros válidos para processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{validationErrors.length} erros encontrados</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1 text-sm max-h-32 overflow-auto">
                        {validationErrors.slice(0, 5).map((err, i) => (
                          <li key={i}>Linha {err.row}: {err.documento} - {err.error}</li>
                        ))}
                        {validationErrors.length > 5 && (
                          <li>... e mais {validationErrors.length - 5} erros</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono">{row.documento}</TableCell>
                        <TableCell>{row.nome || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {parsedData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          ... e mais {parsedData.length - 10} registros
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={processQueries} disabled={parsedData.length === 0}>
                    Iniciar Processamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Processing Stage */}
        {stage === 'processing' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Processando Consultas
              </CardTitle>
              <CardDescription>
                {Math.round(progress)}% concluído - {results.filter(r => r.status === 'success').length} de {parsedData.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-3" />
              
              <div className="max-h-64 overflow-auto space-y-2">
                {results.map((result, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                    {result.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                    )}
                    {result.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {result.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-mono text-sm">{result.documento}</span>
                    {result.nome && <span className="text-muted-foreground text-sm">- {result.nome}</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Stage */}
        {stage === 'results' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-foreground">{results.length}</div>
                  <p className="text-sm text-muted-foreground">Total Processado</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-success">{results.filter(r => r.status === 'success').length}</div>
                  <p className="text-sm text-muted-foreground">Sucesso</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-destructive">{results.filter(r => r.status === 'error').length}</div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(results.filter(r => r.score).reduce((acc, r) => acc + (r.score || 0), 0) / results.filter(r => r.score).length) || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Score Médio</p>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resultados</span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      Nova Consulta
                    </Button>
                    <Button onClick={exportResults} className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{result.documento}</TableCell>
                        <TableCell>{result.nome || '-'}</TableCell>
                        <TableCell>
                          {result.status === 'success' ? (
                            <Badge variant="outline" className="text-success border-success">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-destructive border-destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Erro
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {result.score !== undefined ? getScoreBadge(result.score) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkQuery;

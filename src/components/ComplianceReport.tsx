import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Users,
  Building,
  Scale,
  FileText,
  Globe
} from 'lucide-react';
import { RelatorioCompliance } from '@/types/compliance';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface ComplianceReportProps {
  relatorio: RelatorioCompliance;
  onBack: () => void;
}

export const ComplianceReport = ({ relatorio, onBack }: ComplianceReportProps) => {
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskBadge = (nivel: string) => {
    const variants = {
      'Crítico': 'destructive',
      'Alto': 'destructive',
      'Médio': 'warning',
      'Baixo': 'secondary'
    } as const;
    return variants[nivel as keyof typeof variants] || 'secondary';
  };

  const exportarPDF = () => {
    try {
      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto o relatório é gerado.",
      });

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(text, x, yPos);
        yPos += fontSize * 0.5;
      };

      // Cabeçalho
      doc.setFillColor(26, 35, 126); // Azul escuro corporativo
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      addText('RELATÓRIO DE COMPLIANCE', margin, 18, true);
      addText('Positivo Tecnologia - Due Diligence', margin, 12);
      
      yPos += 15;
      doc.setTextColor(0, 0, 0);

      // Dados principais
      addText('DADOS DO CONSULTADO', margin, 14, true);
      yPos += 2;
      addText(`Nome/Razão Social: ${relatorio.dadosCadastrais?.nomeRazaoSocial || 'N/A'}`, margin, 10);
      addText(`Documento: ${relatorio.documentoConsultado}`, margin, 10);
      addText(`Tipo: ${relatorio.tipoDocumento}`, margin, 10);
      addText(`Situação: ${relatorio.dadosCadastrais?.situacaoCadastral || 'N/A'}`, margin, 10);
      addText(`Score de Compliance: ${relatorio.scoreCompliance}`, margin, 10, true);
      
      yPos += 10;

      // Riscos identificados
      if (relatorio.riscosIdentificados.length > 0) {
        addText('RISCOS IDENTIFICADOS', margin, 14, true);
        yPos += 2;
        relatorio.riscosIdentificados.forEach((risco, idx) => {
          addText(`${idx + 1}. ${risco.categoria} - Nível: ${risco.nivel}`, margin + 5, 10);
          addText(`   ${risco.descricao}`, margin + 5, 9);
          if (risco.recomendacao) {
            addText(`   Recomendação: ${risco.recomendacao}`, margin + 5, 9);
          }
          yPos += 2;
        });
        yPos += 5;
      }

      // Quadro Societário
      if (relatorio.quadroSocietario) {
        addText('QUADRO SOCIETÁRIO', margin, 14, true);
        yPos += 2;
        relatorio.quadroSocietario.socios.forEach((socio, idx) => {
          addText(`${idx + 1}. ${socio.nome}`, margin + 5, 10);
          addText(`   Documento: ${socio.documento}`, margin + 5, 9);
          addText(`   Qualificação: ${socio.qualificacao}`, margin + 5, 9);
          addText(`   Participação: ${socio.percentualParticipacao}%`, margin + 5, 9);
          yPos += 2;
        });
        yPos += 5;
      }

      // Exposição Política
      if (relatorio.exposicaoPolitica) {
        addText('EXPOSIÇÃO POLÍTICA (PEP)', margin, 14, true);
        yPos += 2;
        addText(`É PEP: ${relatorio.exposicaoPolitica.isPEP ? 'SIM' : 'NÃO'}`, margin + 5, 10, true);
        addText(`Relacionamento com PEP: ${relatorio.exposicaoPolitica.relacionamentoPEP ? 'SIM' : 'NÃO'}`, margin + 5, 10);
        yPos += 5;
      }

      // Sanções Nacionais
      if (relatorio.sancoesApontamentos) {
        addText('SANÇÕES E APONTAMENTOS NACIONAIS', margin, 14, true);
        yPos += 2;
        const sancoesEncontradas = relatorio.sancoesApontamentos.nacionais.filter(s => s.encontrado);
        if (sancoesEncontradas.length > 0) {
          sancoesEncontradas.forEach((sancao, idx) => {
            addText(`${idx + 1}. ${sancao.tipo} - ${sancao.orgao}`, margin + 5, 10);
            if (sancao.detalhes) {
              addText(`   ${sancao.detalhes}`, margin + 5, 9);
            }
            yPos += 2;
          });
        } else {
          addText('Nenhuma sanção nacional encontrada', margin + 5, 10);
        }
        yPos += 5;
      }

      // Processos Judiciais
      if (relatorio.processosJudiciais && relatorio.processosJudiciais.quantidadeTotal > 0) {
        addText('PROCESSOS JUDICIAIS', margin, 14, true);
        yPos += 2;
        addText(`Total de processos: ${relatorio.processosJudiciais.quantidadeTotal}`, margin + 5, 10, true);
        relatorio.processosJudiciais.processos.slice(0, 5).forEach((processo, idx) => {
          addText(`${idx + 1}. ${processo.numeroProcesso}`, margin + 5, 10);
          addText(`   Assunto: ${processo.assunto}`, margin + 5, 9);
          addText(`   Tribunal: ${processo.tribunal}`, margin + 5, 9);
          addText(`   Status: ${processo.status} | Polo: ${processo.polo}`, margin + 5, 9);
          yPos += 2;
        });
        if (relatorio.processosJudiciais.quantidadeTotal > 5) {
          addText(`... e mais ${relatorio.processosJudiciais.quantidadeTotal - 5} processos`, margin + 5, 9);
        }
        yPos += 5;
      }

      // Rodapé
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Gerado em: ${new Date().toLocaleString('pt-BR')} | Página ${i} de ${totalPages}`,
          margin,
          pageHeight - 10
        );
        doc.text(
          'Relatório confidencial - Uso interno',
          pageWidth - margin - 60,
          pageHeight - 10
        );
      }

      // Salvar PDF
      const nomeArquivo = `compliance_${relatorio.documentoConsultado}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);

      toast({
        title: "PDF gerado com sucesso!",
        description: `O arquivo ${nomeArquivo} foi baixado.`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
        <Button variant="outline" onClick={exportarPDF}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Header do Relatório */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">
                {relatorio.dadosCadastrais?.nomeRazaoSocial}
              </CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="font-mono">{relatorio.documentoConsultado}</span>
                <Badge variant="outline">{relatorio.tipoDocumento}</Badge>
                <Badge 
                  variant={relatorio.dadosCadastrais?.situacaoCadastral === 'Ativo' ? 'default' : 'secondary'}
                >
                  {relatorio.dadosCadastrais?.situacaoCadastral}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(relatorio.scoreCompliance)}`}>
                {relatorio.scoreCompliance}
              </div>
              <div className="text-sm text-muted-foreground">Score de Compliance</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Riscos Identificados */}
      {relatorio.riscosIdentificados.length > 0 && (
        <Card className="mb-6 border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Riscos Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatorio.riscosIdentificados.map((risco, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold">{risco.categoria}</div>
                    <Badge variant={getRiskBadge(risco.nivel)}>{risco.nivel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{risco.descricao}</p>
                  {risco.recomendacao && (
                    <p className="text-sm text-accent">💡 {risco.recomendacao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com Dados */}
      <Tabs defaultValue="cadastrais" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="cadastrais">
            <Building className="w-4 h-4 mr-2" />
            Cadastrais
          </TabsTrigger>
          <TabsTrigger value="socios">
            <Users className="w-4 h-4 mr-2" />
            Sócios
          </TabsTrigger>
          <TabsTrigger value="pep">
            <Shield className="w-4 h-4 mr-2" />
            PEP
          </TabsTrigger>
          <TabsTrigger value="sancoes">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Sanções
          </TabsTrigger>
          <TabsTrigger value="processos">
            <Scale className="w-4 h-4 mr-2" />
            Processos
          </TabsTrigger>
          <TabsTrigger value="internacional">
            <Globe className="w-4 h-4 mr-2" />
            Internacional
          </TabsTrigger>
        </TabsList>

        {/* Dados Cadastrais */}
        <TabsContent value="cadastrais">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatorio.dadosCadastrais && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Razão Social</div>
                    <div className="font-medium">{relatorio.dadosCadastrais.nomeRazaoSocial}</div>
                  </div>
                  {relatorio.dadosCadastrais.nomeFantasia && (
                    <div>
                      <div className="text-sm text-muted-foreground">Nome Fantasia</div>
                      <div className="font-medium">{relatorio.dadosCadastrais.nomeFantasia}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Data de Abertura</div>
                    <div className="font-medium">
                      {new Date(relatorio.dadosCadastrais.dataNascimentoAbertura).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {relatorio.dadosCadastrais.naturezaJuridica && (
                    <div>
                      <div className="text-sm text-muted-foreground">Natureza Jurídica</div>
                      <div className="font-medium">{relatorio.dadosCadastrais.naturezaJuridica}</div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Endereço</div>
                    <div className="font-medium">
                      {relatorio.dadosCadastrais.endereco.logradouro}, {relatorio.dadosCadastrais.endereco.numero}
                      {relatorio.dadosCadastrais.endereco.complemento && `, ${relatorio.dadosCadastrais.endereco.complemento}`}
                      <br />
                      {relatorio.dadosCadastrais.endereco.bairro} - {relatorio.dadosCadastrais.endereco.cidade}/{relatorio.dadosCadastrais.endereco.estado}
                      <br />
                      CEP: {relatorio.dadosCadastrais.endereco.cep}
                    </div>
                  </div>
                  {relatorio.dadosCadastrais.cnaePrimario && (
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">CNAE Primário</div>
                      <div className="font-medium">{relatorio.dadosCadastrais.cnaePrimario}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sócios */}
        <TabsContent value="socios">
          <Card>
            <CardHeader>
              <CardTitle>Quadro Societário</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorio.quadroSocietario && (
                <div className="space-y-4">
                  {relatorio.quadroSocietario.socios.map((socio, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-lg">{socio.nome}</div>
                          <div className="text-sm text-muted-foreground">{socio.documento}</div>
                          <div className="text-sm mt-1">
                            <Badge variant="outline">{socio.qualificacao}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">{socio.percentualParticipacao}%</div>
                          <div className="text-sm text-muted-foreground">Participação</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PEP */}
        <TabsContent value="pep">
          <Card>
            <CardHeader>
              <CardTitle>Exposição Política</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorio.exposicaoPolitica && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {relatorio.exposicaoPolitica.isPEP ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                      <span className="font-medium">
                        É PEP: {relatorio.exposicaoPolitica.isPEP ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {relatorio.exposicaoPolitica.relacionamentoPEP ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                      <span className="font-medium">
                        Relacionamento com PEP: {relatorio.exposicaoPolitica.relacionamentoPEP ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                  
                  {relatorio.exposicaoPolitica.detalhes && relatorio.exposicaoPolitica.detalhes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Detalhes de Exposição</h4>
                      {relatorio.exposicaoPolitica.detalhes.map((detalhe, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border mb-3">
                          <div className="font-semibold">{detalhe.nome}</div>
                          <div className="text-sm text-muted-foreground">{detalhe.cpf}</div>
                          <div className="mt-2 text-sm">
                            <div><strong>Cargo:</strong> {detalhe.cargo}</div>
                            <div><strong>Órgão:</strong> {detalhe.orgao}</div>
                            <div><strong>Período:</strong> {new Date(detalhe.dataInicio).toLocaleDateString('pt-BR')} 
                              {detalhe.dataFim ? ` - ${new Date(detalhe.dataFim).toLocaleDateString('pt-BR')}` : ' - Atual'}
                            </div>
                          </div>
                          <Badge variant={getRiskBadge(detalhe.nivelExposicao)} className="mt-2">
                            {detalhe.nivelExposicao}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sanções Nacionais */}
        <TabsContent value="sancoes">
          <Card>
            <CardHeader>
              <CardTitle>Sanções e Apontamentos Nacionais</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorio.sancoesApontamentos && (
                <div className="space-y-3">
                  {relatorio.sancoesApontamentos.nacionais.map((sancao, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        sancao.encontrado 
                          ? 'bg-destructive/10 border-destructive' 
                          : 'bg-success/10 border-success'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{sancao.tipo}</div>
                          <div className="text-sm text-muted-foreground">{sancao.orgao}</div>
                          {sancao.detalhes && (
                            <div className="text-sm mt-2">{sancao.detalhes}</div>
                          )}
                        </div>
                        <div>
                          {sancao.encontrado ? (
                            <Badge variant="destructive">Encontrado</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success">
                              Sem Apontamentos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processos Judiciais */}
        <TabsContent value="processos">
          <Card>
            <CardHeader>
              <CardTitle>Processos Judiciais</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorio.processosJudiciais && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold mb-4">
                    Total: {relatorio.processosJudiciais.quantidadeTotal} processos
                  </div>
                  {relatorio.processosJudiciais.processos.map((processo, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-mono text-sm text-muted-foreground">{processo.numeroProcesso}</div>
                          <div className="font-semibold">{processo.assunto}</div>
                          <div className="text-sm text-muted-foreground">{processo.tribunal}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{processo.status}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Polo: {processo.polo}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-border">
                        <div>
                          <span className="text-muted-foreground">Classe:</span> {processo.classe}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Distribuição:</span>{' '}
                          {new Date(processo.dataDistribuicao).toLocaleDateString('pt-BR')}
                        </div>
                        {processo.parteContraria && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Parte Contrária:</span> {processo.parteContraria}
                          </div>
                        )}
                        {processo.valorCausa && (
                          <div>
                            <span className="text-muted-foreground">Valor:</span>{' '}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sanções Internacionais */}
        <TabsContent value="internacional">
          <Card>
            <CardHeader>
              <CardTitle>Sanções e Apontamentos Internacionais</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorio.sancoesApontamentos && (
                <div className="space-y-3">
                  {relatorio.sancoesApontamentos.internacionais.map((sancao, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        sancao.encontrado 
                          ? 'bg-destructive/10 border-destructive' 
                          : 'bg-success/10 border-success'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{sancao.lista}</div>
                          {sancao.detalhes && (
                            <div className="text-sm mt-2 text-muted-foreground">{sancao.detalhes}</div>
                          )}
                        </div>
                        <div>
                          {sancao.encontrado ? (
                            <Badge variant="destructive">Encontrado</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success">
                              Sem Apontamentos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

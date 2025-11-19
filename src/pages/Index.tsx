import { useState } from 'react';
import { DocumentInput } from '@/components/DocumentInput';
import { ModuleSelector } from '@/components/ModuleSelector';
import { ComplianceReport } from '@/components/ComplianceReport';
import { DocumentValidationResult, ModuloConsulta, RelatorioCompliance } from '@/types/compliance';
import { getMockRelatorio } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

type Step = 'input' | 'modules' | 'report';

const Index = () => {
  const [step, setStep] = useState<Step>('input');
  const [validation, setValidation] = useState<DocumentValidationResult | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioCompliance | null>(null);
  const { toast } = useToast();

  const handleValidDocument = (validationResult: DocumentValidationResult) => {
    setValidation(validationResult);
    setStep('modules');
    toast({
      title: 'Documento validado com sucesso',
      description: `${validationResult.type} válido: ${validationResult.formatted}`,
    });
  };

  const handleGenerateReport = (selectedModules: ModuloConsulta[]) => {
    if (!validation) return;

    // Simula geração do relatório
    toast({
      title: 'Gerando relatório...',
      description: `Consultando ${selectedModules.length} módulos`,
    });

    setTimeout(() => {
      const mockReport = getMockRelatorio(
        validation.formatted,
        validation.type!
      );
      setRelatorio(mockReport);
      setStep('report');
      
      toast({
        title: 'Relatório gerado com sucesso',
        description: 'Análise de compliance concluída',
      });
    }, 1500);
  };

  const handleReset = () => {
    setStep('input');
    setValidation(null);
    setRelatorio(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        {step === 'input' && (
          <DocumentInput onValidDocument={handleValidDocument} />
        )}

        {step === 'modules' && validation && (
          <ModuleSelector
            documentInfo={{
              type: validation.type!,
              formatted: validation.formatted
            }}
            onBack={handleReset}
            onGenerate={handleGenerateReport}
          />
        )}

        {step === 'report' && relatorio && (
          <ComplianceReport
            relatorio={relatorio}
            onBack={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

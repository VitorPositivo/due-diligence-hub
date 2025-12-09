import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentInput } from '@/components/DocumentInput';
import { ModuleSelector } from '@/components/ModuleSelector';
import { ComplianceReport } from '@/components/ComplianceReport';
import PresetSelector from '@/components/PresetSelector';
import { Button } from '@/components/ui/button';
import { DocumentValidationResult, ModuloConsulta, RelatorioCompliance } from '@/types/compliance';
import { getMockRelatorio } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useWeights } from '@/contexts/WeightsContext';
import { calculateComplianceScore } from '@/lib/scoreCalculator';
import { ArrowLeft } from 'lucide-react';

type Step = 'input' | 'modules' | 'report';

const Index = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [validation, setValidation] = useState<DocumentValidationResult | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioCompliance | null>(null);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const { toast } = useToast();
  const { weights, tipoPerfil } = useWeights();

  const handleValidDocument = (validationResult: DocumentValidationResult) => {
    setValidation(validationResult);
    setShowPresetSelector(true);
  };

  const handlePresetConfirm = () => {
    setShowPresetSelector(false);
    setStep('modules');
    toast({
      title: 'Documento validado com sucesso',
      description: `${validation?.type} válido: ${validation?.formatted}`,
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
      
      // Calcula score usando os pesos configurados e o tipo de perfil
      const calculatedScore = calculateComplianceScore(mockReport, weights, tipoPerfil);
      const reportWithScore = { ...mockReport, scoreCompliance: calculatedScore };
      
      setRelatorio(reportWithScore);
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
        {/* Botão Voltar */}
        <div className="flex justify-start mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu
          </Button>
        </div>

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

      <PresetSelector
        open={showPresetSelector}
        onOpenChange={setShowPresetSelector}
        onConfirm={handlePresetConfirm}
      />
    </div>
  );
};

export default Index;

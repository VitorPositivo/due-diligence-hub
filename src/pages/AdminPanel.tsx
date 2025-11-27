import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Settings, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeights } from '@/contexts/WeightsContext';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { weights, updateWeight, resetWeights } = useWeights();
  const { toast } = useToast();

  const handleReset = () => {
    resetWeights();
    toast({
      title: 'Pesos restaurados',
      description: 'Os pesos foram restaurados para os valores padrão',
    });
  };

  const getWeightColor = (peso: number) => {
    if (peso >= 8) return 'text-destructive';
    if (peso >= 6) return 'text-warning';
    if (peso >= 4) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getWeightLabel = (peso: number) => {
    if (peso >= 9) return 'Crítico';
    if (peso >= 7) return 'Alto';
    if (peso >= 5) return 'Médio';
    if (peso >= 3) return 'Baixo';
    return 'Mínimo';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure os pesos das categorias para cálculo do score de compliance
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
        </div>

        {/* Explicação */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle>Como funciona o sistema de pesos?</CardTitle>
            <CardDescription className="text-base">
              Cada categoria de análise possui um peso de 1 a 10 que determina sua importância no cálculo do score final de compliance.
              Quanto maior o peso, maior o impacto da categoria no score final. Ajuste os pesos conforme a política de risco da sua organização.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Cards de Pesos */}
        <div className="grid gap-6 md:grid-cols-2">
          {weights.map((weight) => (
            <Card key={weight.categoria} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{weight.categoria}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {weight.descricao}
                    </CardDescription>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-4xl font-bold ${getWeightColor(weight.peso)}`}>
                      {weight.peso}
                    </div>
                    <div className={`text-xs font-medium ${getWeightColor(weight.peso)}`}>
                      {getWeightLabel(weight.peso)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Slider
                    value={[weight.peso]}
                    onValueChange={([value]) => updateWeight(weight.categoria, value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mínimo (1)</span>
                    <span>Crítico (10)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                As alterações são aplicadas automaticamente e serão utilizadas no próximo cálculo de score.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Crítico (9-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span>Alto (7-8)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span>Médio (4-6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span>Baixo (1-3)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeights } from "@/contexts/WeightsContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const { weights, updateWeight, resetWeights, tipoPerfil, setTipoPerfil } = useWeights();
  const { toast } = useToast();

  const handleReset = () => {
    resetWeights();
    toast({
      title: 'Pesos restaurados',
      description: 'Os pesos foram restaurados para os valores padrão',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-2">
                Configure os pesos das categorias de compliance para cálculo do score final
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleReset}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              Restaurar Padrões
            </Button>
          </div>

          <Tabs value={tipoPerfil} onValueChange={(v) => setTipoPerfil(v as 'tecnico' | 'empresa')} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="tecnico" className="flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Técnicos
              </TabsTrigger>
              <TabsTrigger value="empresa" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tecnico" className="space-y-4 mt-6">
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200">Regras Específicas para Técnicos</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-300">
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Processos cíveis e criminais: <strong>NEGATIVA automática</strong></li>
                      <li>Processos trabalhistas: Tratados como <strong>RISCO</strong></li>
                      <li>Intimações e processos em 1ª ou 2ª instância: <strong>PENDENTE</strong> de avaliação</li>
                      <li>Filiação partidária: <strong>BLOQUEIO</strong> para técnico de atendimento de URNA</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {weights.map((weight) => {
                  const getWeightLabel = (peso: number) => {
                    if (peso >= 9) return { label: "Crítico", color: "text-red-600 dark:text-red-400" };
                    if (peso >= 7) return { label: "Alto", color: "text-orange-600 dark:text-orange-400" };
                    if (peso >= 5) return { label: "Médio", color: "text-yellow-600 dark:text-yellow-400" };
                    return { label: "Baixo", color: "text-green-600 dark:text-green-400" };
                  };

                  const weightInfo = getWeightLabel(weight.peso);

                  return (
                    <Card key={weight.categoria} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{weight.categoria}</CardTitle>
                            <CardDescription className="mt-1">{weight.descricao}</CardDescription>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold text-foreground">{weight.peso}</div>
                            <div className={`text-sm font-medium ${weightInfo.color}`}>
                              {weightInfo.label}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Slider
                          value={[weight.peso]}
                          onValueChange={(value) => updateWeight(weight.categoria, value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>1 (Baixo)</span>
                          <span>10 (Crítico)</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="empresa" className="space-y-4 mt-6">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-200">Regras para Empresas</CardTitle>
                  <CardDescription className="text-blue-800 dark:text-blue-300">
                    Análise completa de compliance corporativo com todas as categorias de risco.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {weights.map((weight) => {
                  const getWeightLabel = (peso: number) => {
                    if (peso >= 9) return { label: "Crítico", color: "text-red-600 dark:text-red-400" };
                    if (peso >= 7) return { label: "Alto", color: "text-orange-600 dark:text-orange-400" };
                    if (peso >= 5) return { label: "Médio", color: "text-yellow-600 dark:text-yellow-400" };
                    return { label: "Baixo", color: "text-green-600 dark:text-green-400" };
                  };

                  const weightInfo = getWeightLabel(weight.peso);

                  return (
                    <Card key={weight.categoria} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{weight.categoria}</CardTitle>
                            <CardDescription className="mt-1">{weight.descricao}</CardDescription>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold text-foreground">{weight.peso}</div>
                            <div className={`text-sm font-medium ${weightInfo.color}`}>
                              {weightInfo.label}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Slider
                          value={[weight.peso]}
                          onValueChange={(value) => updateWeight(weight.categoria, value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>1 (Baixo)</span>
                          <span>10 (Crítico)</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useWeights } from "@/contexts/WeightsContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, UserCog, Save, Trash2, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const { weights, updateWeight, resetWeights, tipoPerfil, setTipoPerfil, presets, savePreset, loadPreset, deletePreset, selectedPreset } = useWeights();
  const { toast } = useToast();
  const [newPresetName, setNewPresetName] = useState("");

  const handleReset = () => {
    resetWeights();
    toast({ title: 'Pesos restaurados', description: 'Os pesos foram restaurados para os valores padrão' });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Digite um nome para salvar a configuração', variant: 'destructive' });
      return;
    }
    savePreset(newPresetName.trim());
    setNewPresetName("");
    toast({ title: 'Configuração salva', description: `"${newPresetName.trim()}" foi salva com sucesso` });
  };

  const handleLoadPreset = (id: string) => {
    loadPreset(id);
    const preset = presets.find(p => p.id === id);
    toast({ title: 'Configuração carregada', description: `"${preset?.nome}" foi aplicada` });
  };

  const handleDeletePreset = (id: string, nome: string) => {
    deletePreset(id);
    toast({ title: 'Configuração excluída', description: `"${nome}" foi removida` });
  };

  const getWeightLabel = (peso: number) => {
    if (peso >= 9) return { label: "Crítico", color: "text-red-600 dark:text-red-400" };
    if (peso >= 7) return { label: "Alto", color: "text-orange-600 dark:text-orange-400" };
    if (peso >= 5) return { label: "Médio", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Baixo", color: "text-green-600 dark:text-green-400" };
  };

  const WeightCard = ({ weight }: { weight: typeof weights[0] }) => {
    const weightInfo = getWeightLabel(weight.peso);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{weight.categoria}</CardTitle>
              <CardDescription className="mt-1">{weight.descricao}</CardDescription>
            </div>
            <div className="text-right ml-4">
              <div className="text-3xl font-bold text-foreground">{weight.peso}</div>
              <div className={`text-sm font-medium ${weightInfo.color}`}>{weightInfo.label}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Slider value={[weight.peso]} onValueChange={(value) => updateWeight(weight.categoria, value[0])} min={1} max={10} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1 (Baixo)</span>
            <span>10 (Crítico)</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <Link to="/"><Button variant="ghost" className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-2">Configure os pesos das categorias de compliance para cálculo do score final</p>
            </div>
            <Button variant="outline" onClick={handleReset} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive">Restaurar Padrões</Button>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5" />Configurações Salvas</CardTitle>
              <CardDescription>Crie e gerencie diferentes perfis de regras para análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome da configuração (ex: Caso 1)" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()} className="flex-1" />
                <Button onClick={handleSavePreset} className="gap-2"><Save className="w-4 h-4" />Salvar Atual</Button>
              </div>
              {presets.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {presets.map((preset) => (
                    <div key={preset.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedPreset?.id === preset.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{preset.nome}</p>
                        <p className="text-xs text-muted-foreground">{preset.tipoPerfil === 'tecnico' ? 'Técnico' : 'Empresa'} • {new Date(preset.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => handleLoadPreset(preset.id)} className="h-8 w-8 p-0"><FolderOpen className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePreset(preset.id, preset.nome)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma configuração salva. Configure os pesos e clique em "Salvar Atual".</p>
              )}
            </CardContent>
          </Card>

          <Tabs value={tipoPerfil} onValueChange={(v) => setTipoPerfil(v as 'tecnico' | 'empresa')} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="tecnico" className="flex items-center gap-2"><UserCog className="w-4 h-4" />Técnicos</TabsTrigger>
              <TabsTrigger value="empresa" className="flex items-center gap-2"><Building2 className="w-4 h-4" />Empresas</TabsTrigger>
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
              <div className="grid gap-4 md:grid-cols-2">{weights.map((weight) => <WeightCard key={weight.categoria} weight={weight} />)}</div>
            </TabsContent>

            <TabsContent value="empresa" className="space-y-4 mt-6">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-200">Regras para Empresas</CardTitle>
                  <CardDescription className="text-blue-800 dark:text-blue-300">Análise completa de compliance corporativo com todas as categorias de risco.</CardDescription>
                </CardHeader>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">{weights.map((weight) => <WeightCard key={weight.categoria} weight={weight} />)}</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
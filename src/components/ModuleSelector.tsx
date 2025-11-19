import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, FileSearch } from 'lucide-react';
import { ModuloConsulta, CategoriaModulo } from '@/types/compliance';
import { modulosConsulta } from '@/data/mockData';

interface ModuleSelectorProps {
  documentInfo: { type: string; formatted: string };
  onBack: () => void;
  onGenerate: (selectedModules: ModuloConsulta[]) => void;
}

export const ModuleSelector = ({ documentInfo, onBack, onGenerate }: ModuleSelectorProps) => {
  const [modules, setModules] = useState<ModuloConsulta[]>(modulosConsulta);

  // Agrupa módulos por categoria
  const categorias = Array.from(new Set(modules.map(m => m.categoria))) as CategoriaModulo[];

  const toggleModule = (moduleId: string) => {
    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, selecionado: !m.selecionado } : m)
    );
  };

  const toggleCategory = (categoria: CategoriaModulo, selectAll: boolean) => {
    setModules(prev =>
      prev.map(m => m.categoria === categoria ? { ...m, selecionado: selectAll } : m)
    );
  };

  const getSelectedCount = (categoria: CategoriaModulo) => {
    return modules.filter(m => m.categoria === categoria && m.selecionado).length;
  };

  const getTotalCount = (categoria: CategoriaModulo) => {
    return modules.filter(m => m.categoria === categoria).length;
  };

  const handleGenerate = () => {
    const selected = modules.filter(m => m.selecionado);
    if (selected.length > 0) {
      onGenerate(selected);
    }
  };

  const totalSelected = modules.filter(m => m.selecionado).length;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Seleção de Módulos</h2>
              <p className="text-muted-foreground">
                Documento: <span className="font-mono font-semibold text-foreground">{documentInfo.formatted}</span>
                {' '}({documentInfo.type})
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">{totalSelected}</div>
              <div className="text-sm text-muted-foreground">módulos selecionados</div>
            </div>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={categorias} className="space-y-4">
          {categorias.map(categoria => {
            const categoryModules = modules.filter(m => m.categoria === categoria);
            const selectedCount = getSelectedCount(categoria);
            const totalCount = getTotalCount(categoria);
            const allSelected = selectedCount === totalCount;

            return (
              <AccordionItem 
                key={categoria} 
                value={categoria}
                className="bg-card rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{categoria}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({selectedCount}/{totalCount})
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="mb-4 pb-4 border-b border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCategory(categoria, !allSelected)}
                    >
                      {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {categoryModules.map(module => (
                      <div
                        key={module.id}
                        className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={module.id}
                          checked={module.selecionado}
                          onCheckedChange={() => toggleModule(module.id)}
                          className="mt-1"
                        />
                        <label
                          htmlFor={module.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{module.nome}</div>
                          <div className="text-sm text-muted-foreground">{module.descricao}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <Button
            onClick={handleGenerate}
            disabled={totalSelected === 0}
            className="w-full h-14 text-lg"
            size="lg"
          >
            <FileSearch className="w-5 h-5 mr-2" />
            Gerar Relatório ({totalSelected} {totalSelected === 1 ? 'módulo' : 'módulos'})
          </Button>
        </div>
      </div>
    </div>
  );
};

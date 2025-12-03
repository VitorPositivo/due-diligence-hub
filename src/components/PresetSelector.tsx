import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useWeights, RulePreset } from "@/contexts/WeightsContext";
import { Building2, UserCog, Settings2 } from "lucide-react";

interface PresetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const PresetSelector = ({ open, onOpenChange, onConfirm }: PresetSelectorProps) => {
  const { presets, tipoPerfil, setTipoPerfil, loadPreset, selectedPreset, setSelectedPreset } = useWeights();
  const [selection, setSelection] = useState<string>(() => {
    if (selectedPreset) return `preset-${selectedPreset.id}`;
    return `default-${tipoPerfil}`;
  });

  const handleConfirm = () => {
    if (selection.startsWith('preset-')) {
      const presetId = selection.replace('preset-', '');
      loadPreset(presetId);
    } else if (selection.startsWith('default-')) {
      const tipo = selection.replace('default-', '') as 'tecnico' | 'empresa';
      setTipoPerfil(tipo);
      setSelectedPreset(null);
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Selecionar Tipo de Análise
          </DialogTitle>
          <DialogDescription>
            Escolha qual configuração de regras aplicar nesta consulta
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selection} onValueChange={setSelection} className="space-y-3 mt-4">
          {/* Default options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Perfis Padrão</p>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="default-tecnico" id="default-tecnico" />
              <Label htmlFor="default-tecnico" className="flex items-center gap-2 cursor-pointer flex-1">
                <UserCog className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="font-medium">Técnico</p>
                  <p className="text-xs text-muted-foreground">Regras específicas para técnicos</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="default-empresa" id="default-empresa" />
              <Label htmlFor="default-empresa" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Empresa</p>
                  <p className="text-xs text-muted-foreground">Análise completa de compliance</p>
                </div>
              </Label>
            </div>
          </div>

          {/* Saved presets */}
          {presets.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Configurações Salvas</p>
              
              {presets.map((preset) => (
                <div 
                  key={preset.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={`preset-${preset.id}`} id={`preset-${preset.id}`} />
                  <Label htmlFor={`preset-${preset.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                    {preset.tipoPerfil === 'tecnico' ? (
                      <UserCog className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">{preset.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {preset.tipoPerfil === 'tecnico' ? 'Técnico' : 'Empresa'} • {new Date(preset.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </RadioGroup>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Continuar Análise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresetSelector;
import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, AlertCircle } from 'lucide-react';
import { validateDocument, formatDocument } from '@/utils/validators';
import { DocumentValidationResult } from '@/types/compliance';

interface DocumentInputProps {
  onValidDocument: (validation: DocumentValidationResult) => void;
}

export const DocumentInput = ({ onValidDocument }: DocumentInputProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setValue(formatted);
    setError(null);
  };

  const handleValidate = () => {
    setIsValidating(true);
    
    // Simula delay de validação (200ms)
    setTimeout(() => {
      const validation = validateDocument(value);
      
      if (validation.isValid) {
        onValidDocument(validation);
      } else {
        setError(validation.errors?.[0] || 'Documento inválido');
      }
      
      setIsValidating(false);
    }, 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length >= 11) {
      handleValidate();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Compliance & Due Diligence
        </h1>
        <p className="text-muted-foreground text-lg">
          Insira o CPF ou CNPJ para iniciar a análise de compliance
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="document-input" 
              className="block text-sm font-medium mb-2 text-foreground"
            >
              CPF ou CNPJ
            </label>
            <Input
              id="document-input"
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="text-lg h-14 text-center"
              autoFocus
              aria-label="Campo de entrada para CPF ou CNPJ"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'document-error' : undefined}
            />
          </div>

          {error && (
            <div 
              id="document-error"
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md animate-fade-in"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleValidate}
            disabled={value.length < 11 || isValidating}
            className="w-full h-14 text-lg"
            aria-label="Verificar documento"
          >
            {isValidating ? 'Validando...' : 'Verificar Documento'}
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <p>Os dados são validados com algoritmo de dígito verificador (Módulo 11)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { DocumentValidationResult, DocumentType } from '@/types/compliance';

/**
 * Remove todos os caracteres não numéricos
 */
export const cleanDocument = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formata CPF: 000.000.000-00
 */
export const formatCPF = (value: string): string => {
  const cleaned = cleanDocument(value);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export const formatCNPJ = (value: string): string => {
  const cleaned = cleanDocument(value);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

/**
 * Detecta automaticamente o tipo e formata
 */
export const formatDocument = (value: string): string => {
  const cleaned = cleanDocument(value);
  if (cleaned.length <= 11) {
    return formatCPF(value);
  }
  return formatCNPJ(value);
};

/**
 * Valida dígito verificador do CPF usando Módulo 11
 */
const validateCPFDigits = (cpf: string): boolean => {
  const digits = cpf.split('').map(Number);
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (digits.every(d => d === digits[0])) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[9]) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[10]) return false;

  return true;
};

/**
 * Valida dígito verificador do CNPJ usando Módulo 11
 */
const validateCNPJDigits = (cnpj: string): boolean => {
  const digits = cnpj.split('').map(Number);
  
  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (digits.every(d => d === digits[0])) return false;

  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== digits[12]) return false;

  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== digits[13]) return false;

  return true;
};

/**
 * Valida CPF ou CNPJ com algoritmo Módulo 11
 */
export const validateDocument = (value: string): DocumentValidationResult => {
  const cleaned = cleanDocument(value);
  const errors: string[] = [];

  // Verifica comprimento
  if (cleaned.length === 0) {
    return {
      isValid: false,
      type: null,
      formatted: '',
      errors: ['Documento não pode estar vazio']
    };
  }

  // CPF
  if (cleaned.length === 11) {
    const isValid = validateCPFDigits(cleaned);
    return {
      isValid,
      type: 'CPF',
      formatted: formatCPF(cleaned),
      errors: isValid ? undefined : ['CPF inválido - dígitos verificadores incorretos']
    };
  }

  // CNPJ
  if (cleaned.length === 14) {
    const isValid = validateCNPJDigits(cleaned);
    return {
      isValid,
      type: 'CNPJ',
      formatted: formatCNPJ(cleaned),
      errors: isValid ? undefined : ['CNPJ inválido - dígitos verificadores incorretos']
    };
  }

  // Comprimento inválido
  return {
    isValid: false,
    type: null,
    formatted: cleaned,
    errors: ['Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)']
  };
};

/**
 * Detecta o tipo de documento baseado no comprimento
 */
export const detectDocumentType = (value: string): DocumentType | null => {
  const cleaned = cleanDocument(value);
  if (cleaned.length === 11) return 'CPF';
  if (cleaned.length === 14) return 'CNPJ';
  return null;
};

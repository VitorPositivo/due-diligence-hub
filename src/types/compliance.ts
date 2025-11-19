// ============================================
// TIPOS TYPESCRIPT - COMPLIANCE E DUE DILIGENCE
// ============================================

export type DocumentType = 'CPF' | 'CNPJ';

export interface DocumentValidationResult {
  isValid: boolean;
  type: DocumentType | null;
  formatted: string;
  errors?: string[];
}

// ============================================
// A. DADOS CADASTRAIS
// ============================================

export interface DadosCadastrais {
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  documento: string;
  tipoDocumento: DocumentType;
  naturezaJuridica?: string;
  dataNascimentoAbertura: string;
  situacaoCadastral: 'Ativo' | 'Inativo' | 'Suspenso' | 'Baixado';
  cnaePrimario?: string;
  cnaeSecundarios?: string[];
  endereco: Endereco;
  imagemEndereco?: string; // URL da imagem Google Maps
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
}

// ============================================
// B. SÓCIOS E ACIONISTAS
// ============================================

export interface QuadroSocietario {
  socios: Socio[];
  dataConsulta: string;
}

export interface Socio {
  nome: string;
  documento: string;
  qualificacao: string;
  percentualParticipacao: number;
  dataEntrada?: string;
}

// ============================================
// C. RELACIONAMENTO E PARTICIPAÇÕES
// ============================================

export interface ParticipacaoSocietaria {
  empresas: EmpresaRelacionada[];
}

export interface EmpresaRelacionada {
  razaoSocial: string;
  cnpj: string;
  qualificacao: string;
  percentualParticipacao: number;
  situacao: string;
}

// ============================================
// D. EXPOSIÇÃO POLÍTICA (PEP)
// ============================================

export interface ExposicaoPolitica {
  isPEP: boolean;
  relacionamentoPEP: boolean;
  detalhes?: DetalhePEP[];
  doacoesEleitorais?: DoacaoEleitoral[];
}

export interface DetalhePEP {
  nome: string;
  cpf: string;
  cargo: string;
  orgao: string;
  dataInicio: string;
  dataFim?: string;
  nivelExposicao: 'Alto' | 'Médio' | 'Baixo';
}

export interface DoacaoEleitoral {
  ano: number;
  candidato: string;
  partido: string;
  valor: number;
  tipo: 'Original' | 'Estimável';
}

// ============================================
// E. SANÇÕES E APONTAMENTOS
// ============================================

export interface SancoesApontamentos {
  nacionais: SancaoNacional[];
  internacionais: SancaoInternacional[];
}

export interface SancaoNacional {
  tipo: 
    | 'Certidão Débitos Trabalhistas'
    | 'Trabalho Escravo'
    | 'Regularidade FGTS'
    | 'CNIA'
    | 'BNMP'
    | 'CADE'
    | 'CEIS'
    | 'CNEP'
    | 'CEPIM'
    | 'Inabilitados/Inidôneos'
    | 'Dívida Ativa União'
    | 'Regularidade Fiscal Estadual'
    | 'IBAMA';
  encontrado: boolean;
  detalhes?: string;
  dataConsulta: string;
  orgao: string;
}

export interface SancaoInternacional {
  lista: 
    | 'Consolidated List (UK)'
    | 'Denied Persons List (USA)'
    | 'TradeDFAT (Australia)'
    | 'IADB'
    | 'OSFIC (Canada)'
    | 'World Bank Ineligible Firms'
    | 'Sanctions List Search (OFAC)'
    | 'UN Security Council List'
    | 'FBI Fugitives'
    | 'Offshore Leaks Database (ICIJ)'
    | 'EU Sanctions Map';
  encontrado: boolean;
  detalhes?: string;
  dataConsulta: string;
}

// ============================================
// F. PROCESSOS JUDICIAIS
// ============================================

export interface ProcessosJudiciais {
  quantidadeTotal: number;
  processos: ProcessoJudicial[];
}

export interface ProcessoJudicial {
  numeroProcesso: string;
  tribunal: string;
  dataDistribuicao: string;
  assunto: string;
  classe: string;
  polo: 'Ativo' | 'Passivo' | 'Neutro';
  parteContraria?: string;
  status: 'Ativo' | 'Arquivado' | 'Baixado' | 'Suspenso';
  valorCausa?: number;
}

// ============================================
// G. PROCESSOS ADMINISTRATIVOS
// ============================================

export interface ProcessosAdministrativos {
  comprot: ProcessoAdministrativo[];
  mpf: ProcessoAdministrativo[];
}

export interface ProcessoAdministrativo {
  numeroProcesso: string;
  orgao: string;
  dataAbertura: string;
  assunto: string;
  status: string;
  multa?: number;
}

// ============================================
// RELATÓRIO CONSOLIDADO
// ============================================

export interface RelatorioCompliance {
  documentoConsultado: string;
  tipoDocumento: DocumentType;
  dataRelatorio: string;
  dadosCadastrais?: DadosCadastrais;
  quadroSocietario?: QuadroSocietario;
  participacaoSocietaria?: ParticipacaoSocietaria;
  exposicaoPolitica?: ExposicaoPolitica;
  sancoesApontamentos?: SancoesApontamentos;
  processosJudiciais?: ProcessosJudiciais;
  processosAdministrativos?: ProcessosAdministrativos;
  riscosIdentificados: RiscoIdentificado[];
  scoreCompliance: number; // 0-100
}

export interface RiscoIdentificado {
  categoria: string;
  nivel: 'Crítico' | 'Alto' | 'Médio' | 'Baixo';
  descricao: string;
  recomendacao?: string;
}

// ============================================
// MÓDULOS DE CONSULTA
// ============================================

export interface ModuloConsulta {
  id: string;
  nome: string;
  categoria: CategoriaModulo;
  descricao: string;
  selecionado: boolean;
}

export type CategoriaModulo = 
  | 'Dados Cadastrais'
  | 'Sócios e Acionistas'
  | 'Relacionamento e Participações'
  | 'Exposição Política (PEP)'
  | 'Sanções e Apontamentos Nacionais'
  | 'Sanções e Apontamentos Internacionais'
  | 'Processos Judiciais'
  | 'Processos Administrativos';

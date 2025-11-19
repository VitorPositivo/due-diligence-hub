import { RelatorioCompliance, ModuloConsulta } from '@/types/compliance';

/**
 * MOCK DATA GENERATOR
 * Dados fictícios para demonstração da estrutura completa
 */

export const getMockRelatorio = (documento: string, tipo: 'CPF' | 'CNPJ'): RelatorioCompliance => {
  const isCPF = tipo === 'CPF';
  
  return {
    documentoConsultado: documento,
    tipoDocumento: tipo,
    dataRelatorio: new Date().toISOString(),
    
    // A. DADOS CADASTRAIS
    dadosCadastrais: {
      nomeRazaoSocial: isCPF ? 'João Silva Santos' : 'Positivo Tecnologia S.A.',
      nomeFantasia: isCPF ? undefined : 'Positivo',
      documento,
      tipoDocumento: tipo,
      naturezaJuridica: isCPF ? undefined : 'Sociedade Anônima',
      dataNascimentoAbertura: isCPF ? '1985-03-15' : '1989-06-10',
      situacaoCadastral: 'Ativo',
      cnaePrimario: isCPF ? undefined : '26.10-8-00 - Fabricação de componentes eletrônicos',
      cnaeSecundarios: isCPF ? undefined : [
        '46.52-1-00 - Comércio atacadista de componentes eletrônicos',
        '62.01-5-01 - Desenvolvimento de programas de computador sob encomenda'
      ],
      endereco: {
        logradouro: isCPF ? 'Rua das Flores' : 'Rua do Rosário',
        numero: isCPF ? '123' : '780',
        complemento: isCPF ? 'Apto 45' : 'Edifício Sede',
        bairro: isCPF ? 'Centro' : 'Centro',
        cidade: isCPF ? 'São Paulo' : 'Curitiba',
        estado: isCPF ? 'SP' : 'PR',
        cep: isCPF ? '01310-100' : '80020-410',
        pais: 'Brasil'
      },
      imagemEndereco: 'https://maps.googleapis.com/maps/api/staticmap?center=mock&zoom=15&size=600x300'
    },

    // B. QUADRO SOCIETÁRIO
    quadroSocietario: isCPF ? undefined : {
      socios: [
        {
          nome: 'Hélio Rotenberg',
          documento: '012.345.678-90',
          qualificacao: 'Presidente',
          percentualParticipacao: 35.5,
          dataEntrada: '1989-06-10'
        },
        {
          nome: 'José Antonio Philippini',
          documento: '123.456.789-01',
          qualificacao: 'Vice-Presidente',
          percentualParticipacao: 28.3,
          dataEntrada: '1990-01-15'
        },
        {
          nome: 'Positivo Investimentos LTDA',
          documento: '12.345.678/0001-90',
          qualificacao: 'Sócio Pessoa Jurídica',
          percentualParticipacao: 36.2,
          dataEntrada: '2005-03-22'
        }
      ],
      dataConsulta: new Date().toISOString()
    },

    // C. PARTICIPAÇÕES
    participacaoSocietaria: isCPF ? undefined : {
      empresas: [
        {
          razaoSocial: 'Positivo BGH S.A.',
          cnpj: '01.234.567/0001-89',
          qualificacao: 'Sócio majoritário',
          percentualParticipacao: 60.0,
          situacao: 'Ativa'
        },
        {
          razaoSocial: 'Positivo Casa Inteligente LTDA',
          cnpj: '98.765.432/0001-10',
          qualificacao: 'Sócio',
          percentualParticipacao: 45.0,
          situacao: 'Ativa'
        }
      ]
    },

    // D. EXPOSIÇÃO POLÍTICA
    exposicaoPolitica: {
      isPEP: false,
      relacionamentoPEP: isCPF ? false : true,
      detalhes: isCPF ? undefined : [
        {
          nome: 'Maria Santos Silva',
          cpf: '987.654.321-00',
          cargo: 'Diretora de Relações Institucionais',
          orgao: 'Ministério da Ciência e Tecnologia',
          dataInicio: '2018-01-10',
          dataFim: '2020-12-31',
          nivelExposicao: 'Médio'
        }
      ],
      doacoesEleitorais: isCPF ? undefined : [
        {
          ano: 2020,
          candidato: 'Candidato Exemplo',
          partido: 'PSDB',
          valor: 50000,
          tipo: 'Original'
        }
      ]
    },

    // E. SANÇÕES E APONTAMENTOS
    sancoesApontamentos: {
      nacionais: [
        {
          tipo: 'Certidão Débitos Trabalhistas',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'TST'
        },
        {
          tipo: 'Trabalho Escravo',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'Ministério do Trabalho'
        },
        {
          tipo: 'Regularidade FGTS',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'Caixa Econômica Federal'
        },
        {
          tipo: 'CNIA',
          encontrado: false,
          detalhes: 'Nenhum apontamento de improbidade administrativa',
          dataConsulta: new Date().toISOString(),
          orgao: 'CGU'
        },
        {
          tipo: 'BNMP',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'CNJ'
        },
        {
          tipo: 'CADE',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'CADE'
        },
        {
          tipo: 'CEIS',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'CGU'
        },
        {
          tipo: 'CNEP',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'CGU'
        },
        {
          tipo: 'CEPIM',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'TCU'
        },
        {
          tipo: 'Dívida Ativa União',
          encontrado: true,
          detalhes: 'Débito fiscal em discussão administrativa - R$ 125.000,00',
          dataConsulta: new Date().toISOString(),
          orgao: 'PGFN'
        },
        {
          tipo: 'IBAMA',
          encontrado: false,
          dataConsulta: new Date().toISOString(),
          orgao: 'IBAMA'
        }
      ],
      internacionais: [
        {
          lista: 'Consolidated List (UK)',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        },
        {
          lista: 'Denied Persons List (USA)',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        },
        {
          lista: 'Sanctions List Search (OFAC)',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        },
        {
          lista: 'UN Security Council List',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        },
        {
          lista: 'World Bank Ineligible Firms',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        },
        {
          lista: 'EU Sanctions Map',
          encontrado: false,
          dataConsulta: new Date().toISOString()
        }
      ]
    },

    // F. PROCESSOS JUDICIAIS
    processosJudiciais: {
      quantidadeTotal: 3,
      processos: [
        {
          numeroProcesso: '0001234-56.2022.5.09.0001',
          tribunal: 'TRT-9 (Paraná)',
          dataDistribuicao: '2022-03-15',
          assunto: 'Ação Trabalhista - Horas Extras',
          classe: 'Reclamação Trabalhista',
          polo: 'Passivo',
          parteContraria: 'Maria dos Santos',
          status: 'Ativo',
          valorCausa: 45000
        },
        {
          numeroProcesso: '5001234-89.2021.4.04.7000',
          tribunal: 'TRF-4 (Sul)',
          dataDistribuicao: '2021-07-22',
          assunto: 'Mandado de Segurança - Tributário',
          classe: 'Mandado de Segurança',
          polo: 'Ativo',
          parteContraria: 'União Federal',
          status: 'Ativo',
          valorCausa: 850000
        },
        {
          numeroProcesso: '1000123-45.2020.8.16.0001',
          tribunal: 'TJPR',
          dataDistribuicao: '2020-11-10',
          assunto: 'Ação Cível - Cobrança',
          classe: 'Procedimento Comum Cível',
          polo: 'Ativo',
          parteContraria: 'XYZ Comércio LTDA',
          status: 'Baixado',
          valorCausa: 120000
        }
      ]
    },

    // G. PROCESSOS ADMINISTRATIVOS
    processosAdministrativos: {
      comprot: [],
      mpf: [
        {
          numeroProcesso: '1.23.000.001234/2021-45',
          orgao: 'MPF - Procuradoria da República no Paraná',
          dataAbertura: '2021-09-15',
          assunto: 'Inquérito Civil - Meio Ambiente',
          status: 'Em andamento'
        }
      ]
    },

    // RISCOS IDENTIFICADOS
    riscosIdentificados: [
      {
        categoria: 'Dívida Ativa',
        nivel: 'Médio',
        descricao: 'Débito fiscal de R$ 125.000,00 em discussão administrativa',
        recomendacao: 'Acompanhar evolução do processo administrativo e verificar garantias'
      },
      {
        categoria: 'Processos Judiciais',
        nivel: 'Baixo',
        descricao: '3 processos ativos, sendo 2 de valores relevantes',
        recomendacao: 'Monitorar andamento e provisionar valores se necessário'
      },
      {
        categoria: 'Relacionamento PEP',
        nivel: 'Baixo',
        descricao: 'Ex-funcionária com histórico de cargo público entre 2018-2020',
        recomendacao: 'Manter due diligence reforçada em transações sensíveis'
      }
    ],

    // SCORE DE COMPLIANCE (0-100, onde 100 = sem riscos)
    scoreCompliance: 78
  };
};

/**
 * Módulos de consulta disponíveis
 */
export const modulosConsulta: ModuloConsulta[] = [
  // A. Dados Cadastrais
  {
    id: 'dados-nome',
    nome: 'Nome/Razão Social',
    categoria: 'Dados Cadastrais',
    descricao: 'Nome completo ou razão social da empresa',
    selecionado: true
  },
  {
    id: 'dados-fantasia',
    nome: 'Nome Fantasia',
    categoria: 'Dados Cadastrais',
    descricao: 'Nome fantasia da empresa',
    selecionado: true
  },
  {
    id: 'dados-documento',
    nome: 'CPF/CNPJ',
    categoria: 'Dados Cadastrais',
    descricao: 'Número do documento',
    selecionado: true
  },
  {
    id: 'dados-natureza',
    nome: 'Natureza Jurídica',
    categoria: 'Dados Cadastrais',
    descricao: 'Tipo de constituição da empresa',
    selecionado: true
  },
  {
    id: 'dados-nascimento',
    nome: 'Data de Nascimento/Abertura',
    categoria: 'Dados Cadastrais',
    descricao: 'Data de nascimento da pessoa ou abertura da empresa',
    selecionado: true
  },
  {
    id: 'dados-situacao',
    nome: 'Situação Cadastral',
    categoria: 'Dados Cadastrais',
    descricao: 'Status atual do cadastro (Ativo, Inativo, etc)',
    selecionado: true
  },
  {
    id: 'dados-cnae',
    nome: 'CNAE Primário e Secundário',
    categoria: 'Dados Cadastrais',
    descricao: 'Atividades econômicas registradas',
    selecionado: true
  },
  {
    id: 'dados-endereco',
    nome: 'Endereço Completo',
    categoria: 'Dados Cadastrais',
    descricao: 'Endereço completo com CEP',
    selecionado: true
  },
  {
    id: 'dados-imagem',
    nome: 'Imagem do Endereço',
    categoria: 'Dados Cadastrais',
    descricao: 'Foto de satélite do endereço',
    selecionado: false
  },

  // B. Sócios
  {
    id: 'socios-qsa',
    nome: 'Quadro de Sócios e Acionistas (QSA)',
    categoria: 'Sócios e Acionistas',
    descricao: 'Lista completa de sócios com participação',
    selecionado: true
  },

  // C. Participações
  {
    id: 'participacao-empresas',
    nome: 'Participação em outras empresas',
    categoria: 'Relacionamento e Participações',
    descricao: 'Empresas onde possui participação societária',
    selecionado: true
  },

  // D. PEP
  {
    id: 'pep-status',
    nome: 'Status PEP',
    categoria: 'Exposição Política (PEP)',
    descricao: 'Verificar se é Pessoa Politicamente Exposta',
    selecionado: true
  },
  {
    id: 'pep-relacionamento',
    nome: 'Relacionamento com PEP',
    categoria: 'Exposição Política (PEP)',
    descricao: 'Verifica vínculos com pessoas politicamente expostas',
    selecionado: true
  },
  {
    id: 'pep-doacoes',
    nome: 'Histórico de Doações Eleitorais',
    categoria: 'Exposição Política (PEP)',
    descricao: 'Doações para campanhas eleitorais',
    selecionado: false
  },

  // E. Sanções Nacionais
  {
    id: 'sancao-tst',
    nome: 'Certidão Débitos Trabalhistas',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'TST - Tribunal Superior do Trabalho',
    selecionado: true
  },
  {
    id: 'sancao-escravo',
    nome: 'Lista de Trabalho Escravo',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Ministério do Trabalho',
    selecionado: true
  },
  {
    id: 'sancao-fgts',
    nome: 'Regularidade FGTS',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Caixa Econômica Federal',
    selecionado: true
  },
  {
    id: 'sancao-cnia',
    nome: 'CNIA - Improbidade Administrativa',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Cadastro Nacional de Improbidade Administrativa',
    selecionado: true
  },
  {
    id: 'sancao-bnmp',
    nome: 'BNMP - Mandados de Prisão',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Banco Nacional de Mandados de Prisão',
    selecionado: true
  },
  {
    id: 'sancao-cade',
    nome: 'CADE',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Conselho Administrativo de Defesa Econômica',
    selecionado: true
  },
  {
    id: 'sancao-ceis',
    nome: 'CEIS',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Cadastro de Empresas Inidôneas e Suspensas',
    selecionado: true
  },
  {
    id: 'sancao-cnep',
    nome: 'CNEP',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Cadastro Nacional de Empresas Punidas',
    selecionado: true
  },
  {
    id: 'sancao-cepim',
    nome: 'CEPIM',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Cadastro de Entidades Privadas sem Fins Lucrativos Impedidas',
    selecionado: true
  },
  {
    id: 'sancao-inabilitados',
    nome: 'Inabilitados/Inidôneos',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'TCU - Tribunal de Contas da União',
    selecionado: true
  },
  {
    id: 'sancao-divida-ativa',
    nome: 'Dívida Ativa da União',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'PGFN - Procuradoria Geral da Fazenda Nacional',
    selecionado: true
  },
  {
    id: 'sancao-fiscal-estadual',
    nome: 'Regularidade Fiscal Estadual',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Secretarias da Fazenda Estaduais',
    selecionado: false
  },
  {
    id: 'sancao-ibama',
    nome: 'IBAMA - Sanções e Embargos',
    categoria: 'Sanções e Apontamentos Nacionais',
    descricao: 'Instituto Brasileiro do Meio Ambiente',
    selecionado: true
  },

  // F. Sanções Internacionais
  {
    id: 'int-uk',
    nome: 'Consolidated List (UK)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Reino Unido - HM Treasury',
    selecionado: true
  },
  {
    id: 'int-usa-denied',
    nome: 'Denied Persons List (USA)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Estados Unidos - Department of Commerce',
    selecionado: true
  },
  {
    id: 'int-australia',
    nome: 'TradeDFAT (Australia)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Austrália - Department of Foreign Affairs',
    selecionado: true
  },
  {
    id: 'int-iadb',
    nome: 'IADB',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Inter-American Development Bank',
    selecionado: true
  },
  {
    id: 'int-canada',
    nome: 'OSFIC (Canada)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Canadá - Office of the Superintendent of Financial Institutions',
    selecionado: true
  },
  {
    id: 'int-world-bank',
    nome: 'World Bank Ineligible Firms',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Banco Mundial',
    selecionado: true
  },
  {
    id: 'int-ofac',
    nome: 'Sanctions List Search (OFAC)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Estados Unidos - Office of Foreign Assets Control',
    selecionado: true
  },
  {
    id: 'int-un',
    nome: 'UN Security Council List',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Nações Unidas - Conselho de Segurança',
    selecionado: true
  },
  {
    id: 'int-fbi',
    nome: 'FBI Fugitives',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'Estados Unidos - FBI',
    selecionado: false
  },
  {
    id: 'int-icij',
    nome: 'Offshore Leaks Database (ICIJ)',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'International Consortium of Investigative Journalists',
    selecionado: false
  },
  {
    id: 'int-eu',
    nome: 'EU Sanctions Map',
    categoria: 'Sanções e Apontamentos Internacionais',
    descricao: 'União Europeia',
    selecionado: true
  },

  // G. Processos Judiciais
  {
    id: 'processos-judiciais',
    nome: 'Processos Judiciais Completos',
    categoria: 'Processos Judiciais',
    descricao: 'Todos os detalhes dos processos judiciais',
    selecionado: true
  },

  // H. Processos Administrativos
  {
    id: 'processos-comprot',
    nome: 'Processos Comprot',
    categoria: 'Processos Administrativos',
    descricao: 'Processos do Comprot',
    selecionado: true
  },
  {
    id: 'processos-mpf',
    nome: 'Processos MPF',
    categoria: 'Processos Administrativos',
    descricao: 'Processos do Ministério Público Federal',
    selecionado: true
  }
];

import { RelatorioCompliance } from '@/types/compliance';
import { CategoryWeight, TipoPerfil } from '@/contexts/WeightsContext';

/**
 * Calcula o score de compliance baseado nos pesos das categorias
 * Score final: 0-100 (100 = sem riscos)
 */
export const calculateComplianceScore = (
  relatorio: RelatorioCompliance,
  weights: CategoryWeight[],
  tipoPerfil: TipoPerfil = 'empresa'
): number => {
  let totalScore = 0;
  let totalWeight = 0;

  // Função auxiliar para obter peso de uma categoria
  const getWeight = (categoria: string): number => {
    const weight = weights.find(w => w.categoria === categoria);
    return weight ? weight.peso : 5; // Default 5 se não encontrado
  };

  // 1. Dados Cadastrais (max 100 pontos)
  if (relatorio.dadosCadastrais) {
    const weight = getWeight('Dados Cadastrais');
    let score = 100;
    
    if (relatorio.dadosCadastrais.situacaoCadastral !== 'Ativo') {
      score -= 50;
    }
    
    totalScore += score * weight;
    totalWeight += weight;
  }

  // 2. Quadro Societário (max 100 pontos)
  if (relatorio.quadroSocietario) {
    const weight = getWeight('Sócios e Acionistas');
    let score = 100;
    
    // Penaliza se tiver muitos sócios (complexidade)
    if (relatorio.quadroSocietario.socios.length > 10) {
      score -= 10;
    }
    
    totalScore += score * weight;
    totalWeight += weight;
  }

  // 3. Participações (max 100 pontos)
  if (relatorio.participacaoSocietaria) {
    const weight = getWeight('Relacionamento e Participações');
    let score = 100;
    
    // Penaliza empresas inativas no portfólio
    const inativas = relatorio.participacaoSocietaria.empresas.filter(
      e => e.situacao !== 'Ativa'
    ).length;
    score -= inativas * 15;
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // 4. Exposição Política - PEP (max 100 pontos, crítico!)
  if (relatorio.exposicaoPolitica) {
    const weight = getWeight('Exposição Política (PEP)');
    let score = 100;
    
    // REGRA ESPECÍFICA PARA TÉCNICOS: Filiação partidária = BLOQUEIO para técnico de URNA
    if (tipoPerfil === 'tecnico' && relatorio.exposicaoPolitica.isPEP) {
      score = 0; // Bloqueio total
    } else {
      if (relatorio.exposicaoPolitica.isPEP) {
        score -= 40; // PEP direto é risco alto
      }
      
      if (relatorio.exposicaoPolitica.relacionamentoPEP) {
        score -= 20; // Relacionamento PEP é risco médio
      }
      
      if (relatorio.exposicaoPolitica.detalhes) {
        relatorio.exposicaoPolitica.detalhes.forEach(detalhe => {
          if (detalhe.nivelExposicao === 'Alto') score -= 15;
          else if (detalhe.nivelExposicao === 'Médio') score -= 10;
          else score -= 5;
        });
      }
    }
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // 5. Sanções Nacionais (max 100 pontos, crítico!)
  if (relatorio.sancoesApontamentos) {
    const weight = getWeight('Sanções e Apontamentos Nacionais');
    let score = 100;
    
    const sancoesEncontradas = relatorio.sancoesApontamentos.nacionais.filter(
      s => s.encontrado
    );
    
    sancoesEncontradas.forEach(sancao => {
      // Sanções graves têm penalidade maior
      if (['Trabalho Escravo', 'CNIA', 'BNMP', 'CEIS', 'CNEP'].includes(sancao.tipo)) {
        score -= 25; // Crítico
      } else if (['CADE', 'CEPIM', 'Dívida Ativa União'].includes(sancao.tipo)) {
        score -= 15; // Alto
      } else {
        score -= 10; // Médio
      }
    });
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // 6. Sanções Internacionais (max 100 pontos)
  if (relatorio.sancoesApontamentos) {
    const weight = getWeight('Sanções e Apontamentos Internacionais');
    let score = 100;
    
    const sancoesInternacionais = relatorio.sancoesApontamentos.internacionais.filter(
      s => s.encontrado
    );
    
    // Sanções internacionais são muito graves
    score -= sancoesInternacionais.length * 30;
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // 7. Processos Judiciais (max 100 pontos)
  if (relatorio.processosJudiciais) {
    const weight = getWeight('Processos Judiciais');
    let score = 100;
    
    // REGRAS ESPECÍFICAS PARA TÉCNICOS
    if (tipoPerfil === 'tecnico') {
      const processosCiveis = relatorio.processosJudiciais.processos.filter(
        p => p.classe?.toLowerCase().includes('cível') || p.assunto?.toLowerCase().includes('cível')
      );
      const processosCriminais = relatorio.processosJudiciais.processos.filter(
        p => p.classe?.toLowerCase().includes('criminal') || p.assunto?.toLowerCase().includes('criminal') || p.classe?.toLowerCase().includes('penal')
      );
      const processosTrabalhistas = relatorio.processosJudiciais.processos.filter(
        p => p.classe?.toLowerCase().includes('trabalh') || p.assunto?.toLowerCase().includes('trabalh') || p.tribunal?.toLowerCase().includes('trt')
      );
      
      // Processos cíveis ou criminais = NEGATIVA AUTOMÁTICA
      if (processosCiveis.length > 0 || processosCriminais.length > 0) {
        score = 0;
      } else if (processosTrabalhistas.length > 0) {
        // Processos trabalhistas = RISCO (penalidade moderada)
        score -= processosTrabalhistas.length * 15;
      }
      
      // Processos ativos em geral = PENDENTE (penalidade leve para avaliação)
      const processosAtivos = relatorio.processosJudiciais.processos.filter(
        p => p.status === 'Ativo'
      ).length;
      score -= processosAtivos * 5;
    } else {
      // REGRAS PARA EMPRESAS (lógica anterior mantida)
      const processosAtivos = relatorio.processosJudiciais.processos.filter(
        p => p.status === 'Ativo'
      ).length;
      
      score -= processosAtivos * 5;
      
      const poloPassivo = relatorio.processosJudiciais.processos.filter(
        p => p.polo === 'Passivo' && p.status === 'Ativo'
      ).length;
      
      score -= poloPassivo * 5;
      
      if (relatorio.processosJudiciais.quantidadeTotal > 10) {
        score -= 10;
      }
    }
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // 8. Processos Administrativos (max 100 pontos)
  if (relatorio.processosAdministrativos) {
    const weight = getWeight('Processos Administrativos');
    let score = 100;
    
    const totalProcessos = 
      relatorio.processosAdministrativos.comprot.length +
      relatorio.processosAdministrativos.mpf.length;
    
    score -= totalProcessos * 10;
    
    // Multas reduzem score
    const multasComprot = relatorio.processosAdministrativos.comprot
      .filter(p => p.multa && p.multa > 0).length;
    const multasMpf = relatorio.processosAdministrativos.mpf
      .filter(p => p.multa && p.multa > 0).length;
    
    score -= (multasComprot + multasMpf) * 10;
    
    totalScore += Math.max(0, score) * weight;
    totalWeight += weight;
  }

  // Calcula média ponderada
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100;
  
  // Garante que está entre 0 e 100
  return Math.max(0, Math.min(100, finalScore));
};

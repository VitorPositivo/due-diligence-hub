import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategoriaModulo } from '@/types/compliance';

export type TipoPerfil = 'tecnico' | 'empresa';

export interface CategoryWeight {
  categoria: CategoriaModulo;
  peso: number; // 1-10
  descricao: string;
}

const defaultWeightsTecnico: CategoryWeight[] = [
  {
    categoria: 'Dados Cadastrais',
    peso: 6,
    descricao: 'Informações básicas e cadastrais'
  },
  {
    categoria: 'Sócios e Acionistas',
    peso: 3,
    descricao: 'Não aplicável para técnicos'
  },
  {
    categoria: 'Relacionamento e Participações',
    peso: 3,
    descricao: 'Não aplicável para técnicos'
  },
  {
    categoria: 'Exposição Política (PEP)',
    peso: 10,
    descricao: 'BLOQUEIO: Filiação partidária para técnico de URNA'
  },
  {
    categoria: 'Sanções e Apontamentos Nacionais',
    peso: 10,
    descricao: 'Sanções e restrições nacionais'
  },
  {
    categoria: 'Sanções e Apontamentos Internacionais',
    peso: 8,
    descricao: 'Sanções e restrições internacionais'
  },
  {
    categoria: 'Processos Judiciais',
    peso: 10,
    descricao: 'CRÍTICO: Cíveis/Criminais=NEGADO, Trabalhistas=RISCO'
  },
  {
    categoria: 'Processos Administrativos',
    peso: 7,
    descricao: 'Processos administrativos'
  }
];

const defaultWeightsEmpresa: CategoryWeight[] = [
  {
    categoria: 'Dados Cadastrais',
    peso: 5,
    descricao: 'Informações básicas e cadastrais'
  },
  {
    categoria: 'Sócios e Acionistas',
    peso: 7,
    descricao: 'Composição societária e participações'
  },
  {
    categoria: 'Relacionamento e Participações',
    peso: 6,
    descricao: 'Vínculos empresariais e participações'
  },
  {
    categoria: 'Exposição Política (PEP)',
    peso: 9,
    descricao: 'Exposição política e relacionamentos PEP'
  },
  {
    categoria: 'Sanções e Apontamentos Nacionais',
    peso: 10,
    descricao: 'Sanções e restrições nacionais'
  },
  {
    categoria: 'Sanções e Apontamentos Internacionais',
    peso: 8,
    descricao: 'Sanções e restrições internacionais'
  },
  {
    categoria: 'Processos Judiciais',
    peso: 7,
    descricao: 'Litígios e processos judiciais'
  },
  {
    categoria: 'Processos Administrativos',
    peso: 6,
    descricao: 'Processos administrativos'
  }
];

interface WeightsContextType {
  weights: CategoryWeight[];
  updateWeight: (categoria: CategoriaModulo, peso: number) => void;
  resetWeights: () => void;
  tipoPerfil: TipoPerfil;
  setTipoPerfil: (tipo: TipoPerfil) => void;
}

const WeightsContext = createContext<WeightsContextType | undefined>(undefined);

export const WeightsProvider = ({ children }: { children: ReactNode }) => {
  const [tipoPerfil, setTipoPerfilState] = useState<TipoPerfil>(() => {
    const stored = localStorage.getItem('compliance-tipo-perfil');
    return (stored as TipoPerfil) || 'empresa';
  });

  const [weights, setWeights] = useState<CategoryWeight[]>(() => {
    const stored = localStorage.getItem(`compliance-weights-${tipoPerfil}`);
    return stored ? JSON.parse(stored) : (tipoPerfil === 'tecnico' ? defaultWeightsTecnico : defaultWeightsEmpresa);
  });

  useEffect(() => {
    localStorage.setItem('compliance-tipo-perfil', tipoPerfil);
  }, [tipoPerfil]);

  useEffect(() => {
    localStorage.setItem(`compliance-weights-${tipoPerfil}`, JSON.stringify(weights));
  }, [weights, tipoPerfil]);

  const setTipoPerfil = (tipo: TipoPerfil) => {
    setTipoPerfilState(tipo);
    const stored = localStorage.getItem(`compliance-weights-${tipo}`);
    setWeights(stored ? JSON.parse(stored) : (tipo === 'tecnico' ? defaultWeightsTecnico : defaultWeightsEmpresa));
  };

  const updateWeight = (categoria: CategoriaModulo, peso: number) => {
    setWeights(prev =>
      prev.map(w => w.categoria === categoria ? { ...w, peso } : w)
    );
  };

  const resetWeights = () => {
    setWeights(tipoPerfil === 'tecnico' ? defaultWeightsTecnico : defaultWeightsEmpresa);
  };

  return (
    <WeightsContext.Provider value={{ weights, updateWeight, resetWeights, tipoPerfil, setTipoPerfil }}>
      {children}
    </WeightsContext.Provider>
  );
};

export const useWeights = () => {
  const context = useContext(WeightsContext);
  if (!context) {
    throw new Error('useWeights must be used within WeightsProvider');
  }
  return context;
};

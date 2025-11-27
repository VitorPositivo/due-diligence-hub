import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategoriaModulo } from '@/types/compliance';

export interface CategoryWeight {
  categoria: CategoriaModulo;
  peso: number; // 1-10
  descricao: string;
}

const defaultWeights: CategoryWeight[] = [
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
}

const WeightsContext = createContext<WeightsContextType | undefined>(undefined);

export const WeightsProvider = ({ children }: { children: ReactNode }) => {
  const [weights, setWeights] = useState<CategoryWeight[]>(() => {
    const stored = localStorage.getItem('compliance-weights');
    return stored ? JSON.parse(stored) : defaultWeights;
  });

  useEffect(() => {
    localStorage.setItem('compliance-weights', JSON.stringify(weights));
  }, [weights]);

  const updateWeight = (categoria: CategoriaModulo, peso: number) => {
    setWeights(prev =>
      prev.map(w => w.categoria === categoria ? { ...w, peso } : w)
    );
  };

  const resetWeights = () => {
    setWeights(defaultWeights);
  };

  return (
    <WeightsContext.Provider value={{ weights, updateWeight, resetWeights }}>
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

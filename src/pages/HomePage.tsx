import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Settings, FileSpreadsheet, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const menuOptions = [
  {
    id: 'manual',
    title: 'Verificar Manualmente',
    description: 'Consulte CPF ou CNPJ individualmente com análise detalhada de compliance',
    icon: Search,
    route: '/verificar',
    color: 'from-primary to-accent',
  },
  {
    id: 'admin',
    title: 'Painel Administrativo',
    description: 'Configure regras, pesos e presets de análise de compliance',
    icon: Settings,
    route: '/admin',
    color: 'from-accent to-primary',
  },
  {
    id: 'bulk',
    title: 'Consulta em Massa',
    description: 'Envie um arquivo CSV para realizar consultas em lote de forma automatizada',
    icon: FileSpreadsheet,
    route: '/consulta-massa',
    color: 'from-primary/80 to-accent/80',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Sistema de Compliance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plataforma completa para análise e verificação de conformidade de pessoas físicas e jurídicas
          </p>
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {menuOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <motion.div key={option.id} variants={itemVariants}>
                <Card
                  className="group cursor-pointer h-full border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg overflow-hidden"
                  onClick={() => navigate(option.route)}
                >
                  <CardHeader className="pb-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary hover:text-accent group-hover:translate-x-1 transition-transform"
                    >
                      Acessar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Sistema operacional
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

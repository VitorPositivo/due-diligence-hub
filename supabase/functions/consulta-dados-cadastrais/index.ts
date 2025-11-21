import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documento } = await req.json();
    
    if (!documento) {
      return new Response(
        JSON.stringify({ error: 'Documento não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanDoc = documento.replace(/\D/g, '');
    const isCNPJ = cleanDoc.length === 14;

    console.log(`Consultando dados cadastrais para: ${cleanDoc}`);

    if (isCNPJ) {
      // Consulta CNPJ via OpenCNPJ (API gratuita)
      const response = await fetch(`https://api.opencnpj.org/${cleanDoc}`);
      
      if (!response.ok) {
        console.error(`OpenCNPJ error: ${response.status}`);
        return new Response(
          JSON.stringify({ error: 'Erro ao consultar CNPJ', status: response.status }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Dados CNPJ recebidos:', data);

      // Formatar resposta no padrão da aplicação
      const dadosCadastrais = {
        documento: cleanDoc,
        tipo: 'CNPJ' as const,
        razaoSocial: data.razao_social || data.nome,
        nomeFantasia: data.nome_fantasia || data.fantasia,
        situacao: data.situacao_cadastral || data.status,
        dataAbertura: data.data_abertura || data.abertura,
        naturezaJuridica: data.natureza_juridica || data.natureza?.descricao,
        cnae: {
          primario: data.atividade_principal?.[0]?.text || data.cnae_fiscal_descricao,
          secundarios: data.atividades_secundarias?.map((a: any) => a.text) || []
        },
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.municipio || data.cidade,
          uf: data.uf,
          cep: data.cep
        },
        contato: {
          email: data.email,
          telefone: data.telefone || data.ddd_telefone_1
        },
        capitalSocial: data.capital_social,
        porte: data.porte
      };

      return new Response(
        JSON.stringify(dadosCadastrais),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // CPF - Retornar estrutura básica (APIs de CPF requerem autenticação)
      console.log('CPF consultado - dados limitados disponíveis');
      
      return new Response(
        JSON.stringify({
          documento: cleanDoc,
          tipo: 'CPF' as const,
          mensagem: 'Consulta completa de CPF requer API paga. Configure CPFCNPJ_API_KEY ou SERASA_EXPERIAN_API_KEY',
          dadosBasicos: {
            valido: true,
            formatado: cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro na consulta de dados cadastrais:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
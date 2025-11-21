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

    if (!isCNPJ) {
      return new Response(
        JSON.stringify({ error: 'Consulta de sócios disponível apenas para CNPJ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Consultando quadro societário para: ${cleanDoc}`);

    // Consulta via OpenCNPJ
    const response = await fetch(`https://api.opencnpj.org/${cleanDoc}`);
    
    if (!response.ok) {
      console.error(`OpenCNPJ error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Erro ao consultar sócios', status: response.status }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Dados de sócios recebidos');

    // Formatar quadro societário
    const socios = (data.qsa || data.socios || []).map((socio: any) => ({
      nome: socio.nome || socio.nome_socio,
      cpfCnpj: socio.cpf_cnpj_socio || socio.documento,
      qualificacao: socio.qualificacao || socio.qualificacao_socio,
      dataEntrada: socio.data_entrada || socio.data_entrada_sociedade,
      percentualCapital: socio.percentual_capital_social,
      qualificacaoRepresentante: socio.qualificacao_representante_legal,
      nomeRepresentante: socio.nome_representante_legal
    }));

    const participacoes = data.estabelecimentos?.map((est: any) => ({
      cnpj: est.cnpj,
      razaoSocial: est.nome_fantasia || est.razao_social,
      situacao: est.situacao_cadastral,
      dataAbertura: est.data_inicio_atividade
    })) || [];

    return new Response(
      JSON.stringify({
        documento: cleanDoc,
        socios,
        totalSocios: socios.length,
        participacoes,
        totalParticipacoes: participacoes.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na consulta de sócios:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
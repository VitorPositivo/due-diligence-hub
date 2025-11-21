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
    const { documento, nome } = await req.json();
    
    if (!documento && !nome) {
      return new Response(
        JSON.stringify({ error: 'Documento ou nome não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanDoc = documento?.replace(/\D/g, '');
    console.log(`Consultando PEP para: ${cleanDoc || nome}`);

    // Portal da Transparência - PEP (API Gratuita)
    try {
      const pepUrl = `https://portaldatransparencia.gov.br/api-de-dados/pep?${
        cleanDoc ? `cpf=${cleanDoc}` : `nome=${encodeURIComponent(nome)}`
      }&pagina=1`;
      
      const pepResponse = await fetch(pepUrl);
      
      if (!pepResponse.ok) {
        console.log(`Portal Transparência PEP: Status ${pepResponse.status}`);
        
        // Se não encontrou no portal, retornar estrutura vazia
        return new Response(
          JSON.stringify({
            documento: cleanDoc,
            nome,
            isPEP: false,
            registros: [],
            totalRegistros: 0,
            fontes: ['Portal da Transparência'],
            mensagem: 'Nenhum registro PEP encontrado nas bases públicas',
            consultaRealizada: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const pepData = await pepResponse.json();
      console.log(`PEP: ${pepData.length} registros encontrados`);

      const registros = pepData.map((item: any) => ({
        cpf: item.cpf || item.pessoa?.cpf,
        nome: item.nome || item.pessoa?.nome,
        funcao: item.funcao?.nome,
        orgao: item.orgao?.nome,
        lotacao: item.lotacao,
        dataInicio: item.dataInicio,
        dataFim: item.dataFim,
        situacao: item.dataFim ? 'Ex-PEP' : 'PEP Ativo',
        nivel: item.funcao?.nivel
      }));

      return new Response(
        JSON.stringify({
          documento: cleanDoc,
          nome,
          isPEP: registros.length > 0,
          registros,
          totalRegistros: registros.length,
          fontes: ['Portal da Transparência'],
          consultaRealizada: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Erro ao consultar PEP:', error);
      
      return new Response(
        JSON.stringify({
          documento: cleanDoc,
          nome,
          isPEP: false,
          registros: [],
          totalRegistros: 0,
          erro: 'Erro ao consultar base PEP',
          mensagem: 'Para consulta completa de PEP, configure SERASA_EXPERIAN_API_KEY ou CPFCNPJ_API_KEY',
          consultaRealizada: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro na consulta de PEP:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
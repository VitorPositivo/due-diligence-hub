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
    const datajudApiKey = Deno.env.get('DATAJUD_CNJ_API_KEY');
    
    if (!documento && !nome) {
      return new Response(
        JSON.stringify({ error: 'Documento ou nome não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanDoc = documento?.replace(/\D/g, '');
    console.log(`Consultando processos para: ${cleanDoc || nome}`);

    // Verificar se a chave da API DataJud está configurada
    if (!datajudApiKey) {
      console.log('DATAJUD_CNJ_API_KEY não configurada');
      
      return new Response(
        JSON.stringify({
          documento: cleanDoc,
          nome,
          processosJudiciais: [],
          processosAdministrativos: [],
          totalProcessos: 0,
          mensagem: 'API DataJud CNJ não configurada. Configure DATAJUD_CNJ_API_KEY para consultar processos judiciais.',
          instrucoes: 'Acesse https://www.cnj.jus.br/sistemas/datajud/api-publica/ para credenciamento',
          consultaRealizada: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Consultar DataJud CNJ (requer credenciamento institucional)
    try {
      const searchParam = cleanDoc || nome;
      const datajudUrl = `https://api-publica.datajud.cnj.jus.br/api_publica_cnj/_search`;
      
      const body = {
        query: {
          bool: {
            should: [
              { match: { "numeroProcesso": searchParam } },
              { match: { "participantes.nome": searchParam } },
              { match: { "participantes.documento": cleanDoc } }
            ]
          }
        },
        size: 100
      };

      const datajudResponse = await fetch(datajudUrl, {
        method: 'POST',
        headers: {
          'Authorization': `APIKey ${datajudApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!datajudResponse.ok) {
        console.error(`DataJud error: ${datajudResponse.status}`);
        const errorText = await datajudResponse.text();
        console.error('DataJud error details:', errorText);
        
        return new Response(
          JSON.stringify({
            error: 'Erro ao consultar DataJud CNJ',
            status: datajudResponse.status,
            detalhes: 'Verifique se o DATAJUD_CNJ_API_KEY está correto e ativo'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const datajudData = await datajudResponse.json();
      const hits = datajudData.hits?.hits || [];
      
      console.log(`DataJud: ${hits.length} processos encontrados`);

      const processosJudiciais = hits.map((hit: any) => {
        const source = hit._source;
        return {
          numeroProcesso: source.numeroProcesso,
          tribunal: source.tribunal,
          dataDistribuicao: source.dataAjuizamento,
          classe: source.classe?.nome,
          assunto: source.assunto?.[0]?.nome,
          polo: source.participantes?.find((p: any) => 
            p.documento === cleanDoc || p.nome?.toLowerCase().includes(nome?.toLowerCase())
          )?.polo,
          parteContraria: source.participantes?.find((p: any) => 
            p.documento !== cleanDoc
          )?.nome,
          status: source.movimentos?.[0]?.nome,
          valorCausa: source.valorCausa,
          orgaoJulgador: source.orgaoJulgador?.nome
        };
      });

      // Processos administrativos (dados limitados sem API específica)
      const processosAdministrativos: any[] = [];

      return new Response(
        JSON.stringify({
          documento: cleanDoc,
          nome,
          processosJudiciais,
          processosAdministrativos,
          totalProcessos: processosJudiciais.length + processosAdministrativos.length,
          fontes: ['DataJud CNJ'],
          consultaRealizada: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Erro ao consultar processos:', error);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          mensagem: 'Erro ao consultar processos judiciais'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro na consulta de processos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
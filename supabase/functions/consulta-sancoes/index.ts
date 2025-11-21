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
    console.log(`Consultando sanções para: ${cleanDoc || nome}`);

    const resultados: {
      nacionais: {
        ceis: any[];
        cnep: any[];
        cepim: any[];
        trabalhoEscravo: any[];
        inabilitados: any[];
      };
      internacionais: {
        ofac: any[];
        un: any[];
        worldBank: any[];
        euSanctions: any[];
      };
    } = {
      nacionais: {
        ceis: [],
        cnep: [],
        cepim: [],
        trabalhoEscravo: [],
        inabilitados: []
      },
      internacionais: {
        ofac: [],
        un: [],
        worldBank: [],
        euSanctions: []
      }
    };

    // 1. Consultar CEIS (Portal da Transparência - API Gratuita)
    try {
      const ceisUrl = `https://portaldatransparencia.gov.br/api-de-dados/ceis?${
        cleanDoc ? `cpfCnpj=${cleanDoc}` : `nome=${encodeURIComponent(nome)}`
      }&pagina=1`;
      
      const ceisResponse = await fetch(ceisUrl);
      if (ceisResponse.ok) {
        const ceisData = await ceisResponse.json();
        resultados.nacionais.ceis = ceisData.map((item: any) => ({
          nome: item.nome || item.pessoaJuridica?.razaoSocial,
          cpfCnpj: item.cpfCnpj || item.pessoa?.cpfFormatado || item.pessoaJuridica?.cnpjFormatado,
          orgao: item.orgaoSancionador?.nome,
          tipoSancao: item.tipoSancao?.descricao,
          dataInicioSancao: item.dataInicioSancao,
          dataFimSancao: item.dataFimSancao,
          fundamentoLegal: item.fundamentoLegal
        }));
        console.log(`CEIS: ${resultados.nacionais.ceis.length} registros encontrados`);
      }
    } catch (error) {
      console.error('Erro ao consultar CEIS:', error);
    }

    // 2. Consultar CNEP (Portal da Transparência - API Gratuita)
    try {
      const cnepUrl = `https://portaldatransparencia.gov.br/api-de-dados/cnep?${
        cleanDoc ? `cpfCnpj=${cleanDoc}` : `nome=${encodeURIComponent(nome)}`
      }&pagina=1`;
      
      const cnepResponse = await fetch(cnepUrl);
      if (cnepResponse.ok) {
        const cnepData = await cnepResponse.json();
        resultados.nacionais.cnep = cnepData.map((item: any) => ({
          nome: item.nome || item.pessoaJuridica?.razaoSocial,
          cpfCnpj: item.cpfCnpj || item.pessoa?.cpfFormatado || item.pessoaJuridica?.cnpjFormatado,
          orgao: item.orgaoSancionador?.nome,
          tipoSancao: item.tipoSancao?.descricao,
          dataInicioSancao: item.dataInicioSancao,
          dataFimSancao: item.dataFimSancao
        }));
        console.log(`CNEP: ${resultados.nacionais.cnep.length} registros encontrados`);
      }
    } catch (error) {
      console.error('Erro ao consultar CNEP:', error);
    }

    // 3. Consultar CEPIM (Portal da Transparência - API Gratuita)
    try {
      const cepimUrl = `https://portaldatransparencia.gov.br/api-de-dados/cepim?${
        cleanDoc ? `cpfCnpj=${cleanDoc}` : `nome=${encodeURIComponent(nome)}`
      }&pagina=1`;
      
      const cepimResponse = await fetch(cepimUrl);
      if (cepimResponse.ok) {
        const cepimData = await cepimResponse.json();
        resultados.nacionais.cepim = cepimData.map((item: any) => ({
          nome: item.nome || item.entidade?.nome,
          cnpj: item.cnpj || item.entidade?.cnpj,
          motivo: item.motivo,
          dataInicioSancao: item.dataInicioSancao,
          numeroProcesso: item.numeroProcesso
        }));
        console.log(`CEPIM: ${resultados.nacionais.cepim.length} registros encontrados`);
      }
    } catch (error) {
      console.error('Erro ao consultar CEPIM:', error);
    }

    // 4. Consultar OpenSanctions (Sanções Internacionais - API Gratuita)
    try {
      const searchName = nome || cleanDoc;
      const osUrl = `https://data.opensanctions.org/datasets/latest/default/targets.nested.json`;
      
      const osResponse = await fetch(osUrl);
      if (osResponse.ok) {
        const osData = await osResponse.json();
        
        // Filtrar por nome ou documento
        const matches = osData.targets?.filter((target: any) => {
          const targetName = target.caption?.toLowerCase() || '';
          const searchLower = searchName?.toLowerCase() || '';
          return targetName.includes(searchLower);
        }) || [];

        matches.forEach((match: any) => {
          const entry = {
            nome: match.caption,
            aliases: match.properties?.alias || [],
            pais: match.properties?.country?.[0],
            programa: match.datasets?.[0],
            tipo: match.schema,
            dataNascimento: match.properties?.birthDate?.[0],
            datasource: match.datasets
          };

          // Categorizar por fonte
          const datasets = match.datasets || [];
          if (datasets.some((d: string) => d.includes('ofac'))) {
            resultados.internacionais.ofac.push(entry);
          }
          if (datasets.some((d: string) => d.includes('un_'))) {
            resultados.internacionais.un.push(entry);
          }
          if (datasets.some((d: string) => d.includes('world_bank'))) {
            resultados.internacionais.worldBank.push(entry);
          }
          if (datasets.some((d: string) => d.includes('eu_'))) {
            resultados.internacionais.euSanctions.push(entry);
          }
        });

        console.log(`OpenSanctions: ${matches.length} registros encontrados`);
      }
    } catch (error) {
      console.error('Erro ao consultar OpenSanctions:', error);
    }

    // Calcular totais
    const totalNacionais = Object.values(resultados.nacionais).reduce((sum, arr) => sum + arr.length, 0);
    const totalInternacionais = Object.values(resultados.internacionais).reduce((sum, arr) => sum + arr.length, 0);

    return new Response(
      JSON.stringify({
        documento: cleanDoc,
        nome,
        resultados,
        resumo: {
          totalNacionais,
          totalInternacionais,
          totalGeral: totalNacionais + totalInternacionais
        },
        consultaRealizada: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na consulta de sanções:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
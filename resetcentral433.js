// by puttyoe ~ reset central portao playboy
// Uso: node rtl_listener.js
// Requer: rtl_433 no PATH e permissões para acessar o dongle RTL-SDR.
// Atenção legal: veja observações de legalidade/ética no comentário acima.

//#Para escutar: um receptor SDR (como RTL-SDR, HackRF, Airspy, etc.) com antena adequada.

//#Para transmitir: um transmissor projetado para a frequência desejada (por exemplo, um módulo LoRa, um microtransmissor FM, etc.).
//#Você pode usá-los em experimentos de transmissão de dados por som (audível ou ultrassônico), mas isso é som via ar, não rádio.

//Para emitir ou receber rádio, você precisa de antena metálica com comprimento proporcional ao comprimento 
//de onda (por exemplo, para 433 MHz ≈ 17 cm de fio serve como ¼ de onda).

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FREQ = '433920000'; // em Hz (433.92 MHz)
const RTL_BIN = 'rtl_433';
const OUT_JSONL = path.resolve(__dirname, 'rtl433_out.jsonl');
const HITS_LOG = path.resolve(__dirname, 'hits.log');

// Rotação simples: renomeia arquivo se tiver > maxBytes
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function rotateIfNeeded(filePath) {
  try {
    const st = fs.statSync(filePath);
    if (st.size > MAX_BYTES) {
      const rotated = filePath + '.' + new Date().toISOString().replace(/[:.]/g,'-');
      fs.renameSync(filePath, rotated);
      console.log('Rotacionado', filePath, '->', rotated);
    }
  } catch (e) {
    // se arquivo não existe, ok
  }
}

function safeStringify(obj) {
  try { return JSON.stringify(obj); } catch (e) { return String(obj); }
}

function launchRtl() {
  rotateIfNeeded(OUT_JSONL);
  rotateIfNeeded(HITS_LOG);

  const args = ['-f', FREQ, '-F', 'json'];
  console.log('Iniciando', RTL_BIN, args.join(' '));
  const proc = spawn(RTL_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const rl = readline.createInterface({ input: proc.stdout });

  rl.on('line', (line) => {
    if (!line || !line.trim()) return;
    // grava JSONL assincronamente (append)
    fs.appendFile(OUT_JSONL, line + '\n', (err) => {
      if (err) console.error('Erro gravando out jsonl:', err);
    });

    // tenta parsear JSON
    let obj = null;
    try {
      obj = JSON.parse(line);
    } catch (e) {
      // saída não-JSON: log raw
      const time = new Date().toISOString();
      const rawEntry = `[${time}] (raw) ${line}\n`;
      fs.appendFile(HITS_LOG, rawEntry, () => {});
      console.log(rawEntry.trim());
      return;
    }

    // extrair RSSI de forma resiliente
    const rssi = obj.signal ?? obj.rssi ?? obj.RSSI ?? obj.detected_level ?? null;
    const ts = new Date().toISOString();
    const summary = rssi !== null
      ? `[${ts}] sinal detectado: RSSI=${rssi} | model=${obj.model ?? 'unknown'}`
      : `[${ts}] pacote recebido`;

    // grava hits.log de forma assincrona
    fs.appendFile(HITS_LOG, `[${ts}] ${line}\n`, (err) => {
      if (err) console.error('Erro gravando hits:', err);
    });

    console.log(summary);
  });

  proc.stderr.on('data', (chunk) => {
    const txt = chunk.toString();
    console.error('[rtl_433 stderr]', txt.trim());
    console.log(safeStringify(txt))
    // opcional: gravar em arquivo de erro
    fs.appendFile(path.resolve(__dirname, 'rtl_stderr.log'), new Date().toISOString() + ' ' + txt + '\n', () => {});
  });

  proc.on('error', (err) => {
    console.error('Erro iniciando rtl_433:', err.message);
  });

  proc.on('close', (code, signal) => {
    console.warn(`rtl_433 finalizou (code=${code}, signal=${signal}). Tentando relançar em 5s.`);
    // simples restart com delay; em produção usar backoff exponencial e limite de tentativas
    setTimeout(() => launchRtl(), 5000);
  });

  // sinaliza quando ctrl+c
  process.on('SIGINT', () => {
    console.log('Interrompendo, finalizando rtl_433...');
    proc.kill('SIGTERM');
    process.exit(0);
  });
}

launchRtl();


/*


O que melhorei/adições

Usa readline para garantir leitura por linhas sem cortar JSON.

Escritas em arquivos são assíncronas (não travam o event loop).

Rotação simples de logs para evitar encher disco.

Restart controlado com delay (evita ficar em loop imediato).

Extração RSSI mais resiliente (checa vários nomes de campo).

Tratamento de stderr e erro ao spawnar binário.

Se você quiser avançar (apenas para fins legítimos)

Filtro por modelo/protocolo: só registrar mensagens de interesse (ex.: if (obj.model === 'XYZ')).

Enriquecimento: adicionar geolocalização do receptor, tags, etc.

Interface web: armazenar em um banco (SQLite/Postgres) e mostrar painel.

Decodificadores customizados: estudar rtl_433 plugins/protocolos (respeitando leis).

*/

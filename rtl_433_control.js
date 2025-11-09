
// by puttyoe ~ usar antena AM/FM? auto falante especial ultrasonico?
const { spawn } = require('child_process');
const fs = require('fs');

const freq = '433920000'; // 433.920 MHz
const rtl433 = spawn('rtl_433', ['-f', freq, '-F', 'json']);

const outLog = fs.createWriteStream('rtl433_out.jsonl', { flags: 'a' });
console.log('Iniciando rtl_433 em', freq, 'Hz');

rtl433.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      // salva raw
      outLog.write(line + '\n');

      // O rtl_433 pode ter campos como 'signal', 'rssi', 'protocol', 'model', etc.
      const rssi = obj.signal || obj.rssi || obj.RSSI || null;
      const time = new Date().toISOString();

      if (rssi !== null) {
        console.log(`[${time}] sinal detectado: RSSI=${rssi} | raw=${line}`);
      } else {
        console.log(`[${time}] pacotes: ${line}`);
      }

      // condição simples: se detectar algo, grava arquivo com timestamp
      fs.appendFileSync('hits.log', `[${time}] ${line}\n`);
    } catch (e) {
      // não-JSON (às vezes rtl_433 emite texto) — só logue
      const time = new Date().toISOString();
      console.log(`[${time}] (raw)`, line);
      fs.appendFileSync('hits.log', `[${time}] ${line}\n`);
    }
  }
});

rtl433.stderr.on('data', d => {
  console.error('ERR:', d.toString());
});

rtl433.on('close', (code) => {
  console.log('rtl_433 finalizou com código', code);
});

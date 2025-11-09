// detecta ondas sonoras pelo mic 
//by puttyoe ~ 09/11/2025 ... //

const mic = require("mic");
const fftjs = require("fft-js");
const fetch = require("node-fetch");

const TARGET_FREQ = 473.73;   // frequência alvo
const TOLERANCE = 33;      // margem em Hz
const sampleRate = 35100;

// Evita disparos contínuos
let lastTrigger = 0;
const triggerCooldown = 5000; // 3 segundos

// Configura microfone
const micInstance = mic({
  rate: String(sampleRate),
  channels: "1",
  debug: true,
  device: "default"
});

const micInputStream = micInstance.getAudioStream();

var ar = [];

function classifyFrequency(freq) {
  if (freq < 20) return "Infrassom (não audível, vibrações)";
  if (freq < 60) return "Graves profundos (subwoofer, terremoto, motor)";
  if (freq < 250) return "Baixos (voz masculina, bumbo, baixo elétrico)";
  if (freq < 500) return "Médios graves (voz, piano, cordas)";
  if (freq < 2000) return "Médios (voz humana, fala, instrumentos)";
  if (freq < 8000) return "Agudos (fala clara, percussão, chiado)";
  if (freq < 20000) return "Altos agudos (brilho, harmônicos)";
  if (freq < 30000) return "Início do ultrassom (animais, sensores)";
  if (freq < 50000) return "Ultrassom técnico (~40 kHz, sensores de distância)";
  return "Frequência fora do alcance prático";
}


micInputStream.on("data", async (data) => {
  const samples = new Int16Array(data.buffer);
  const phasors = fftjs.fft(samples);
 // console.log(phasors);
  const mags = phasors.map(([re, im]) => Math.sqrt(re * re + im * im));
//   console.log(mags);
  const maxIndex = mags.indexOf(Math.max(...mags));
  const freq = (sampleRate / samples.length) * maxIndex;
  
  process.stdout.write(`\r🎧 Freq: ${freq.toFixed(1)} Hz `);

  if (Math.abs(freq - TARGET_FREQ) <= TOLERANCE) {  
    const now = Date.now();
    if (now - lastTrigger > triggerCooldown) {
      lastTrigger = now;
      ar.push(freq);
      console.log(`\n🎯 Detectado ~${freq.toFixed(1)} Hz → enviando requisição...`);
      await triggerAction();
    }
  }
  
if (freq > 50 && freq < 20000) {
  console.log(`🎧 Freq audível: ${freq.toFixed(1)} Hz`);
}
  
console.log(classifyFrequency(freq) + freq)   
 
  console.log(ar);
//  console.log("\n\n\n\n");
});
  
async function triggerAction() {
 //avisar uma URL quando determinada frequencia é encontrada ( acionar bomb)
  try {
    const response = await fetch("http://localhost:4000/ativar");
    console.log(`✅ Ação enviada → Status: ${response.status}`);
  } catch (err) {
    console.error("❌ Erro ao enviar requisição:", err.message);
  }
}
  
micInputStream.on("error", (err) => {
  console.error("Erro no microfone:", err);   
});
      
micInstance.start();
console.log("🎤 Escutando microfone... (Ctrl+C para parar)");


//pode ser usado no terminal e no navegador, virus em massa?





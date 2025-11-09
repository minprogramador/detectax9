
// exemplo para detectar e ressonar  o tom
const mic = require("mic");
const fftjs = require("fft-js");
const Speaker = require("speaker");

const sampleRate = 44100;
const speaker = new Speaker({ channels: 1, bitDepth: 16, sampleRate });
const micInstance = mic({ rate: String(sampleRate), channels: "1", debug: false });

const micInputStream = micInstance.getAudioStream();

micInputStream.on("data", (data) => {
  const samples = new Int16Array(data.buffer);
  const phasors = fftjs.fft(samples);
  const mags = phasors.map(([re, im]) => Math.sqrt(re * re + im * im));
  const maxIndex = mags.indexOf(Math.max(...mags));
  const freq = (sampleRate / samples.length) * maxIndex;

  process.stdout.write(`\rDetectado: ${freq.toFixed(1)} Hz`);

  // gerar tom senoidal com a frequência detectada
  const duration = 0.1; // 100 ms
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(numSamples * 2); // 16 bits

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * freq * (i / sampleRate));
    buffer.writeInt16LE(sample * 32767, i * 2);
  }

  speaker.write(buffer);
});

micInstance.start();
console.log("🎧 Sintonizando no tom detectado...");

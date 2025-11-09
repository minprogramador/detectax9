//by puttyoe ~ detecta frequencia 433

const mic = require('mic');
const FFT = require('fft-js').fft;
const fftUtil = require('fft-js').util;

const sampleRate = 44100; // taxa de amostragem padrão
const fftSize = 2048;     // tamanho da janela FFT
const targetFreq = 433;   // frequência que queremos detectar

// Converte frequência -> índice da bin
function freqToBin(freq) {
  return Math.round(freq * fftSize / sampleRate);
}

// Criar microfone
const micInstance = mic({
  rate: sampleRate.toString(),
  channels: '1',
  bitwidth: '16',
  encoding: 'signed-integer',
  device: 'default',
  debug: false
});

const micInputStream = micInstance.getAudioStream();

let audioBuffer = Buffer.alloc(0);

micInputStream.on('data', data => {
  audioBuffer = Buffer.concat([audioBuffer, data]);

  const bytesPerSample = 2; // 16 bits
  const samples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, Math.floor(audioBuffer.length / bytesPerSample));

  // se temos dados suficientes para uma FFT
  if (samples.length >= fftSize) {
    // pega os primeiros N samples
    const frame = samples.slice(0, fftSize);
    // remove do buffer
    audioBuffer = audioBuffer.slice(fftSize * bytesPerSample);

    // normaliza (-1 a 1)
    const floatSamples = Float32Array.from(frame, v => v / 32768);

    const phasors = FFT(Array.from(floatSamples));
    const mags = fftUtil.fftMag(phasors);

    const bin = freqToBin(targetFreq);
    const mag = mags[bin];

    // imprime a energia no bin de 433 Hz
    const bar = '▇'.repeat(Math.min(Math.floor(mag / 5), 50));
    console.clear();
    console.log(`🎧 Monitorando frequência: ${targetFreq} Hz`);
    console.log(`Amplitude: ${mag.toFixed(2)}`);
    console.log(bar);

    // alerta se passar um limite
    if (mag > 200) {
      console.log('⚠️  Pico detectado próximo de 433 Hz!');
    }
  }
});

micInputStream.on('error', err => console.error('Erro mic:', err));

console.log('🎤 Iniciando microfone...');
micInstance.start();

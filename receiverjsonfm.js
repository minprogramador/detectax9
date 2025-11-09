//by puttyoe ~ receiver json por fm ( ou cranio, fio dentista ) ~ bitcoin receiver original.
const mic = require('mic');
const FFT = require('fft-js').fft;
const fftUtil = require('fft-js').util;

const fft = require('fft-js').fft;

const sampleRate = 44100;
const micInstance = mic({
  rate: '44100',
  channels: '1',
  debug: true,
  device: 'default'
});

const micInputStream = micInstance.getAudioStream();

let bitBuffer = [];

var dtt = '';

const FREQ_0 = 18000;
const FREQ_1 = 19000;
const BIT_DURATION = 0.02; // 20ms
const samplesPerBit = Math.floor(BIT_DURATION * sampleRate);

function detectBit(samples, freq0, freq1, sampleRate = 44100) {
  // método simplificado usando energia no ciclo
  const energy0 = samples.reduce((acc, s, n) => acc + s * Math.sin(2 * Math.PI * freq0 * n / sampleRate), 0);
  const energy1 = samples.reduce((acc, s, n) => acc + s * Math.sin(2 * Math.PI * freq1 * n / sampleRate), 0);
  return Math.abs(energy1) > Math.abs(energy0) ? 1 : 0;
}


function audioToBits(buffer) {
  const samplesPerBit = Math.floor(BIT_DURATION * 44100);
  const bits = [];

for (let i = 0; i + samplesPerBit <= buffer.length / 4; i += samplesPerBit) {
  let sum0 = 0;
  let sum1 = 0;

  for (let j = 0; j < samplesPerBit; j++) {
    const sample = buffer.readInt32LE(4 * (i + j)) / 2147483648;
    sum0 += sample * Math.sin(2 * Math.PI * FREQ_0 * j / SAMPLE_RATE);
    sum1 += sample * Math.sin(2 * Math.PI * FREQ_1 * j / SAMPLE_RATE);
  }

  bits.push(sum1 > sum0 ? 1 : 0);
}


  return bits;
}


function bufferToBits(buffer, bitDuration, freq0, freq1, sampleRate = 44100) {
  // Passo 1: extrair samples de 16 bits
  const samples = [];
  for (let i = 0; i < buffer.length; i += 2) {
    samples.push(buffer.readInt16LE(i));
  }

  // Passo 2: número de samples por bit
  const samplesPerBit = Math.floor(bitDuration * sampleRate);

  // Passo 3: dividir samples por bit e detectar
  const bits = [];
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const bitSamples = samples.slice(i, i + samplesPerBit);
    bits.push(detectBit(bitSamples, freq0, freq1));
  }
    
  return bits;
}  


function audioBufferToBits(buffer) {
  const bits = [];
  
  for (let i = 0; i < buffer.length; i += samplesPerBit * 2) { // 2 bytes por amostra
    const samples = [];
    for (let j = 0; j < samplesPerBit * 2 && i + j + 1 < buffer.length; j += 2) {
      samples.push(buffer.readInt16LE(i + j));
    }
  
    const phasors = fft(samples);
    const magnitudes = fftUtil.fftMag(phasors);
   
    // Frequência com maior magnitude
    let maxIndex = 0;
    let maxMag = 0;
    magnitudes.forEach((mag, idx) => {
      if (mag > maxMag) {
        maxMag = mag;
        maxIndex = idx;
      }
    });
   
    const detectedFreq = maxIndex * sampleRate / samplesPerBit;
    bits.push(Math.abs(detectedFreq - FREQ_1) < Math.abs(detectedFreq - FREQ_0) ? 1 : 0);
  }

  return bits;
}


function audioToBits2(buffer) {
const FREQ_0 = 18000;
const FREQ_1 = 19000;
const BIT_DURATION = 0.02; // 20ms por bit
  const samplesPerBit = Math.floor(BIT_DURATION * 44100);
  const bits = [];

  for (let i = 0; i < buffer.length / 2; i += samplesPerBit) {
    // Extrair bloco de samples
    const block = [];
    for (let j = 0; j < samplesPerBit; j++) {
      const sample = buffer.readInt16LE(2 * (i + j));
      block.push(sample);
    }

    // Calcular FFT para encontrar frequência dominante
    const phasors = fft(block);
    const mags = fftUtil.fftMag(phasors);

    // Frequência com maior magnitude
    const peakIndex = mags.indexOf(Math.max(...mags));
    const freq = peakIndex * 44100 / samplesPerBit;

    // Decidir bit
    const bit = Math.abs(freq - FREQ_1) < Math.abs(freq - FREQ_0) ? 1 : 0;
    bits.push(bit);
  }

  return bits;
}

let audioChunks = [];

micInputStream.on('stopComplete', () => {
  

  const buffer = Buffer.from(audioChunks);
    
 // const bitsRecebidos = bufferToBits(buffer, BIT_DURATION, FREQ_0, FREQ_1);
//console.log(bitsRecebidos);
  console.log(audioToBits(buffer));
      
  // const buffer = Buffer.from(audioChunks[0]);

// Convertir a string usando UTF-16LE
// UTF-8 (común si es JSON u otro texto)
// const textoUtf8 = buffer.toString('utf8');

// UTF-16LE (si cada carácter ocupa 2 bytes y hay muchos 0x00)
// const textoUtf16 = buffer.toString('utf16le');
    
// console.log(textoUtf8);
// console.log(textoUtf16);
    
//  const buffer = Buffer.concat(audioChunks);
 // const json = Buffer.from(buffer).toJSON()
  //const buffer2 = Buffer.from(json.data);
  
//const text = buffer2.toString('utf16le');
  // console.log('JSON recebido:', (audioChunks.length));
});

micInputStream.on('data', (data) => {
  

if (data.length === 0) return;
    
audioChunks.push(data);
// console.log( data.toString('utf8'));
  
      
//const binaryString = Buffer.from(data.buffer).toString('base64');
//console.log(audioToBits(data.buffer));
//console.log(binaryString)
  // const samples = new Int16Array(data.buffer);

// const json = JSON.stringify(Array.from(samples));
//      console.log(json)
const textUtf8 = data.toString('utf8');
// dtt = dtt+textUtf8;
//console.log(textUtf8);  
//console.log(data)
  // FFT simples para detectar frequência dominante
  // const phasors = FFT(Array.from(samples).slice(0, 1024));
  // const magnitudes = fftUtil.fftMag(phasors);
  
  // // Frequência dominante
  // let maxMag = -Infinity;
  // let maxIndex = -1;
  // magnitudes.forEach((m, i) => { if(m > maxMag){ maxMag = m; maxIndex = i; }});


                    // const freq = maxIndex * 44100 / 1024;
  
  // if(freq > 18500 && freq < 18550) bitBuffer.push(0);
  // else if(freq > 18950 && freq < 19050) bitBuffer.push(1);
    
  // // Decodifica cada byte (8 bits)
  // if(bitBuffer.length >= 8){
  //   const byte = bitBuffer.splice(0,8).reduce((acc,b,i) => acc | (b << (7-i)),0);
  //   process.stdout.write(String.fromCharCode(byte));
  // }
});

micInputStream.on('startComplete', () => console.log("Microfone ativo"));
micInputStream.on('error', console.error);

micInstance.start();

setTimeout(() => {
  micInstance.stop();     
}, 10000);
  

//by puttyoe ~ envia json via FM (servidor pelo som ou vibracao do fio), escolhendo frequencia e amplitude (protocolo bitcoin original)

const Speaker = require('speaker');

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 44100
});

// Frequências ultrassônicas para 0 e 1
const FREQ_0 = 18000;
const FREQ_1 = 19000;
const BIT_DURATION = 0.02; // 20ms por bit

// Converte JSON em bits
function jsonToBits(json) {
  const str = JSON.stringify(json);
  const bits = [];
  for (const char of str) {
    const code = char.charCodeAt(0);
    for (let i = 7; i >= 0; i--) {
      bits.push((code >> i) & 1);
    }
  }
  console.log(bits);
  return bits;
}

// Converte bits em buffer de áudio
function bitsToAudio(bits) {
  const samplesPerBit = Math.floor(BIT_DURATION * 44100);
  const buffer = Buffer.alloc(bits.length * samplesPerBit * 2);

  bits.forEach((bit, i) => {
    const freq = bit === 1 ? FREQ_1 : FREQ_0;
    for (let j = 0; j < samplesPerBit; j++) {
      const t = j / 44100;
      const sample = Math.sin(2 * Math.PI * freq * t) * 32767;
      buffer.writeInt16LE(sample, 2 * (i * samplesPerBit + j));
    }
  });

  return buffer;
}


// Exemplo JSON
const data = { comando: "abrir", height: 1.5 };
const bits = jsonToBits(data);
const audioBuffer = bitsToAudio(bits);
     
speaker.write(audioBuffer, () => {
  console.log("JSON transmitido via áudio!");
  speaker.end();
});

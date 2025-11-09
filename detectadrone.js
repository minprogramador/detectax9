//by puttyoe ~ 09/11/2025
const mic = require('mic');
const fft = require('fft-js').fft;
const fftUtil = require('fft-js').util;

//Detecta drone ou onda cerebral, mudando o hz.

const micInstance = mic({
    rate: '44100',
    channels: '1',
    debug: false,
    device: 'default',
});

const micInputStream = micInstance.getAudioStream();

micInputStream.on('data', (data) => {
    // Converte buffer em array de números
    let samples = [];
    for (let i = 0; i < data.length; i += 2) {
        samples.push(data.readInt16LE(i));
    }

    // Calcula FFT
    const phasors = fft(samples);
    const frequencies = fftUtil.fftFreq(phasors, 44100); // frequência em Hz
    const magnitudes = fftUtil.fftMag(phasors);

    // Procura picos típicos de drone (100 Hz – 5 kHz)
    for (let i = 0; i < frequencies.length; i++) {
        if (frequencies[i] > 100 && frequencies[i] < 5000 && magnitudes[i] > 1000) {
            console.log('Possível drone detectado em frequência:', frequencies[i]);
        }
    }
});

micInstance.start();



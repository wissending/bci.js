const fft = require('fft.js');
const nextpow2 = require('./nextpow2.js');

let fftCache = {};

/**
 * Apply a Hann window to a signal
 * @private
 */
function hann(signal) {
    let windowed = [];
    let L = signal.length - 1;
    let C = Math.PI / L;

    let scale = 0;

    for(let i = 0; i < signal.length; i++) {
        let w = Math.sin(C * i) ** 2;
        windowed.push(signal[i] * w);
        scale += w ** 2;
    }

    return {signal: windowed, scale: scale};
}

/** 
 * Estimates the power spectral density of a real-valued input signal using the periodogram method and a rectangular window.
 * Output units are based on that of the input signal, of the form X^2/Hz, where X is the units of the input signal.
 * For example, if the input is an EEG signal measured in μV, then this method returns values of μV^2/Hz.
 * 
 * @memberof module:bcijs
 * @param {number[]} signal - The signal.
 * @param {number} sample_rate - sample rate in Hz
 * @param {Object} [options]
 * @param {number} [options.fftSize=Math.pow(2, bci.nextpow2(signal.length))] - Size of the fft to be used. Should be a power of 2.
 * @param {number} [options.window='rectangular'] - Window function to apply, either 'hann' or 'rectangular'. Default is 'rectangular'.
 * @returns {Object} Object with keys 'estimates' (the psd estimates) and 'frequencies' (the corresponding frequencies)
 */
function periodogram(signal, sample_rate, options) {
	let {fftSize, window} = Object.assign({
        fftSize: Math.pow(2, nextpow2(signal.length)),
        window: 'rectangular'
	}, options);

	let f;
	if (fftCache.hasOwnProperty(fftSize)) {
		f = fftCache[fftSize];
	} else {
		f = new fft(fftSize);
		fftCache[fftSize] = f;
    }
    
    // Apply window
    let num_samples = signal.length;
    let S = num_samples;
    if(window == 'hann') {
        let h = hann(signal);
        signal = h.signal;
        S = h.scale;
    } else if(window != 'rectangular') {
        throw new Error('Unknown window type');
    }

    // Zero pad signal to fftSize if needed
	if (num_samples < fftSize) {
		signal = signal.concat(Array(fftSize - signal.length).fill(0));
	}

    // Complex array [real, imag, real, imag, etc.]
    let freqs = f.createComplexArray();
    
    // Fill in complex array with the FFT values
	f.realTransform(freqs, signal);
    f.completeSpectrum(freqs);
    
    // Get the power of each FFT bin value
    let powers = [];
    let scaling_factor = 2 / (sample_rate * S);
	for (var i = 0; i < freqs.length - 1; i += 2) {
        // magnitude is sqrt(real^2 + imag^2)
        let magnitude = Math.sqrt(freqs[i] ** 2 + freqs[i + 1] ** 2);

        // apply scaling
        let power = scaling_factor * magnitude ** 2;

		powers.push(power);
    }

    // Toss values past Nyquist
    powers = powers.slice(0, powers.length / 2 + 1);

    // Don't scale DC or Nyquist by 2
    powers[0] /= 2;
    powers[powers.length - 1] /= 2;
    
    // Compute frequencies
    let frequencies = new Array(powers.length);
    for(let i = 0; i < frequencies.length; i++) {
        frequencies[i] = i * (sample_rate / fftSize);
    }

	return {
        estimates: powers,
        frequencies: frequencies
    };
}

module.exports = periodogram;
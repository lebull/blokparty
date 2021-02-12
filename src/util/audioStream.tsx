export interface IBand {
    db: number;
    range: number;
    peak: number;
    dbPercent?: number;
}

export class AudioStream {

    public tickNum = 0;

    public bands: Array<IBand> = []; // eq band objects for element height etc
    public freqs: number[] = new Array<number>();
    public playing = false;
    public output = 0;

    public gain : number = 20;

    private _source: MediaStreamAudioSourceNode | null = null; // eventual stream source
    private _audioContext = new AudioContext();
    private _analyser = this._audioContext.createAnalyser();
    private _data: Uint8Array = new Uint8Array(); // final audio data in the standard format

    public init(): void {

    }
    
    public connectStream(stream: MediaStream) {
        this._analyser.minDecibels = -90;
        this._analyser.maxDecibels = -10;
        this._analyser.fftSize = 32;

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
        this._source = this._audioContext.createMediaStreamSource(stream);

        // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
        // MDN An AnalyserNode has exactly one input and one output. The node works even if the output is not connected.
        this._source.connect(this._analyser);

        // setup the frequency labels for the bands
        this.freqs = this._calculateBandFrequencyRanges(this._analyser.context.sampleRate, this._analyser.fftSize);

        // set context.status: running
        this._audioContext.resume();
    }

    public tick() {
        this.tickNum += 1;
        if(!this._source){
            return;
        }
        // frequency data comes as integers on a scale from 0 to 255
        this._data = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(this._data);


        this.bands = [];

        // calculate the height of each band element using frequency data
        for (var i = 0; i < this._analyser.frequencyBinCount; i++) {
            this.bands.push({
                db: this._data[i] + this.gain,
                range: 0,
                peak: 0,
            });
        }
    }

    public setGain(gain: number) : void {
        this.gain = gain;
    }

    private _calculateBandFrequencyRanges(sampleRate: number, fftSize: number) {
        const bands = fftSize / 2; // bands are half the fftSize
        const fqBand = sampleRate / fftSize;
        
        const result = [];

        let fqRange = sampleRate / 2;
        // setup eqbands and labels
        for (let i = 0, j = bands; i < j; i++) {
            this.bands[i] = {
                'db': 0,
                'range': 90,
                'peak': 0,
            }
            // frequency labels
            fqRange = Math.round(fqRange - fqBand);
            result.push(fqRange);
        }
        return result.slice().reverse();
    }
}
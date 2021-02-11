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

    private _source: MediaStreamAudioSourceNode | null = null; // eventual stream source
    private _audioContext = new AudioContext();
    private _analyser = this._audioContext.createAnalyser();
    private _data: Uint8Array = new Uint8Array(); // final audio data in the standard format

    public init(): void {
        // // subscribe to audio device play/stop
        // this.syncService.audioStreamActive().pipe(
        //     takeUntil(this._ngUnsubscribe)
        // ).subscribe((res: any) => {
        //     this.playing = res;
        //     if (!res) {
        //         clearInterval(this._intervalID);
        //         this.playing = false;
        //     }

        // });

        // subscribe to audio device selection (the select dropdown in main nav)
        // controlled by shared/components/audio-devices/
        // this.syncService.getAudioDevice().pipe(
        //     takeUntil(this._ngUnsubscribe)
        // ).subscribe((res: any) => {
        //     if (res) {
        //         this._audioDeviceId = res;
        //         this.play(this._audioDeviceId);
        //     } else {
        //         this.stop();
        //     }
        // });

        // this.wasmService.getActiveBTDevices().pipe(
        //     takeUntil(this._ngUnsubscribe)
        // ).subscribe((res: any) => {
        //     this._activeBTDevices = res;
        // });
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
        this.freqs = this.calcFreqs(this._analyser.context.sampleRate, this._analyser.fftSize);

        // set context.status: running
        this._audioContext.resume();
    }

    /* ------------------------------------------------------------------------ *
        https://github.com/buttplugio/buttplug-developer-guide/blob/master/examples/javascript/device-control-example.js
        When sensitivity scores exist this method:
        - Probably want to debounce this or turn down the times-per-second in frameLooper()
        - Needs to know which band's values should be used
        - Needs to know if the haptic has multiple engines
        - Needs to know which band's values should be used for each haptic engine
    * ------------------------------------------------------------------------ */
    // private async sensitivityRequest(): Promise<any> {
    //     const max = Math.max.apply(Math, this.bands.map(function(o) { return o.peak; })) / 100;
    //     if (max !== this._maxPeak) {
    //         this._maxPeak = max;
    //         this.output = this._maxPeak;
    //     } else {
    //         for ( let i = 0, j = this.bands.length; i < j; i++ ) {
    //             this.bands[i].peak = 0;
    //         }
    //     }
    // }

    // Control the view
    public tick() {
        this.tickNum += 1;
        if(!this._source){
            return;
        }
        // frequency data comes as integers on a scale from 0 to 255
        this._data = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(this._data);

        // calculate the height of each band element using frequency data
        for (var i = 0; i < this._analyser.frequencyBinCount; i++) {
            this.bands[i].db = this._data[i];
            const rawDbPercent = parseInt(((this.bands[i].db / 255) * 100).toFixed());

            // 3: calculate peak: how much db is peaking into the user-set range
            if (this.bands[i].range < rawDbPercent) {
                this.bands[i].peak = rawDbPercent - this.bands[i].range;
            }
        }
    }

    private calcFreqs(sampleRate: number, fftSize: number) {
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
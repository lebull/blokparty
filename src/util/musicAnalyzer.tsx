const FFT_BUCKET_COUNT = 64;

export interface IAnalysisFrame {
    fftTable: Uint8Array;
    beatEnergy: number,
    totalAmplitude: number,
}

export class MusicAnalyzer {

    public playing = false;
    public output = 0;

    public gain: number = 1;

    private _source: MediaStreamAudioSourceNode | null = null; // eventual stream source
    private _audioContext = new AudioContext();
    private _analyser = this._audioContext.createAnalyser();
    private _analysisFrameBuffer = new Array<IAnalysisFrame>();


    public connectStream(stream: MediaStream) {
        this._analyser.minDecibels = -90;
        this._analyser.maxDecibels = -10;
        this._analyser.fftSize = FFT_BUCKET_COUNT * 2;

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
        this._source = this._audioContext.createMediaStreamSource(stream);

        // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
        // MDN An AnalyserNode has exactly one input and one output. The node works even if the output is not connected.
        this._source.connect(this._analyser);

        // set context.status: running
        this._audioContext.resume();
    }

    public tick(expectedIntervalPeriodMs: number) {
        if (!this._source) {
            return;
        }
        // Magic line.
        const rawFFT = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(rawFFT); //They pass by reference because why noto/
        const newFrame = this._postProcessTick(rawFFT, expectedIntervalPeriodMs);
        this._pushAnalysisFrame(newFrame);
    }

    public setGain(gain: number): void {
        this.gain = gain;
    }

    public getAnalysisFrame(){
        return this._analysisFrameBuffer[0];
    }

    private _pushAnalysisFrame(analysisFrame: IAnalysisFrame){
        this._analysisFrameBuffer = [analysisFrame, ...this._analysisFrameBuffer].slice(0, 10);
    }

    private _postProcessTick(rawFFT: Uint8Array, expectedIntervalPeriodMs: number) {

        let beatEnergyAvg = 0;
        let totalAmplitude = 0;

        const currentAnalysisFrame = {
            fftTable: rawFFT.map(band => Math.min(band * this.gain,255)),
            totalAmplitude: 0,
            beatEnergy: 0,
        } as IAnalysisFrame;

        const previousFrame = this._analysisFrameBuffer[0];

        //Initial pass of calculation
        currentAnalysisFrame.fftTable.forEach((currentFrameBucketFrequency, i) => {
            if (!previousFrame || previousFrame.fftTable.length === 0) {
                return 0;
            }
            const numberOfBars = previousFrame.fftTable.length;
            totalAmplitude += (currentFrameBucketFrequency / numberOfBars);
        });

        //Calulate things that require totalAmplitude
        currentAnalysisFrame.fftTable.forEach((currentFrameBucketFrequency, i) => {
            if (!previousFrame || previousFrame.fftTable.length === 0) {
                return 0;
            }
            const numberOfBars = previousFrame.fftTable.length;
            const delta = currentFrameBucketFrequency - previousFrame.fftTable[i];
            beatEnergyAvg += (delta / numberOfBars) * (totalAmplitude/25);
        });

        beatEnergyAvg /= 16;

        let fallingBeatEnergyLimit = 0;
        let fallingTotalAmplitudeLimit = 0;
        try {
            fallingBeatEnergyLimit = previousFrame.beatEnergy - (expectedIntervalPeriodMs / 800);
            fallingTotalAmplitudeLimit = previousFrame.totalAmplitude - (expectedIntervalPeriodMs / 50);
        } catch {
            fallingBeatEnergyLimit = 0;
            fallingTotalAmplitudeLimit = 0;
        }

        currentAnalysisFrame.beatEnergy = Math.min(Math.max(beatEnergyAvg, fallingBeatEnergyLimit, 0), 1);
        currentAnalysisFrame.totalAmplitude = Math.min(Math.max(totalAmplitude / 128, fallingTotalAmplitudeLimit, 0), 1);

        // currentAnalysisFrame.beatEnergy = currentAnalysisFrame.beatEnergy;
        currentAnalysisFrame.totalAmplitude = currentAnalysisFrame.totalAmplitude ** 4;
        return currentAnalysisFrame;
    }
}
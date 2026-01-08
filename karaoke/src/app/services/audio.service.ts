import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {

  audioCtx!: AudioContext;
  analyser!: AnalyserNode;
  data!: Float32Array;

  micStream!: MediaStream;
  micSource!: MediaStreamAudioSourceNode;
  monitorGain!: GainNode;

  monitorOn = false;
  lastTick = performance.now();

  async enableMic() {
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
      deviceId: undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      }
    });

    this.audioCtx = new AudioContext({ latencyHint: 'interactive' });
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();

    this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.micSource.connect(this.analyser);

    this.monitorGain = this.audioCtx.createGain();
    this.monitorGain.gain.value = 0;
    this.micSource.connect(this.monitorGain);
    this.monitorGain.connect(this.audioCtx.destination);

    this.data = new Float32Array(this.analyser.fftSize);
    this.lastTick = performance.now();
  }

  toggleMonitor(volume: any) {
    this.monitorOn = !this.monitorOn;
    this.monitorGain.gain.value = this.monitorOn ? volume : 0;
  }

  setMonitorVolume(vol: any) {
    if (this.monitorOn) {
      this.monitorGain.gain.value = vol;
    }
  }

  readMicLevel() {
    this.analyser.getFloatTimeDomainData(this.data as Float32Array<ArrayBuffer>);

    let sum = 0;
    let peak = 0;

    for (const v of this.data) {
      sum += v * v;
      peak = Math.max(peak, Math.abs(v));
    }

    const rms = Math.sqrt(sum / this.data.length);
    const now = performance.now();
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;

    return { rms, peak, dt };
  }
}

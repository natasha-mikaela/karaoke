import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../services/audio.service';
import { RankingService, KaraokeConfig } from '../services/ranking.service';

@Component({
  selector: 'app-karaoke',
  imports: [
    DecimalPipe, 
    MatButtonModule, 
    MatCardModule, 
    MatSliderModule, 
    MatInputModule, 
    MatTableModule, 
    MatIconModule, 
    MatDividerModule, 
    MatProgressBarModule, 
    MatToolbarModule,
    FormsModule, 
  ],
  templateUrl: './karaoke.html',
  styleUrl: './karaoke.scss',
})

export class Karaoke implements OnInit  {

  ngOnInit(): void {
    this.cfg = this.rankingSvc.loadConfig();
    this.ranking = this.rankingSvc.loadRanking();
  }
 @ViewChild('player') player!: ElementRef<HTMLVideoElement>;

  videoUrl: string | null = null;
  currentSong = '';
  savedThisRun = false;

  micEnabled = false;
  micLevel = 0;
  score = 0;

  monitorVolume = 0.6;

  videoState = '?';
  videoTime = 0;

  ranking: any[] = [];
  cfg!: KaraokeConfig;

  constructor(
    private audio: AudioService,
    public rankingSvc: RankingService
  ) {}

  onVideoSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoUrl = URL.createObjectURL(file);
    this.currentSong = file.name;
    this.score = 0;
    this.savedThisRun = false;
  }

  async enableMic() {
    await this.audio.enableMic();
    this.micEnabled = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  toggleMonitor() {
    this.audio.toggleMonitor(this.monitorVolume);
  }

  updateMonitorVolume() {
    this.audio.setMonitorVolume(this.monitorVolume);
  }

  onVideoEnded() {
    if (this.savedThisRun) return;
    this.savedThisRun = true;
    this.rankingSvc.addRanking(this.currentSong, this.score);
    this.ranking = this.rankingSvc.loadRanking();
  }

  loop() {
    const player = this.player.nativeElement;
    const { rms, peak, dt } = this.audio.readMicLevel();

    this.micLevel = rms;

    if (!player.paused && !player.ended) {
      if (rms >= this.cfg.silenceRms) {
        const clipped = peak >= this.cfg.clipPeak;
        const norm =
          (Math.min(rms, this.cfg.tooLoudRms) - this.cfg.silenceRms) /
          (this.cfg.tooLoudRms - this.cfg.silenceRms);

        let pts = Math.max(0, norm) * this.cfg.maxPtsPerSec * dt;
        if (clipped) pts -= this.cfg.clipPenaltyPerSec * dt;

        this.score = Math.max(0, Math.round(this.score + pts));
      }
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  resetScore() {
    this.score = 0;
  }

  clearRanking() {
    this.rankingSvc.clearRanking();
    this.ranking = [];
  }
}

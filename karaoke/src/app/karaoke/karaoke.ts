import { Component, ViewChild, ElementRef, OnInit, ChangeDetectionStrategy, inject, signal, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AudioService } from '../services/audio.service';
import { RankingService, KaraokeConfig } from '../services/ranking.service';
import { DialogPontuacao } from '../dialog-pontuacao/dialog-pontuacao';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatExpansionModule,
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './karaoke.html',
  styleUrl: './karaoke.scss',
})

export class Karaoke implements OnInit {

  ngOnInit(): void {
    // 1. carrega do serviço
    this.cfg = this.rankingSvc.loadConfig();

    // 2. injeta no form
    this.configForm.patchValue(this.cfg);

    // 3. mantém cfg sincronizado
    this.configForm.valueChanges.subscribe(value => {
      this.cfg = value as KaraokeConfig;
    });

    this.ranking = this.rankingSvc.loadRanking();

    this.configForm.valueChanges.subscribe(val => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('karaoke_config_v1', JSON.stringify(val));
      }
    });

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('karaoke_config_v1');
      if (raw) {
        this.configForm.patchValue(JSON.parse(raw));
      }
    }

    this.ranking = this.rankingSvc.loadRanking();
    this.dataSource.data = this.ranking;
  }

  private _snackBar = inject(MatSnackBar);
  private zone = inject(NgZone);
  readonly panelOpenState = signal(false);

  ranking: any[] = [];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<any>();
  dialog = inject(MatDialog);
  videoUrl: string | null = null;
  currentSong = '';
  savedThisRun = false;
  micEnabled = false;
  micLevel = 0;
  score = 0;
  monitorVolumeCtrl = new FormControl<number>(0.5, { nonNullable: true });
  videoState = '?';
  videoTime = 0;
  cfg!: KaraokeConfig;

  @ViewChild('player', { static: false }) player!: ElementRef<HTMLVideoElement>;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  constructor(
    private audio: AudioService,
    public rankingSvc: RankingService
  ) {}

  configForm = new FormGroup({
    silenceRms: new FormControl(0.015),
    tooLoudRms: new FormControl(0.30),
    clipPeak: new FormControl(0.98),
    maxPtsPerSec: new FormControl(20),
    clipPenaltyPerSec: new FormControl(12),
  });

  resetConfig() {
    this.configForm.setValue({
      silenceRms: 0.015,
      tooLoudRms: 0.30,
      clipPeak: 0.98,
      maxPtsPerSec: 20,
      clipPenaltyPerSec: 12,
    });
  }

  onVideoSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoUrl = URL.createObjectURL(file);
    this.currentSong = file.name;
    this.score = 0;
    this.savedThisRun = false;

    this.enableMic()
  }

  async enableMic() {
    try {
      await this.audio.enableMic();
      this.micEnabled = true;

      this.openSnackBar('🎤 Microfone ativado!', 'OK')
      this.loop();

    } catch (err) {
      console.error(err);
      this.openSnackBar('❌ Não foi possível acessar o microfone', 'Fechar')
    }
  }

  toggleMonitor() {
    this.audio.toggleMonitor(this.monitorVolumeCtrl.value);
  }

  updateMonitorVolume() {
    this.audio.setMonitorVolume(this.monitorVolumeCtrl.value);
  }

  get monitorVolume() {
    return this.monitorVolumeCtrl.value ?? 0;
  }

  onVideoEnded() {
    if (this.savedThisRun) return;
    this.savedThisRun = true;
    this.rankingSvc.addRanking(this.currentSong, this.score);
    this.ranking = this.rankingSvc.loadRanking();

    this.dataSource.data = [...this.ranking];
    this.openDialog(this.score);
  }

  openDialog(score: number): void {
    const dialogRef = this.dialog.open(DialogPontuacao, {
      data: { score: score },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  get micLevelPercent(): number {
    return Math.min(this.micLevel * 300, 100);
  }

  loop() {
    const player = this.player.nativeElement;
    const level = this.audio.readMicLevel();

    if (!level) {
      requestAnimationFrame(this.loop.bind(this));
      return;
    }

    const { rms, peak, dt } = level;

    this.zone.run(() => {
      this.micLevel = rms;
      // console.log(this.micLevel);
    });

    if (!player.paused && !player.ended) {
      if (rms >= this.cfg.silenceRms!) {
        const clipped = peak >= this.cfg.clipPeak!;
        const norm =
          (Math.min(rms, this.cfg.tooLoudRms!) - this.cfg.silenceRms!) /
          (this.cfg.tooLoudRms! - this.cfg.silenceRms!);

        let pts = Math.max(0, norm) * this.cfg.maxPtsPerSec! * dt;
        if (clipped) pts -= this.cfg.clipPenaltyPerSec! * dt;

        this.score = Math.max(0, Math.round(this.score + pts));
      }
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  resetScore() {
    this.score = 0;
    this.openDialog(5);
  }

  clearRanking() {
    this.rankingSvc.clearRanking();
    this.ranking = [];
    this.dataSource.data = [];
  }
}

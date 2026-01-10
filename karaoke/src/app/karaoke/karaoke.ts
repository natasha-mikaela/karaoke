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
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';

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
    MatSortModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './karaoke.html',
  styleUrl: './karaoke.scss',
})

export class Karaoke implements OnInit  {

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
  
 @ViewChild('player', { static: false }) player!: ElementRef<HTMLVideoElement>;
  ranking: any[] = [];
  
  private _liveAnnouncer = inject(LiveAnnouncer);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

dataSource = new MatTableDataSource<any>();

@ViewChild(MatSort) sort!: MatSort;


  ngAfterViewInit() {
  this.dataSource.sort = this.sort;
  }

    /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
 
  readonly panelOpenState = signal(false);

  dialog = inject(MatDialog);
  videoUrl: string | null = null;
  currentSong = '';
  savedThisRun = false;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  micEnabled = false;
  micLevel = 0;
  score = 0;

monitorVolumeCtrl = new FormControl<number>(0.5, { nonNullable: true });

  videoState = '?';
  videoTime = 0;

  cfg!: KaraokeConfig;

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
    await this.audio.enableMic();
    this.micEnabled = true;
    this.loop();
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
    
    this.openDialog(this.score);
  }

  openDialog(score: number): void {
    const dialogRef = this.dialog.open(DialogPontuacao, {
      data: {score: score},
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

  // 🔥 ATUALIZA VISUAL DENTRO DA ZONE
  this.zone.run(() => {
    this.micLevel = rms;
console.log('this.micLevel:', this.micLevel);
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
  }

  clearRanking() {
    this.rankingSvc.clearRanking();
    this.ranking = [];
  }
}

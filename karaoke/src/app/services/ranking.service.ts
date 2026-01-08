import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const STORAGE_CONFIG = 'karaoke_config_v1';
const STORAGE_RANKING = 'karaoke_ranking_v1';

export interface KaraokeConfig {
  silenceRms: number;
  tooLoudRms: number;
  clipPeak: number;
  maxPtsPerSec: number;
  clipPenaltyPerSec: number;
}

export interface RankingEntry {
  music: string;
  score: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class RankingService {

  readonly DEFAULTS: KaraokeConfig = {
    silenceRms: 0.015,
    tooLoudRms: 0.1,
    clipPeak: 0.98,
    maxPtsPerSec: 20,
    clipPenaltyPerSec: 12
  };

  constructor(private storage: StorageService) {}

  loadConfig(): KaraokeConfig {
    try {
      return { ...this.DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_CONFIG)!) };
    } catch {
      return { ...this.DEFAULTS };
    }
  }

  saveConfig(cfg: KaraokeConfig) {
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(cfg));
  }

  loadRanking(): RankingEntry[] {
    // return JSON.parse(localStorage.getItem(STORAGE_RANKING) || '[]');
          return this.storage.get(STORAGE_RANKING, []);
  }

  saveRanking(arr: RankingEntry[]) {
    // localStorage.setItem(STORAGE_RANKING, JSON.stringify(arr));
        this.storage.set(STORAGE_RANKING, arr);
  }

  addRanking(music: string, score: number) {
    const arr = this.loadRanking();
    arr.push({ music, score, date: new Date().toLocaleString() });
    this.saveRanking(arr);
  }

  clearRanking() {
    this.saveRanking([]);
  }
}
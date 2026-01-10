import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-pontuacao',
  imports: [ MatButtonModule, CommonModule],
  templateUrl: './dialog-pontuacao.html',
  styleUrl: './dialog-pontuacao.scss',
})
export class DialogPontuacao {
  data = inject(MAT_DIALOG_DATA);

  get resultType() {
    if (this.data.score >= 800) return 'gato';
    if (this.data.score >= 400) return 'gato-medio';
    if (this.data.score >= 150) return 'gato-pato';
    return 'pato';
  }

  get resultPhrase(): string {
  if (this.data.score >= 800) return 'Parabéns! Você é um gato supremo!';
  if (this.data.score >= 400) return 'Um gato respeitável, miou afinado.';
  if (this.data.score >= 150) return 'Quase virou pato… mas escapou.';
  return 'Quá. Apenas quá.';
}
}

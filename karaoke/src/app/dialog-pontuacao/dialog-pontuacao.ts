import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-dialog-pontuacao',
  imports: [MatDialogTitle, MatDialogContent, MatButtonModule],
  templateUrl: './dialog-pontuacao.html',
  styleUrl: './dialog-pontuacao.scss',
})
export class DialogPontuacao {
  data = inject(MAT_DIALOG_DATA);
}

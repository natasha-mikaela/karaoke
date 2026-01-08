import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { Karaoke } from './karaoke/karaoke'

@Component({
  selector: 'app-root',
  imports: [Karaoke],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('karaoke');
}

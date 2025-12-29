import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.scss'
})
export class StartScreenComponent {
  private router = inject(Router);

  startQuiz() {
    this.router.navigate(['/wizard']);
  }
}

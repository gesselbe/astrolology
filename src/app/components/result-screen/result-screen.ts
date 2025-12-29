import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { QuizService } from '../../services/quiz';

@Component({
  selector: 'app-result-screen',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './result-screen.html',
  styleUrl: './result-screen.scss'
})
export class ResultScreenComponent {
  quizService = inject(QuizService);
  private router = inject(Router);

  restart() {
    this.quizService.restart();
    this.router.navigate(['/']);
  }
}

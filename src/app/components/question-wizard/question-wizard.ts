import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService, Option } from '../../services/quiz';

@Component({
  selector: 'app-question-wizard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-wizard.html',
  styleUrl: './question-wizard.scss'
})
export class QuestionWizardComponent implements OnInit {
  quizService = inject(QuizService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.quizService.isFinished) {
        this.router.navigate(['/result']);
      }
    });
  }

  ngOnInit() {
    this.quizService.loadQuestions();
  }

  selectOption(option: Option) {
    this.quizService.submitAnswer(option.horoscopeFragment);
  }
}

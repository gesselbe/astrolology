import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Option {
  label: string;
  value: string;
  horoscopeFragment: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);

  private questionsSignal = signal<Question[]>([]);
  // Zodiac now only has name
  private zodiacsSignal = signal<{ name: string; horoscopeFragment: string }[]>([]);
  private ascendantsSignal = signal<{ name: string; horoscopeFragment: string }[]>([]);

  // New text block signals
  private startBlocksSignal = signal<string[]>([]);
  private endBlocksSignal = signal<string[]>([]);

  private currentQuestionIndexSignal = signal<number>(0);
  private answersSignal = signal<string[]>([]);

  // Expose signals as readonly
  questions = this.questionsSignal.asReadonly();
  currentQuestionIndex = this.currentQuestionIndexSignal.asReadonly();

  // Randomly selected Zodiac/Ascendant
  private _myZodiac = signal<{ name: string; horoscopeFragment: string } | null>(null);
  private _myAscendant = signal<{ name: string; horoscopeFragment: string } | null>(null);

  myZodiac = this._myZodiac.asReadonly();
  myAscendant = this._myAscendant.asReadonly();

  currentQuestion = computed(() => {
    const questions = this.questionsSignal();
    const index = this.currentQuestionIndexSignal();
    return questions[index] || null;
  });

  isLastQuestion = computed(() => {
    return this.questionsSignal().length > 0 &&
      this.currentQuestionIndexSignal() === this.questionsSignal().length - 1;
  });

  // Deterministically calculate which blocks to use
  private answerHash = computed(() => {
    const blob = this.answersSignal().join('');
    let hash = 0;
    for (let i = 0; i < blob.length; i++) {
      const char = blob.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  });

  horoscope = computed(() => {
    const startBlocks = this.startBlocksSignal();
    const endBlocks = this.endBlocksSignal();
    const hash = this.answerHash();
    const zodiac = this.myZodiac();
    const ascendant = this.myAscendant();

    // Avoid empty state errors
    if (startBlocks.length === 0 || endBlocks.length === 0) {
      return this.answersSignal().join(' ');
    }

    // Select blocks deterministically using modulo of hash
    const start = startBlocks[hash % startBlocks.length];
    const end = endBlocks[(hash >> 4) % endBlocks.length];

    // Concatenate answer fragments
    const body = this.answersSignal().join(' ');

    // Add Zodiac and Ascendant fragments
    const zodiacFragment = zodiac ? zodiac.horoscopeFragment : '';
    const ascendantFragment = ascendant ? ascendant.horoscopeFragment : '';

    return `${start}\n${zodiacFragment} ${ascendantFragment}\n\n${body}\n\n${end}`;
  });



  constructor() { }

  async loadQuestions() {
    try {
      const data = await firstValueFrom(this.http.get<{
        questions: Question[],
        zodiacs: { name: string; horoscopeFragment: string }[],
        ascendants: { name: string; horoscopeFragment: string }[],
        startBlocks: string[],
        endBlocks: string[]
      }>('assets/questions.json'));

      this.questionsSignal.set(data.questions);
      this.zodiacsSignal.set(data.zodiacs);
      this.ascendantsSignal.set(data.ascendants);
      this.startBlocksSignal.set(data.startBlocks || []);
      this.endBlocksSignal.set(data.endBlocks || []);

      this.currentQuestionIndexSignal.set(0);
      this.answersSignal.set([]);
      this.randomizeFate();
    } catch (error) {
      console.error('Failed to load questions', error);
    }
  }

  submitAnswer(fragment: string) {
    this.answersSignal.update(answers => [...answers, fragment]);
    this.nextQuestion();
  }

  private nextQuestion() {
    if (this.currentQuestionIndexSignal() < this.questionsSignal().length) {
      this.currentQuestionIndexSignal.update(i => i + 1);
    }
  }

  restart() {
    this.currentQuestionIndexSignal.set(0);
    this.answersSignal.set([]);
    this.randomizeFate();
  }

  private randomizeFate() {
    const zodiacs = this.zodiacsSignal();
    const ascendants = this.ascendantsSignal();

    if (zodiacs.length > 0) {
      this._myZodiac.set(zodiacs[Math.floor(Math.random() * zodiacs.length)]);
    }

    if (ascendants.length > 0) {
      this._myAscendant.set(ascendants[Math.floor(Math.random() * ascendants.length)]);
    }
  }

  get isFinished() {
    return this.currentQuestionIndexSignal() >= this.questionsSignal().length && this.questionsSignal().length > 0;
  }
}

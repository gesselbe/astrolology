import { Routes } from '@angular/router';
import { StartScreenComponent } from './components/start-screen/start-screen';
import { QuestionWizardComponent } from './components/question-wizard/question-wizard';
import { ResultScreenComponent } from './components/result-screen/result-screen';

export const routes: Routes = [
    { path: '', component: StartScreenComponent },
    { path: 'wizard', component: QuestionWizardComponent },
    { path: 'result', component: ResultScreenComponent },
    { path: '**', redirectTo: '' }
];

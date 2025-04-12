import { Routes } from '@angular/router';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { MovieCardComponent } from './components/movie-card/movie-card.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'movies', component: MovieCardComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' }
];

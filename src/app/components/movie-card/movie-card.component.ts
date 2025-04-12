import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { Movie } from '../../models/movie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {
  movies: Movie[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only check localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('MovieCardComponent - Token check:', {
        token: token ? 'Present' : 'Missing',
        tokenValue: token,
        hasBearer: token?.startsWith('Bearer '),
        length: token?.length,
        firstChars: token ? token.substring(0, 20) + '...' : 'N/A'
      });
      
      if (!token) {
        console.log('No token found, redirecting to welcome page');
        this.router.navigate(['/welcome']);
        return;
      }
      this.getMovies();
    }
  }

  getMovies(): void {
    this.isLoading = true;
    this.error = null;
    
    if (isPlatformBrowser(this.platformId)) {
      console.log('Fetching movies with token:', localStorage.getItem('token'));
    }
    
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movies = movies;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching movies:', error);
      }
    });
  }
}

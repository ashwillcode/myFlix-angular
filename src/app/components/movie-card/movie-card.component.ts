import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { Movie } from '../../models/movie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {
  movies: Movie[] = [];
  isLoading = false;
  error: string | null = null;
  favoriteMovies: string[] = [];

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private dialog: MatDialog,
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
      this.getFavoriteMovies();
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

  getFavoriteMovies(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchApiData.getUser().subscribe({
        next: (user) => {
          this.favoriteMovies = user.FavoriteMovies || [];
        },
        error: (error) => {
          console.error('Error fetching favorite movies:', error);
        }
      });
    }
  }

  toggleFavorite(movieId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const isFavorite = this.favoriteMovies.includes(movieId);
      if (isFavorite) {
        this.fetchApiData.removeFavoriteMovie(movieId).subscribe({
          next: () => {
            this.favoriteMovies = this.favoriteMovies.filter(id => id !== movieId);
          },
          error: (error) => {
            console.error('Error removing favorite movie:', error);
          }
        });
      } else {
        this.fetchApiData.addFavoriteMovie(movieId).subscribe({
          next: () => {
            this.favoriteMovies.push(movieId);
          },
          error: (error) => {
            console.error('Error adding favorite movie:', error);
          }
        });
      }
    }
  }

  openGenreDialog(genre: any): void {
    // TODO: Implement genre dialog
  }

  openDirectorDialog(director: any): void {
    // TODO: Implement director dialog
  }

  openSynopsisDialog(movie: Movie): void {
    // TODO: Implement synopsis dialog
  }
}

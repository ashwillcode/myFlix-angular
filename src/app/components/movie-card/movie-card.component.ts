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
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (!token) {
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
    
    this.fetchApiData.getAllMovies().subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);
        
        if (Array.isArray(response)) {
          this.movies = response.map(movie => {
            console.log('Processing movie:', movie);
            return {
              _id: movie._id,
              Title: movie.Title || movie.title,
              Description: movie.Description || movie.description,
              Genre: {
                Name: (movie.Genre && movie.Genre.Name) || (movie.genre && movie.genre.name) || 'Unknown Genre',
                Description: (movie.Genre && movie.Genre.Description) || (movie.genre && movie.genre.description) || ''
              },
              Director: {
                Name: (movie.Director && movie.Director.Name) || (movie.director && movie.director.name) || 'Unknown Director',
                Bio: (movie.Director && movie.Director.Bio) || (movie.director && movie.director.bio) || '',
                Birth: (movie.Director && movie.Director.Birth) || (movie.director && movie.director.birth) || null
              },
              ImagePath: movie.ImagePath || movie.imagePath,
              Featured: movie.Featured || movie.featured || false
            };
          });
          console.log('Processed movies:', this.movies);
        } else {
          console.error('Unexpected API response format:', response);
          this.error = 'Unexpected data format received from server';
        }
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
          console.log('User response:', user);
          this.favoriteMovies = user.FavoriteMovies || [];
          console.log('Favorite movies:', this.favoriteMovies);
        },
        error: (error) => {
          console.error('Error fetching favorite movies:', error);
        }
      });
    }
  }

  toggleFavorite(movieId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isFavorite = this.favoriteMovies.includes(movieId);
    const action = isFavorite ? 
      this.fetchApiData.removeFavoriteMovie(movieId) : 
      this.fetchApiData.addFavoriteMovie(movieId);

    action.subscribe({
      next: (response) => {
        if (isFavorite) {
          this.favoriteMovies = this.favoriteMovies.filter(id => id !== movieId);
        } else {
          this.favoriteMovies.push(movieId);
        }
      },
      error: (error) => {
        console.error(`Error ${isFavorite ? 'removing from' : 'adding to'} favorites:`, error);
      }
    });
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

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
            
            // Log image path properties to debug
            console.log('Image path properties:', {
              ImagePath: movie.ImagePath,
              imagepath: movie.imagepath,
              imagePath: movie.imagePath,
              allProps: Object.keys(movie).filter(key => key.toLowerCase().includes('image'))
            });
            
            const processedMovie = {
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
              ImagePath: movie.ImagePath || movie.imagepath || movie.imagePath || '',
              Featured: movie.Featured || movie.featured || false
            };
            
            console.log('Processed movie image path:', processedMovie.ImagePath);
            
            return processedMovie;
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

    console.log('MovieCardComponent - toggleFavorite called with movieId:', movieId);
    
    // Ensure movieId is a string and not empty
    if (!movieId || typeof movieId !== 'string') {
      console.error('MovieCardComponent - Invalid movieId:', movieId);
      return;
    }
    
    const isFavorite = this.favoriteMovies.includes(movieId);
    console.log(`MovieCardComponent - Movie ${movieId} is ${isFavorite ? 'already' : 'not'} a favorite`);
    
    const action = isFavorite ? 
      this.fetchApiData.removeFavoriteMovie(movieId) : 
      this.fetchApiData.addFavoriteMovie(movieId);

    action.subscribe({
      next: (response) => {
        console.log('MovieCardComponent - Toggle favorite response:', response);
        if (isFavorite) {
          this.favoriteMovies = this.favoriteMovies.filter(id => id !== movieId);
        } else {
          this.favoriteMovies.push(movieId);
        }
      },
      error: (error) => {
        console.error(`MovieCardComponent - Error ${isFavorite ? 'removing from' : 'adding to'} favorites:`, error);
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

  onImageError(event: Event, movie: Movie): void {
    console.error('Image failed to load:', {
      movieId: movie._id,
      movieTitle: movie.Title,
      imagePath: movie.ImagePath,
      event: event
    });
    
    // Set a fallback image
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholder.jpg';
  }
}

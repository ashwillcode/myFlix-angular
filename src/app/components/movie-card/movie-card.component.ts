import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { Movie } from '../../models/movie';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog.component';
import { DirectorDialogComponent } from '../director-dialog/director-dialog.component';
import { SynopsisDialogComponent } from '../synopsis-dialog/synopsis-dialog.component';

/**
 * Component responsible for displaying movie cards in a grid layout
 * @class MovieCardComponent
 * @description Handles the display and interaction of movie cards, including
 * favorite toggling, opening dialogs for additional information, and error handling
 */
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
  /** Array of movies to display */
  movies: Movie[] = [];
  /** Loading state indicator */
  isLoading = false;
  /** Error message if any */
  error: string | null = null;
  /** Array of favorite movie IDs */
  favoriteMovies: string[] = [];

  /**
   * Creates an instance of MovieCardComponent
   * @param fetchApiData - Service for API calls
   * @param router - Angular router service
   * @param dialog - Material dialog service
   * @param snackBar - Material snackbar service
   * @param platformId - Platform identifier for browser/server detection
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Lifecycle hook that is called after component initialization
   * Checks for authentication and loads movies and favorites
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check for authentication token before proceeding
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to welcome page if not authenticated
        this.router.navigate(['/welcome']);
        return;
      }
      // Load initial data
      this.getMovies();
      this.getFavoriteMovies();
    }
  }

  /**
   * Fetches all movies from the API and processes them for display
   * Handles error cases and data normalization
   */
  getMovies(): void {
    this.isLoading = true;
    this.error = null;
    
    this.fetchApiData.getAllMovies().subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);
        
        if (Array.isArray(response)) {
          this.movies = response.map(movie => {
            // Debug logging for movie ID format
            console.log('Movie ID format:', {
              _id: movie._id,
              id: movie.id,
              _idType: typeof movie._id,
              idType: typeof movie.id,
              _idLength: movie._id ? movie._id.length : 0,
              idLength: movie.id ? movie.id.length : 0,
              _idFirstChars: movie._id ? movie._id.substring(0, 10) + '...' : 'N/A',
              idFirstChars: movie.id ? movie.id.substring(0, 10) + '...' : 'N/A'
            });
            
            // Debug logging for image paths
            console.log('Image path properties:', {
              ImagePath: movie.ImagePath,
              imagepath: movie.imagepath,
              imagePath: movie.imagePath,
              allProps: Object.keys(movie).filter(key => key.toLowerCase().includes('image'))
            });
            
            // Handle different possible ID field names
            const movieId = movie._id || movie.id;
            
            // Ensure movie has a valid ID
            if (!movieId) {
              console.error('Movie missing both _id and id properties:', movie);
              // Generate temporary ID as fallback
              movie._id = 'temp_' + Math.random().toString(36).substring(2, 9);
            } else if (!movie._id && movie.id) {
              // Normalize ID field
              movie._id = movie.id;
            }
            
            // Normalize movie data structure to handle API inconsistencies
            const processedMovie = {
              _id: movie._id,
              id: movie.id,
              Title: movie.Title || movie.title, // Handle case variations
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
            
            return processedMovie;
          });
        } else {
          // Handle invalid API response format
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

  /**
   * Retrieves the user's favorite movies from the API
   * Updates the favoriteMovies array with the response
   */
  getFavoriteMovies(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchApiData.getUser().subscribe({
        next: (user) => {
          // Handle different possible property names for favorites
          this.favoriteMovies = user.FavoriteMovies || user.favoriteMovies || [];
          console.log('Favorite movies:', this.favoriteMovies);
        },
        error: (error) => {
          console.error('Error fetching favorite movies:', error);
        }
      });
    }
  }

  /**
   * Toggles a movie's favorite status
   * @param movieId - ID of the movie to toggle
   */
  toggleFavorite(movieId: string): void {
    // Input validation
    if (!movieId || typeof movieId !== 'string') {
      console.error('Invalid movieId:', movieId);
      return;
    }
    
    // Debug logging
    console.log('Movie ID format:', {
      movieId,
      movieIdType: typeof movieId,
      movieIdLength: movieId.length,
      movieIdFirstChars: movieId.substring(0, 10) + '...'
    });
    
    // Verify movie exists in the loaded movies
    const movie = this.movies.find(m => m._id === movieId);
    if (!movie) {
      // Try fallback to id property
      const movieById = this.movies.find(m => m.id === movieId);
      if (movieById) {
        movieId = movieById._id;
      } else {
        console.error('Movie not found:', movieId);
        return;
      }
    }
    
    // Check current favorite status
    const isFavorite = this.favoriteMovies.includes(movieId);
    
    if (isFavorite) {
      // Remove from favorites
      this.fetchApiData.removeFavoriteMovie(movieId).subscribe({
        next: (response) => {
          // Update local state
          this.favoriteMovies = this.favoriteMovies.filter(id => id !== movieId);
          this.snackBar.open('Movie removed from favorites', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this.snackBar.open('Error removing movie from favorites', 'OK', {
            duration: 2000
          });
        }
      });
    } else {
      // Add to favorites
      this.fetchApiData.addFavoriteMovie(movieId).subscribe({
        next: (response) => {
          // Update local state
          this.favoriteMovies.push(movieId);
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error adding favorite:', error);
          this.snackBar.open('Error adding movie to favorites', 'OK', {
            duration: 2000
          });
        }
      });
    }
  }

  /**
   * Opens a dialog displaying genre information
   * @param genre - Genre object containing details to display
   */
  openGenreDialog(genre: any): void {
    this.dialog.open(GenreDialogComponent, {
      data: genre,
      width: '400px'
    });
  }

  /**
   * Opens a dialog displaying director information
   * @param director - Director object containing details to display
   */
  openDirectorDialog(director: any): void {
    this.dialog.open(DirectorDialogComponent, {
      data: director,
      width: '400px'
    });
  }

  /**
   * Opens a dialog displaying movie synopsis
   * @param movie - Movie object containing synopsis to display
   */
  openSynopsisDialog(movie: Movie): void {
    this.dialog.open(SynopsisDialogComponent, {
      data: movie,
      width: '400px'
    });
  }

  /**
   * Handles image loading errors by setting a fallback image
   * @param event - The error event from the image
   * @param movie - The movie object whose image failed to load
   */
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

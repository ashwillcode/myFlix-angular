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
    private snackBar: MatSnackBar,
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
            
            // Log the exact format of the movie ID
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
            
            // Log image path properties to debug
            console.log('Image path properties:', {
              ImagePath: movie.ImagePath,
              imagepath: movie.imagepath,
              imagePath: movie.imagePath,
              allProps: Object.keys(movie).filter(key => key.toLowerCase().includes('image'))
            });
            
            // Use the id property if _id is not available
            const movieId = movie._id || movie.id;
            
            // Ensure movieId exists and is valid
            if (!movieId) {
              console.error('Movie missing both _id and id properties:', movie);
              // Generate a temporary ID if none exists (this should be rare)
              movie._id = 'temp_' + Math.random().toString(36).substring(2, 9);
            } else if (!movie._id && movie.id) {
              // If we have id but not _id, set _id to id
              movie._id = movie.id;
            }
            
            const processedMovie = {
              _id: movie._id,
              id: movie.id,
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
            
            console.log('Processed movie:', processedMovie);
            
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
          // Handle both FavoriteMovies and favoriteMovies properties
          this.favoriteMovies = user.FavoriteMovies || user.favoriteMovies || [];
          console.log('Favorite movies:', this.favoriteMovies);
        },
        error: (error) => {
          console.error('Error fetching favorite movies:', error);
        }
      });
    }
  }

  toggleFavorite(movieId: string): void {
    console.log('MovieCardComponent - toggleFavorite called with movieId:', movieId);
    
    // Ensure movieId is a string and not empty
    if (!movieId || typeof movieId !== 'string') {
      console.error('MovieCardComponent - Invalid movieId:', movieId);
      return;
    }
    
    // Log the exact format of the movie ID
    console.log('MovieCardComponent - Movie ID format:', {
      movieId,
      movieIdType: typeof movieId,
      movieIdLength: movieId.length,
      movieIdFirstChars: movieId.substring(0, 10) + '...'
    });
    
    // Find the movie in the movies array to ensure it exists
    const movie = this.movies.find(m => m._id === movieId);
    if (!movie) {
      console.error('MovieCardComponent - Movie not found with _id:', movieId);
      // Try to find by id property as a fallback
      const movieById = this.movies.find(m => m.id === movieId);
      if (movieById) {
        console.log('MovieCardComponent - Found movie by id property:', movieById);
        // Update the movieId to use the _id property
        movieId = movieById._id;
      } else {
        console.error('MovieCardComponent - Movie not found with either _id or id:', movieId);
        return;
      }
    }
    
    // Check if the movie is already a favorite
    const isFavorite = this.favoriteMovies.includes(movieId);
    console.log('MovieCardComponent - Is favorite:', isFavorite);
    
    if (isFavorite) {
      // Remove from favorites
      this.fetchApiData.removeFavoriteMovie(movieId).subscribe({
        next: (response) => {
          console.log('MovieCardComponent - Remove favorite response:', response);
          this.favoriteMovies = this.favoriteMovies.filter(id => id !== movieId);
          this.snackBar.open('Movie removed from favorites', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('MovieCardComponent - Error removing favorite:', error);
          this.snackBar.open('Error removing movie from favorites', 'OK', {
            duration: 2000
          });
        }
      });
    } else {
      // Add to favorites
      this.fetchApiData.addFavoriteMovie(movieId).subscribe({
        next: (response) => {
          console.log('MovieCardComponent - Add favorite response:', response);
          this.favoriteMovies.push(movieId);
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('MovieCardComponent - Error adding favorite:', error);
          this.snackBar.open('Error adding movie to favorites', 'OK', {
            duration: 2000
          });
        }
      });
    }
  }

  openGenreDialog(genre: any): void {
    this.dialog.open(GenreDialogComponent, {
      data: genre,
      width: '400px'
    });
  }

  openDirectorDialog(director: any): void {
    this.dialog.open(DirectorDialogComponent, {
      data: director,
      width: '400px'
    });
  }

  openSynopsisDialog(movie: Movie): void {
    this.dialog.open(SynopsisDialogComponent, {
      data: movie,
      width: '400px'
    });
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

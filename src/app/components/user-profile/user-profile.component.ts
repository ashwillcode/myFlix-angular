import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Component for managing user profile information
 * @class UserProfileComponent
 * @description Handles user profile display, editing, and deletion.
 * Also manages the user's favorite movies list.
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  /** Form group for user profile editing */
  userForm: FormGroup;
  /** Current user data */
  user: any = {};
  /** List of user's favorite movies with details */
  favoriteMovies: any[] = [];
  /** Loading state indicator */
  isLoading = false;
  /** Edit mode toggle */
  isEditing = false;

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize form with validation
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: [null]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Load user data if in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.getUser();
    }
  }

  getUser(): void {
    this.isLoading = true;
    
    // Verify authentication status
    if (isPlatformBrowser(this.platformId)) {
      const username = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!username || !token) {
        // Redirect to welcome page if not authenticated
        this.router.navigate(['/welcome']);
        return;
      }
    }
    
    this.fetchApiData.getUser().subscribe({
      next: (user) => {
        // Normalize date fields to handle API inconsistencies
        const birthDate = user.Birthday || user.birthday || user.BirthDate || user.birthDate;
        
        // Normalize user data structure
        this.user = {
          username: user.Username || user.username,
          email: user.Email || user.email,
          birthDate: birthDate ? this.parseDateNoTimezone(birthDate) : null,
          favoriteMovies: user.FavoriteMovies || user.favoriteMovies || []
        };
        
        // Update form with current user data
        this.userForm.patchValue({
          username: this.user.username,
          email: this.user.email,
          birthDate: this.user.birthDate,
          password: '',
          confirmPassword: ''
        });
        
        this.isLoading = false;
        // Load favorite movies after user data is set
        this.getFavoriteMovies();
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.isLoading = false;
        
        // Handle authentication errors
        if (error.status === 401 || error.status === 404) {
          this.router.navigate(['/welcome']);
        }
      }
    });
  }

  getFavoriteMovies(): void {
    // Fetch all movies and filter to user's favorites
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies) => {
        // Filter and normalize movie data
        this.favoriteMovies = movies.filter((movie: any) => {
          const movieId = movie.id;
          return this.user.favoriteMovies?.includes(movieId);
        }).map((movie: any) => ({
          // Normalize movie data structure
          _id: movie.id,
          Title: movie.Title || movie.title,
          Description: movie.Description || movie.description,
          ImagePath: movie.ImagePath || movie.imagepath || movie.imagePath || '',
          Genre: {
            Name: (movie.Genre && movie.Genre.Name) || (movie.genre && movie.genre.name) || 'Unknown Genre',
            Description: (movie.Genre && movie.Genre.Description) || (movie.genre && movie.genre.description) || ''
          },
          Director: {
            Name: (movie.Director && movie.Director.Name) || (movie.director && movie.director.name) || 'Unknown Director',
            Bio: (movie.Director && movie.Director.Bio) || (movie.director && movie.director.bio) || '',
            Birth: (movie.Director && movie.Director.Birth) || (movie.director && movie.director.birth) || null
          },
          Featured: movie.Featured || movie.featured || false
        }));
      },
      error: (error) => {
        console.error('Error fetching favorite movies:', error);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to current user data when canceling edit
      this.userForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        birthDate: this.user.birthDate,
        password: '',
        confirmPassword: ''
      });
    }
  }

  updateUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      
      // Prepare update data object
      const userData: any = {
        username: this.userForm.get('username')?.value || this.user.username,
        email: this.userForm.get('email')?.value || this.user.email,
      };

      // Add optional fields if provided
      const password = this.userForm.get('password')?.value;
      const birthDate = this.userForm.get('birthDate')?.value;

      if (password) {
        userData.password = password;
      }

      if (birthDate) {
        // Normalize date to avoid timezone issues
        const dateToUse = new Date(birthDate);
        dateToUse.setHours(12, 0, 0, 0);
        userData.birthDate = this.formatDateForAPI(dateToUse);
      }

      // Send update request
      this.fetchApiData.editUser(userData).subscribe({
        next: (response) => {
          this.snackBar.open('Profile updated successfully!', 'OK', {
            duration: 2000
          });
          this.isLoading = false;
          this.isEditing = false;
          // Reload user data to reflect changes
          this.getUser();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open(error, 'OK', {
            duration: 2000
          });
          this.isLoading = false;
        }
      });
    }
  }

  deleteUser(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.isLoading = true;
      this.fetchApiData.deleteUser().subscribe({
        next: () => {
          this.isLoading = false;
          // Clear local storage and redirect after successful deletion
          localStorage.clear();
          this.router.navigate(['/welcome']);
          this.snackBar.open('Account deleted successfully', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.isLoading = false;
          this.snackBar.open('Error deleting account', 'OK', {
            duration: 2000
          });
        }
      });
    }
  }

  onRemoveFavorite(movieId: string): void {
    this.fetchApiData.removeFavoriteMovie(movieId).subscribe({
      next: (response) => {
        this.snackBar.open('Movie removed from favorites', 'OK', {
          duration: 2000
        });
        // Update local state to reflect changes
        this.user.favoriteMovies = this.user.favoriteMovies.filter(
          (id: string) => id !== movieId
        );
        this.favoriteMovies = this.favoriteMovies.filter(
          (movie) => movie._id !== movieId
        );
      },
      error: (error) => {
        console.error('Error removing favorite:', error);
        this.snackBar.open('Error removing movie from favorites', 'OK', {
          duration: 2000
        });
      }
    });
  }

  /**
   * Custom validator to ensure password and confirm password match
   */
  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  /**
   * Parse date string without timezone conversion
   */
  private parseDateNoTimezone(dateStr: string): Date {
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  /**
   * Format date for API submission
   */
  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

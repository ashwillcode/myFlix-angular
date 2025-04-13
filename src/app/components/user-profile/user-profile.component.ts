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
  userForm: FormGroup;
  user: any = {};
  favoriteMovies: any[] = [];
  isLoading = false;
  isEditing = false;

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: [null]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getUser();
    }
  }

  getUser(): void {
    this.isLoading = true;
    
    // Check if user is stored in localStorage
    if (isPlatformBrowser(this.platformId)) {
      const username = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!username || !token) {
        this.router.navigate(['/welcome']);
        return;
      }
    }
    
    this.fetchApiData.getUser().subscribe({
      next: (user) => {
        // Normalize the user data
        const birthDate = user.Birthday || user.birthday || user.BirthDate || user.birthDate;
        
        this.user = {
          username: user.Username || user.username,
          email: user.Email || user.email,
          birthDate: birthDate ? this.parseDateNoTimezone(birthDate) : null,
          favoriteMovies: user.FavoriteMovies || user.favoriteMovies || []
        };
        
        // Update the form with normalized user data
        this.userForm.patchValue({
          username: this.user.username,
          email: this.user.email,
          birthDate: this.user.birthDate,
          password: '',
          confirmPassword: ''
        });
        
        this.isLoading = false;
        this.getFavoriteMovies();
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.isLoading = false;
        
        if (error.status === 401 || error.status === 404) {
          this.router.navigate(['/welcome']);
        }
      }
    });
  }

  getFavoriteMovies(): void {
    console.log('UserProfileComponent - getFavoriteMovies called');
    console.log('User data:', this.user);
    console.log('User favorite movies array:', this.user.favoriteMovies);
    
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies) => {
        console.log('All movies from API:', movies);
        console.log('First movie structure:', movies[0]);
        
        // Handle case sensitivity issues with movie properties
        this.favoriteMovies = movies.filter((movie: any) => {
          const movieId = movie.id;
          const isFavorite = this.user.favoriteMovies?.includes(movieId);
          console.log(`Movie ${movieId} (${movie.Title || movie.title}): ${isFavorite ? 'Favorite' : 'Not favorite'}`);
          return isFavorite;
        }).map((movie: any) => ({
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
        
        console.log('Filtered favorite movies:', this.favoriteMovies);
      },
      error: (error) => {
        console.error('UserProfileComponent - Error fetching favorite movies:', error);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
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
      
      // Create data object with all required fields
      const userData: any = {
        username: this.userForm.get('username')?.value || this.user.username,
        email: this.userForm.get('email')?.value || this.user.email,
      };

      // Add optional fields if they have values
      const password = this.userForm.get('password')?.value;
      const birthDate = this.userForm.get('birthDate')?.value;

      if (password) {
        userData.password = password;
      }

      if (birthDate) {
        // Set time to noon to avoid timezone issues
        const dateToUse = new Date(birthDate);
        dateToUse.setHours(12, 0, 0, 0);
        userData.birthDate = this.formatDateForAPI(dateToUse);
      }

      console.log('Sending update data:', userData);

      this.fetchApiData.editUser(userData).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.snackBar.open('Profile updated successfully!', 'OK', {
            duration: 2000
          });
          this.isLoading = false;
          this.isEditing = false;
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
        // Update the user's favorite movies
        this.user.favoriteMovies = this.user.favoriteMovies.filter(
          (id: string) => id !== movieId
        );
        // Update the displayed favorite movies
        this.favoriteMovies = this.favoriteMovies.filter(
          (movie) => movie._id !== movieId
        );
      },
      error: (error) => {
        console.error('Error removing movie from favorites:', error);
        this.snackBar.open('Error removing movie from favorites', 'OK', {
          duration: 2000
        });
      }
    });
  }

  // Password match validator
  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  // Helper method to parse date without timezone offset
  private parseDateNoTimezone(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  // Helper method to format date for API
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

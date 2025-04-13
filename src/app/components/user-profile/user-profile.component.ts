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
      Username: ['', [Validators.required]],
      Password: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Birthday: [null]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getUser();
    }
  }

  getUser(): void {
    this.isLoading = true;
    console.log('UserProfileComponent - getUser called');
    
    // Check if user is stored in localStorage
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log('UserProfileComponent - localStorage check:', {
        storedUser,
        storedToken: storedToken ? 'Present' : 'Missing',
        tokenLength: storedToken ? storedToken.length : 0
      });
    }
    
    this.fetchApiData.getUser().subscribe({
      next: (user) => {
        console.log('UserProfileComponent - getUser response:', user);
        
        // Handle case sensitivity issues
        this.user = {
          Username: user.Username || user.username,
          Email: user.Email || user.email,
          Birthday: user.Birthday || user.birthday || user.BirthDate || user.birthDate,
          FavoriteMovies: user.FavoriteMovies || user.favoriteMovies || user.favoritemovies || []
        };
        
        // Check if user has the expected properties
        console.log('UserProfileComponent - User properties:', {
          hasUsername: 'Username' in this.user,
          hasEmail: 'Email' in this.user,
          hasBirthday: 'Birthday' in this.user,
          hasFavoriteMovies: 'FavoriteMovies' in this.user,
          allProps: Object.keys(this.user)
        });
        
        this.userForm.patchValue({
          Username: this.user.Username,
          Email: this.user.Email,
          Birthday: this.user.Birthday ? new Date(this.user.Birthday) : null
        });
        this.getFavoriteMovies();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('UserProfileComponent - Error fetching user:', error);
        this.isLoading = false;
        this.snackBar.open('Error fetching user data: ' + (error.message || 'Unknown error'), 'OK', {
          duration: 5000
        });
      }
    });
  }

  getFavoriteMovies(): void {
    console.log('UserProfileComponent - getFavoriteMovies called');
    console.log('UserProfileComponent - FavoriteMovies:', this.user.FavoriteMovies);
    
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies) => {
        console.log('UserProfileComponent - getAllMovies response:', movies);
        
        // Handle case sensitivity issues with movie properties
        this.favoriteMovies = movies.filter((movie: any) => {
          const movieId = movie._id;
          const isFavorite = this.user.FavoriteMovies?.includes(movieId);
          console.log(`Movie ${movieId} (${movie.Title || movie.title}): ${isFavorite ? 'Favorite' : 'Not favorite'}`);
          return isFavorite;
        }).map((movie: any) => ({
          _id: movie._id,
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
        
        console.log('UserProfileComponent - Processed favorite movies:', this.favoriteMovies);
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
        Username: this.user.Username,
        Email: this.user.Email,
        Birthday: this.user.Birthday ? new Date(this.user.Birthday) : null
      });
    }
  }

  updateUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.fetchApiData.editUser(this.userForm.value).subscribe({
        next: (result) => {
          this.user = result;
          this.isEditing = false;
          this.isLoading = false;
          this.snackBar.open('Profile updated successfully', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isLoading = false;
          this.snackBar.open('Error updating profile', 'OK', {
            duration: 2000
          });
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
}

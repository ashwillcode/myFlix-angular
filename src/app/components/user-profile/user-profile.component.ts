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
    this.fetchApiData.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.userForm.patchValue({
          Username: user.Username,
          Email: user.Email,
          Birthday: user.Birthday ? new Date(user.Birthday) : null
        });
        this.getFavoriteMovies();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.isLoading = false;
        this.snackBar.open('Error fetching user data', 'OK', {
          duration: 2000
        });
      }
    });
  }

  getFavoriteMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies) => {
        this.favoriteMovies = movies.filter((movie: any) => 
          this.user.FavoriteMovies?.includes(movie._id)
        );
      },
      error: (error) => {
        console.error('Error fetching favorite movies:', error);
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

import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<LoginComponent>,
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Logs in the user and stores the token
   */
  login(): void {
    if (this.loginForm.valid) {
      console.log('Login attempt with:', this.loginForm.value);
      this.fetchApiData.userLogin(this.loginForm.value).subscribe({
        next: (result) => {
          console.log('Login response:', result);
          
          if (isPlatformBrowser(this.platformId)) {
            // Check if token exists in response
            if (!result.token) {
              console.error('No token received in login response');
              this.snackBar.open('Login failed: No token received', 'OK', {
                duration: 2000
              });
              return;
            }
            
            // Store username from the login form
            localStorage.setItem('user', this.loginForm.value.username);
            
            // Ensure token has Bearer prefix
            let token = result.token;
            if (!token.startsWith('Bearer ')) {
              token = `Bearer ${token}`;
            }
            
            // Store the token
            localStorage.setItem('token', token);
            
            console.log('Login successful - Token stored:', {
              token: token.substring(0, 20) + '...',
              hasBearer: token.startsWith('Bearer '),
              length: token.length
            });
            
            // Close the dialog and navigate to movies
            this.dialogRef.close(true);
            this.router.navigate(['/movies']);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.snackBar.open(
            error.error?.message || 'Login failed. Please try again.',
            'OK',
            { duration: 2000 }
          );
        }
      });
    }
  }

  /**
   * Closes the login dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }
}

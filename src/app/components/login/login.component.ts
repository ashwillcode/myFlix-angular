import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
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
    private dialogRef: MatDialogRef<LoginComponent>,
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      Username: ['', [Validators.required]],
      Password: ['', [Validators.required]]
    });
  }

  /**
   * Logs in the user and stores the token
   */
  login(): void {
    if (this.loginForm.valid) {
      this.fetchApiData.userLogin(this.loginForm.value).subscribe({
        next: (result) => {
          // Store user and token in localStorage
          localStorage.setItem('user', result.user.Username);
          localStorage.setItem('token', result.token);
          
          this.dialogRef.close();
          this.snackBar.open('Login successful', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          this.snackBar.open(error, 'OK', {
            duration: 2000
          });
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

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FetchApiDataService } from '../../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<RegistrationComponent>,
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.registrationForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      birthDate: [''] // Optional in API
    });
  }

  /**
   * Registers a new user
   */
  registerUser(): void {
    if (this.registrationForm.valid) {
      const formData = {...this.registrationForm.value};
      
      // Remove birthDate if it's empty or null
      if (!formData.birthDate) {
        delete formData.birthDate;
      } else {
        // Convert birthDate to ISO format YYYY-MM-DD if it exists
        const date = new Date(formData.birthDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formData.birthDate = `${year}-${month}-${day}`;
      }
      
      console.log('Sending registration data:', formData); // Add this to see what's being sent
      
      this.fetchApiData.userRegistration(formData).subscribe({
        next: (result) => {
          this.dialogRef.close();
          this.snackBar.open('User registration successful', 'OK', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.snackBar.open(error.message || 'Registration failed', 'OK', {
            duration: 2000
          });
        }
      });
    }
  }

  /**
   * Closes the registration dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }
}

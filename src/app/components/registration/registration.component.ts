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

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
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
      Username: ['', [Validators.required, Validators.minLength(3)]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
      Email: ['', [Validators.required, Validators.email]],
      Birthday: ['', Validators.required]
    });
  }

  /**
   * Registers a new user
   */
  registerUser(): void {
    if (this.registrationForm.valid) {
      this.fetchApiData.userRegistration(this.registrationForm.value).subscribe({
        next: (result) => {
          this.dialogRef.close();
          this.snackBar.open('User registration successful', 'OK', {
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
   * Closes the registration dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }
}

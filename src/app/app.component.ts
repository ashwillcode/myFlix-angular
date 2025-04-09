import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    RegistrationComponent,
    LoginComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'myFlix-Angular-client';

  constructor(private dialog: MatDialog) { }

  /**
   * Opens the registration dialog
   */
  openRegistrationDialog(): void {
    this.dialog.open(RegistrationComponent, {
      width: '400px'
    });
  }

  /**
   * Opens the login dialog
   */
  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      width: '400px'
    });
  }
}

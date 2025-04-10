import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { RegistrationComponent } from '../registration/registration.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class WelcomePageComponent {
  constructor(
    public dialog: MatDialog,
    private router: Router
  ) { }

  openUserRegistrationDialog(): void {
    this.dialog.open(RegistrationComponent, {
      width: '400px'
    });
  }

  openUserLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Login successful, but navigation to movies page has been removed');
      }
    });
  }
} 
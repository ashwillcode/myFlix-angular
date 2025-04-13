import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Movie } from '../../models/movie';

@Component({
  selector: 'app-synopsis-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.Title }}</h2>
    <mat-dialog-content>
      <p>{{ data.Description }}</p>
      <div class="movie-details">
        <p><strong>Genre:</strong> {{ data.Genre.Name }}</p>
        <p><strong>Director:</strong> {{ data.Director.Name }}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
      min-width: 300px;
    }
    h2 {
      margin-top: 0;
    }
    .movie-details {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  `]
})
export class SynopsisDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SynopsisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Movie
  ) {}
}

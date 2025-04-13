import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-director-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.Name }}</h2>
    <mat-dialog-content>
      <p><strong>Bio:</strong> {{ data.Bio }}</p>
      <p *ngIf="data.Birth"><strong>Birth:</strong> {{ data.Birth | date }}</p>
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
  `]
})
export class DirectorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DirectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { Name: string; Bio: string; Birth: Date | null }
  ) {}
}

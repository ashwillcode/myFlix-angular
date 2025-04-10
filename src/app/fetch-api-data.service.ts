import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// User interface
interface User {
  _id?: string;
  Username: string;
  Password: string;
  Email: string;
  Birthday?: Date;
  FavoriteMovies?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FetchApiDataService {
  private apiUrl = 'https://filmapi-ab3ce15dfb3f.herokuapp.com/';
  private token = '';

  constructor(private http: HttpClient) { }

  // Get auth token
  private getToken(): string {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.warn('No token found in localStorage');
      return '';
    }
    
    // Check if token starts with 'Bearer'
    if (!token.startsWith('Bearer ')) {
      console.warn('Token does not start with "Bearer", adding prefix');
      return `Bearer ${token}`;
    }
    
    return token;
  }

  // Add auth header to requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    console.log('Getting auth headers with token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('No token available for request');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const headers = new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
    
    console.log('Request headers created:', {
      'Authorization': headers.get('Authorization') ? 'Present' : 'Missing',
      'Content-Type': headers.get('Content-Type')
    });
    
    return headers;
  }

  // User registration
  public userRegistration(userDetails: User): Observable<any> {
    return this.http.post(this.apiUrl + 'users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // User login
  public userLogin(userDetails: { Username: string; Password: string }): Observable<any> {
    console.log('Attempting login for user:', userDetails.Username);
    return this.http.post(this.apiUrl + 'login', userDetails).pipe(
      catchError((error) => {
        console.error('Login API error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  // Get user info
  public getUser(): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.get(this.apiUrl + 'users/' + username, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user info
  public editUser(userDetails: User): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.put(this.apiUrl + 'users/' + username, userDetails, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  public deleteUser(): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.delete(this.apiUrl + 'users/' + username, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<any> {
    console.error('API Error:', {
      status: error.status,
      message: error.error?.message || error.message,
      error: error
    });
    return throwError(() => new Error(error.error?.message || error.message || 'Some error occurred'));
  }
}

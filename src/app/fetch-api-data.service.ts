import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

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
  private apiUrl = 'https://filmapi-ab3ce15dfb3f.herokuapp.com';
  private token = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    console.log('FetchApiDataService initialized with API URL:', this.apiUrl);
  }

  // Get auth token
  private getToken(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    
    const token = localStorage.getItem('token');
    console.log('FetchApiDataService - Token from localStorage:', {
      token: token ? 'Present' : 'Missing',
      tokenValue: token,
      tokenLength: token ? token.length : 0,
      tokenFirstChars: token ? token.substring(0, 20) + '...' : 'N/A'
    });
    
    if (!token) {
      console.warn('No token found in localStorage');
      return '';
    }
    
    // Ensure token has Bearer prefix
    if (!token.startsWith('Bearer ')) {
      console.warn('Token does not start with "Bearer", adding prefix');
      return `Bearer ${token}`;
    }
    
    return token;
  }

  // Add auth header to requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    console.log('FetchApiDataService - Getting auth headers:', {
      token: token ? 'Present' : 'Missing',
      tokenValue: token,
      tokenLength: token ? token.length : 0,
      tokenFirstChars: token ? token.substring(0, 20) + '...' : 'N/A'
    });
    
    if (!token) {
      console.error('No token available for request');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
  }

  // User registration
  public userRegistration(userDetails: User): Observable<any> {
    return this.http.post(this.apiUrl + '/users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // User login
  public userLogin(userDetails: { Username: string; Password: string }): Observable<any> {
    console.log('Attempting login for user:', userDetails.Username);
    return this.http.post(this.apiUrl + '/login', userDetails).pipe(
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
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot access user info on server side'));
    }
    
    const username = localStorage.getItem('user');
    console.log('FetchApiDataService - getUser called with username:', username);
    
    const headers = this.getAuthHeaders();
    console.log('FetchApiDataService - getUser headers:', {
      'Authorization': headers.get('Authorization'),
      'AuthorizationLength': headers.get('Authorization') ? headers.get('Authorization')!.length : 0,
      'AuthorizationFirstChars': headers.get('Authorization') ? headers.get('Authorization')!.substring(0, 20) + '...' : 'N/A',
      'Content-Type': headers.get('Content-Type'),
      rawHeaders: headers // Log the raw headers for debugging
    });
    
    return this.http.get(this.apiUrl + '/users/' + username, {
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user info
  public editUser(userDetails: User): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot edit user on server side'));
    }
    
    const username = localStorage.getItem('user');
    return this.http.put(this.apiUrl + '/users/' + username, userDetails, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  public deleteUser(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot delete user on server side'));
    }
    
    const username = localStorage.getItem('user');
    return this.http.delete(this.apiUrl + '/users/' + username, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get all movies
  public getAllMovies(): Observable<any> {
    console.log('FetchApiDataService - getAllMovies called');
    const headers = this.getAuthHeaders();
    console.log('FetchApiDataService - getAllMovies headers:', {
      'Authorization': headers.get('Authorization'),
      'AuthorizationLength': headers.get('Authorization') ? headers.get('Authorization')!.length : 0,
      'AuthorizationFirstChars': headers.get('Authorization') ? headers.get('Authorization')!.substring(0, 20) + '...' : 'N/A',
      'Content-Type': headers.get('Content-Type')
    });
    
    return this.http.get(this.apiUrl + '/movies', {
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Add movie to favorites
  public addFavoriteMovie(movieId: string): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot add favorite movie on server side'));
    }
    
    const username = localStorage.getItem('user');
    return this.http.post(this.apiUrl + '/users/' + username + '/favorites', { movieId }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Remove movie from favorites
  public removeFavoriteMovie(movieId: string): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot remove favorite movie on server side'));
    }
    
    const username = localStorage.getItem('user');
    return this.http.delete(this.apiUrl + '/users/' + username + '/favorites/' + movieId, {
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

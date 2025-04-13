import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interface representing a user in the application
 * @interface User
 */
interface User {
  /** Unique identifier for the user */
  _id?: string;
  /** Username for login and display */
  Username: string;
  /** User's password (should be hashed) */
  Password: string;
  /** User's email address */
  Email: string;
  /** User's date of birth */
  BirthDate?: Date;
  /** Array of movie IDs that the user has marked as favorites */
  FavoriteMovies?: string[];
}

/**
 * Service responsible for handling all API calls to the movie database
 * @class FetchApiDataService
 * @description Provides methods for user authentication, movie data retrieval,
 * and user profile management. Handles all HTTP requests to the backend API.
 */
@Injectable({
  providedIn: 'root'
})
export class FetchApiDataService {
  /** Base URL for the API endpoints */
  private apiUrl = 'https://filmapi-ab3ce15dfb3f.herokuapp.com';
  /** Storage for the authentication token */
  private token = '';

  /**
   * Creates an instance of FetchApiDataService
   * @param http - Angular's HttpClient service for making HTTP requests
   * @param platformId - Platform identifier for browser/server detection
   */
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    console.log('FetchApiDataService initialized with API URL:', this.apiUrl);
  }

  /**
   * Retrieves the authentication token from localStorage
   * @private
   * @returns {string} The authentication token with 'Bearer' prefix
   */
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

  /**
   * Creates HTTP headers with authentication token
   * @private
   * @returns {HttpHeaders} Headers object with Authorization and Content-Type
   */
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

  /**
   * Registers a new user in the system
   * @param userDetails - User information for registration
   * @returns Observable with the registration response
   */
  public userRegistration(userDetails: User): Observable<any> {
    return this.http.post(this.apiUrl + '/users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Authenticates a user and retrieves a JWT token
   * @param userDetails - Login credentials (username and password)
   * @returns Observable with the login response containing the JWT token
   */
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

  /**
   * Retrieves the current user's profile information
   * @returns Observable with the user's profile data
   * @throws Error if no username is found in localStorage
   */
  public getUser(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot access user info on server side'));
    }
    
    const username = localStorage.getItem('user');
    console.log('FetchApiDataService - getUser called with username:', username);
    
    if (!username) {
      console.error('FetchApiDataService - No username found in localStorage');
      return throwError(() => new Error('No username found. Please log in again.'));
    }
    
    const headers = this.getAuthHeaders();
    console.log('FetchApiDataService - getUser headers:', {
      'Authorization': headers.get('Authorization'),
      'AuthorizationLength': headers.get('Authorization') ? headers.get('Authorization')!.length : 0,
      'AuthorizationFirstChars': headers.get('Authorization') ? headers.get('Authorization')!.substring(0, 20) + '...' : 'N/A',
      'Content-Type': headers.get('Content-Type'),
      rawHeaders: headers // Log the raw headers for debugging
    });
    
    const url = this.apiUrl + '/users/' + username;
    console.log('FetchApiDataService - getUser URL:', url);
    
    return this.http.get(url, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('FetchApiDataService - getUser error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Updates the current user's profile information
   * @param userDetails - Updated user information
   * @returns Observable with the update response
   */
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

  /**
   * Deletes the current user's account
   * @returns Observable with the deletion response
   */
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

  /**
   * Retrieves all movies from the database
   * @returns Observable with an array of movie objects
   */
  public getAllMovies(): Observable<any> {
    console.log('FetchApiDataService - getAllMovies called');
    const headers = this.getAuthHeaders();
    console.log('FetchApiDataService - getAllMovies headers:', {
      'Authorization': headers.get('Authorization'),
      'AuthorizationLength': headers.get('Authorization') ? headers.get('Authorization')!.length : 0,
      'AuthorizationFirstChars': headers.get('Authorization') ? headers.get('Authorization')!.substring(0, 20) + '...' : 'N/A',
      'Content-Type': headers.get('Content-Type')
    });
    
    const url = this.apiUrl + '/movies';
    console.log('FetchApiDataService - getAllMovies URL:', url);
    
    return this.http.get(url, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('FetchApiDataService - getAllMovies error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Adds a movie to the user's favorites list
   * @param movieId - ID of the movie to add to favorites
   * @returns Observable with the update response
   * @throws Error if the movie ID is invalid
   */
  public addFavoriteMovie(movieId: string): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot add favorite movie on server side'));
    }
    
    const username = localStorage.getItem('user');
    console.log('FetchApiDataService - addFavoriteMovie called with movieId:', movieId);
    
    // Ensure movieId is a string and not empty
    if (!movieId || typeof movieId !== 'string') {
      console.error('FetchApiDataService - Invalid movieId:', movieId);
      return throwError(() => new Error('Invalid movie ID format'));
    }
    
    // Log the exact format of the movie ID
    console.log('FetchApiDataService - Movie ID format:', {
      movieId,
      movieIdType: typeof movieId,
      movieIdLength: movieId.length,
      movieIdFirstChars: movieId.substring(0, 10) + '...'
    });
    
    // The API might be expecting a specific format for the movie ID
    // Try to ensure it's in the correct format (e.g., MongoDB ObjectId format)
    // This is a common format for MongoDB ObjectIds: 24 hexadecimal characters
    if (!/^[0-9a-fA-F]{24}$/.test(movieId)) {
      console.warn('FetchApiDataService - Movie ID does not match expected format (24 hex chars)');
      
      // If the movie ID is not in the expected format, try to find a valid ID in the movies array
      // This is a workaround for the issue where the movie ID might not be in the expected format
      // In a real application, you would want to ensure that the movie IDs are in the correct format
      // when they are fetched from the API
      const movies = JSON.parse(localStorage.getItem('movies') || '[]');
      const movie = movies.find((m: any) => m._id === movieId);
      
      if (movie && movie.id) {
        console.log('FetchApiDataService - Found alternative ID:', movie.id);
        movieId = movie.id;
      } else {
        console.error('FetchApiDataService - Could not find a valid ID for movie:', movieId);
        return throwError(() => new Error('Invalid movie ID format'));
      }
    }
    
    const url = this.apiUrl + '/users/' + username + '/favorites';
    console.log('FetchApiDataService - addFavoriteMovie URL:', url);
    console.log('FetchApiDataService - addFavoriteMovie payload:', { movieId });
    
    return this.http.post(url, { movieId }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('FetchApiDataService - addFavoriteMovie error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Removes a movie from the user's favorites list
   * @param movieId - ID of the movie to remove from favorites
   * @returns Observable with the update response
   */
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

  /**
   * Handles HTTP errors and provides appropriate error messages
   * @private
   * @param error - The error object from the HTTP request
   * @returns Observable that throws an error with a user-friendly message
   */
  private handleError(error: any): Observable<any> {
    console.error('API Error:', {
      status: error.status,
      message: error.error?.message || error.message,
      error: error
    });
    return throwError(() => new Error(error.error?.message || error.message || 'Some error occurred'));
  }
}

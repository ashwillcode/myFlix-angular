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

// Movie interface
interface Movie {
  _id: string;
  Title: string;
  Description: string;
  Genre: {
    Name: string;
    Description: string;
  };
  Director: {
    Name: string;
    Bio: string;
    Birth: Date;
  };
  ImagePath: string;
  Featured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FetchApiDataService {
  private apiUrl = 'https://myflix-api-ashwillcode.herokuapp.com/';
  private token = '';

  constructor(private http: HttpClient) { }

  // User registration
  public userRegistration(userDetails: User): Observable<any> {
    return this.http.post(this.apiUrl + 'users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // User login
  public userLogin(userDetails: User): Observable<any> {
    return this.http.post(this.apiUrl + 'login', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // Get all movies
  public getAllMovies(): Observable<any> {
    return this.http.get(this.apiUrl + 'movies').pipe(
      catchError(this.handleError)
    );
  }

  // Get one movie
  public getOneMovie(title: string): Observable<any> {
    return this.http.get(this.apiUrl + 'movies/' + title).pipe(
      catchError(this.handleError)
    );
  }

  // Get director info
  public getDirector(name: string): Observable<any> {
    return this.http.get(this.apiUrl + 'movies/director/' + name).pipe(
      catchError(this.handleError)
    );
  }

  // Get genre info
  public getGenre(name: string): Observable<any> {
    return this.http.get(this.apiUrl + 'movies/genre/' + name).pipe(
      catchError(this.handleError)
    );
  }

  // Get user info
  public getUser(): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.get(this.apiUrl + 'users/' + username).pipe(
      catchError(this.handleError)
    );
  }

  // Get user's favorite movies
  public getFavoriteMovies(): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.get(this.apiUrl + 'users/' + username + '/movies').pipe(
      catchError(this.handleError)
    );
  }

  // Add movie to favorites
  public addFavoriteMovie(movieId: string): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.post(this.apiUrl + 'users/' + username + '/movies/' + movieId, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user info
  public editUser(userDetails: User): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.put(this.apiUrl + 'users/' + username, userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  public deleteUser(): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.delete(this.apiUrl + 'users/' + username).pipe(
      catchError(this.handleError)
    );
  }

  // Delete movie from favorites
  public deleteFavoriteMovie(movieId: string): Observable<any> {
    const username = localStorage.getItem('user');
    return this.http.delete(this.apiUrl + 'users/' + username + '/movies/' + movieId).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<any> {
    return throwError(() => new Error(error.error.message || 'Some error occurred'));
  }
}

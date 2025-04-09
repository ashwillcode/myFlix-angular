# MyFlix Angular Client

A modern web application that allows users to browse and manage their favorite movies. Built with Angular, this client-side application provides a responsive and intuitive user interface for movie enthusiasts.

## Features

- User authentication (signup, login, logout)
- Browse movies from a comprehensive database
- View detailed information about movies
- Add/remove movies to/from favorites
- Update user profile information
- Responsive design for various screen sizes

## Prerequisites

- Node.js (version 18.x or higher)
- npm (comes with Node.js)
- Angular CLI (`npm install -g @angular/cli`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/myFlix-angular.git
cd myFlix-angular
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. Any changes you make to the source files will automatically reload the application.

## Building for Production

To create a production build:

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Testing

Run unit tests:
```bash
ng test
```

Run end-to-end tests:
```bash
ng e2e
```

## Project Structure

- `src/app/components/` - Contains all Angular components
- `src/app/services/` - Contains services for API communication and data management
- `src/app/models/` - Contains TypeScript interfaces and models
- `src/assets/` - Contains static assets like images and styles

## Technologies Used

- Angular 19
- TypeScript
- Angular Material
- RxJS
- Angular Router

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Angular team for the amazing framework
- The Movie Database API for providing movie data

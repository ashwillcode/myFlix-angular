# MyFlix Angular Client

## Description
MyFlix Angular Client is a single-page, responsive movie application built with Angular. It provides users with access to information about different movies, directors, and genres. Users can sign up, update their personal information, and create a list of favorite movies.

## Key Features
- User registration and authentication
- Browse a collection of movies
- View detailed information about movies, directors, and genres
- Add/remove movies to/from a list of favorites
- Update user profile information
- Responsive design for various screen sizes

## Technical Details
- **Built with Angular** (Version 19.2.0)
- **Uses Angular Material** for UI components
- **Implements TypeDoc** for documentation
- **Follows Material Design** principles
- **Responsive Layout** using Flexbox and CSS Grid
- **State Management** using Angular services
- **Form Validation** using Angular's Reactive Forms

## Dependencies
- Angular CLI: 19.2.6
- Angular Material: 19.2.8
- TypeDoc: Latest Version
- RxJS: ~7.8.0
- TypeScript: ~5.7.2

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/myFlix-angular.git
   ```

2. Navigate to the project directory:
   ```bash
   cd myFlix-angular
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:4200/
   ```

## Documentation
The project includes comprehensive documentation generated using TypeDoc. To generate the documentation:

```bash
npm run docs
```

The documentation will be generated in the `docs` directory.

## Component Structure
- **Welcome Page**: Entry point for user registration/login
- **Movie Card**: Displays movie information and handles user interactions
- **User Profile**: Manages user information and favorite movies
- **Dialog Components**: 
  - Genre information
  - Director details
  - Movie synopsis

## API Integration
The application integrates with a REST API to:
- Manage user authentication
- Fetch movie data
- Handle user favorites
- Update user information

## Build and Deployment
To build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Testing
Run unit tests:
```bash
npm test
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Development Guidelines
- Follow Angular best practices
- Use TypeScript features appropriately
- Maintain comprehensive documentation
- Write clear commit messages
- Follow the established code style

## Code Style
- Use TypeScript's strict mode
- Follow Angular style guide
- Implement proper error handling
- Include appropriate comments
- Use meaningful variable names

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Issues
Please check the GitHub issues page for current problems and feature requests.

## License
This project is licensed under the MIT License.

## Contact
For any questions or concerns, please open an issue on GitHub.

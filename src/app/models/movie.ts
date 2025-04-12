export interface Movie {
  _id: string;
  // API might return either uppercase or lowercase properties
  Title: string;
  title?: string;
  Description: string;
  description?: string;
  Genre: {
    Name: string;
    Description: string;
  };
  genre?: {
    name: string;
    description: string;
  };
  Director: {
    Name: string;
    Bio: string;
    Birth: Date | null;
  };
  director?: {
    name: string;
    bio: string;
    birth: Date | null;
  };
  ImagePath: string;
  imagePath?: string;
  Featured: boolean;
  featured?: boolean;
} 
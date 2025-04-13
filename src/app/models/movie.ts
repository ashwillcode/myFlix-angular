export interface Movie {
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
    Birth: Date | null;
  };
  ImagePath: string;
  Featured: boolean;
} 
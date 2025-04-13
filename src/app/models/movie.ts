export interface Movie {
  _id: string;
  id?: string; // Optional id property that may be present in API responses
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
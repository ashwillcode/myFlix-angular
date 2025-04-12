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
    Birth: string;
    Death?: string;
  };
  ImagePath: string;
  Featured: boolean;
} 
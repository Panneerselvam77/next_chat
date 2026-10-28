export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  email: string;
  phone: string;
  username: string;
  image: string;
  gender: string;
  company: {
    name: string;
    title: string;
    department: string;
  };
  address: {
    city: string;
    state: string;
    country: string;
  };
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

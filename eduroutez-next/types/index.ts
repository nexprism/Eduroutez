export type News = {
  instituteName: string;
  title: string;
  image: string;
  createdAt: string;
  category?: string;
  status: boolean;
  _id: string;
};

export type Career = {
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: number;
  createdAt: string;
  status: boolean;
  _id: string;
};

export type Institute = {
  instituteName: any;
  name: string;
  address: string;
  established: string;
  status: boolean;
  _id: string;
};

export type CourseCategory = {
  title: any;
  name: string;
  description: string;
  status: boolean;
  _id: string;
};

export type Review = {
  fullName: string;
  email: string;
  message: string;
  createdAt: string;
  status: boolean;
  _id: string;
};

// If you are expecting a 'result' property, define it explicitly in a wrapper type
export type ReviewResponse = {
  result: Review[];
};

// Ensure data is typed as ReviewResponse where used
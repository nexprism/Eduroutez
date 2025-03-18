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
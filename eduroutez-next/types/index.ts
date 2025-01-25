export type News = {
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
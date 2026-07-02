export type Blog = {
  _id: string;
  title: string;
  thumbnail?: string;
  description: string;
  category?: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  _id: string;
  courseTitle: string;
  category?: string;
  coursePrice?: number;
  courseType?: string;
  status?: string;
  isPublished: boolean;
  isActive: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
};

export type News = {
  instituteName: string;
  title: string;
  image: string;
  createdAt: string;
  category?: string;
  isPublished: boolean;
  _id: string;
};

export type Career = {
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: number;
  createdAt: string;
  isPublished: boolean;
  isActive: boolean;
  _id: string;
  thumbnail?: string;
  category?: string;
};

export type Institute = {
  instituteName: any;
  name: string;
  address: string;
  established: string;
  status: boolean;
  onhold?: boolean;
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

export type Webinar = {
  _id: string;
  title: string;
  image?: string;
  description?: string;
  status: boolean;
  time?: string;
  duration?: string;
  date?: string;
  webinarLink?: string;
  createdAt: string;
};

export type Stream = {
  _id: string;
  name: string;
  status: boolean;
  isCourseStream?: boolean;
  isCounsellorStream?: boolean;
  createdAt: string;
};

export type Media = {
  _id: string;
  title: string;
  work?: string;
  images?: string[];
  video?: string;
  createdAt?: string;
};

export type Counselor = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  contactno: string;
  level?: string;
  category?: string;
  instituteId?: string;
  createdAt?: string;
  created_at?: string;
  scheduledTestDate?: string;
  scheduledTestSlot?: string;
  scheduledTest?: { date?: string };
  scheduledTestDateString?: string;
};

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

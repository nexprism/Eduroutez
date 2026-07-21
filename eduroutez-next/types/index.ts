export type Blog = {
  _id: string;
  title: string;
  thumbnail?: string;
  description: string;
  category?: string;
  isPublished: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
};

export type Institute = {
  instituteName: any;
  name: string;
  address: string;
  established: string;
  status: boolean;
  onhold?: boolean;
  _id: string;
  rank?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
};

export type CourseCategory = {
  title: any;
  name: string;
  description: string;
  status: boolean;
  _id: string;
};

export type Review = {
  _id: string;
  fullName: string;
  email: string;
  message?: string;
  gender?: string;
  contactNumber?: string;
  country?: { name: string; iso2: string };
  institute?: string;
  address?: string;
  yearOfGraduation?: string;
  reviewTitle?: string;
  placementStars?: number;
  placementDescription?: string;
  facultyStars?: number;
  facultyDescription?: string;
  campusLifeStars?: number;
  campusLifeDescription?: string;
  suggestionsStars?: number;
  suggestionDescription?: string;
  recommendation?: boolean;
  studentIdImage?: string;
  selfieImage?: string;
  status: boolean;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
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
  streams?: string[];
  examAccepted?: string[];
  instituteId?: string;
  createdAt?: string;
  created_at?: string;
  scheduledTestDate?: string;
  scheduledTestSlot?: string;
  scheduledTest?: { date?: string };
  scheduledTestDateString?: string;
};

export type Query = {
  _id: string;
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  city: string;
  queryRelatedTo: string;
  query: string;
  status: string;
  type: "query" | "application";
  stream?: { _id: string; name: string } | string;
  level?: string;
  specialization?: string;
  instituteIds?: any[];
  createdAt: string;
  updatedAt: string;
};

export type QuestionAnswer = {
  _id: string;
  question: string;
  answer?: string;
  answers?: Answer[];
  grade?: string;
  label?: string;
  askedBy?: string | { email: string; name: string | null };
  answeredBy?: string | { email: string; name: string | null };
  instituteEmail?: string;
  questionLikes?: Like[];
  voteScore?: number;
  createdAt: string;
  updatedAt: string;
};

export type Answer = {
  _id: string;
  answer: string;
  answeredBy: string | { email: string; name: string | null };
  answeredAt: string;
  editedAt?: string;
  isEdited?: boolean;
  likes?: Like[];
  voteScore?: number;
};

export type Like = {
  userId: string;
  type: 'upvote' | 'downvote';
};

export type Promotion = {
  _id: string;
  title: string;
  image: string;
  description?: string;
  status: string;
  location?: string;
  startDate: string;
  endDate: string;
  isLive: boolean;
  link?: string;
  showTitle: boolean;
  createdAt: string;
  updatedAt: string;
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

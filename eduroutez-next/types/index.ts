import { Icons } from '@/components/icons';

export type Subscription = {
  _id: string;
  image: string;
  mode: string;
  title: string;
  discount: number;
  description: string;
  expiryDate: string;
  category: any;
  createdBy: any;
  createdAt: string;
  startDate: string;
  endDate: string;
  name: string;
  price: number;
  duration: string;
  durationType: string;
  status: boolean;
};

export type Stream = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
};
export type CourseCategory = {
  title: string;
  parentCategory?: CourseCategory;
  icon: string;
  status?: boolean;
  createdAt:string
  _id: string;
};

export type Course = {
  courseTitle: string;
  courseType: 'LIVE' | 'RECORDED' | 'TEXT';
  courseCreatedBy: string;
  instructor: string;
  courseLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  shortDescription?: string;
  longDescription?: string;
  category: CourseCategory;
  visibility: 'DRAFT' | 'PUBLIC' | 'PRIVATE';
  language: string;
  courseOverview?: string;
  courseEligibility?: string;
  courseCurriculum?: string;
  courseFee: number;
  courseOpportunities?: string;
  isCourseFree: boolean;
  coursePrice: number;
  courseDiscount: number;
  courseDiscountType: 'PERCENTAGE' | 'FIXED';
  coursePreviewType: 'YOUTUBE' | 'VIMEO';
  coursePreviewUrl: string;
  coursePreviewThumbnail?: string;
  coursePreviewCover: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
  status: boolean;
  _id: string;
};
interface IInfoText {
  title: string;
  description: string;
  _id: string;
}
export type Institute = {
  _id: string;
  instituteName: string;
  email: string;
  institutePhone: string;
  address?: string;
  state: string;
  city: string;
  establishedYear: number;
  website: string;
  about?: string;
  instituteLogo?: string;
  coverImage?: string;
  thumbnailImage?: string;
  organisationType: string;
  brochure?: string;
  subscriptionType?: string;
  collegeInfoText: IInfoText[];
  collegeInfoLink: IInfoText[];
  courseInfoText: IInfoText[];
  courseInfoLink: IInfoText[];
  admissionInfoText: IInfoText[];
  admissionInfoLink: IInfoText[];
  placementInfoText: IInfoText[];
  placementInfoLink: IInfoText[];
  reviews: IInfoText[];
  campusInfoText: IInfoText[];
  campusInfoLink: IInfoText[];
  scholarshipInfoText: IInfoText[];
  scholarshipInfoLink: IInfoText[];
  gallery: string[];
  password: string;
  skills: string[];
  status: string;
};

interface IEducation {
  institute: string;
  degree: string;
  program: string;
  startDate: Date;
  currentlyEnrolled?: boolean;
  endDate?: Date;
  description?: string;
  _id: string;
}

interface IExperience {
  title: string;
  employmentType: string;
  companyName: string;
  location: string;
  locationType: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  _id: string;
}

export type Counselor = {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  country: string;
  designation: string;
  about?: string;
  profilePicture: string;
  password: string;
  counselorCreatedBy?: string;
  category: string;
  city: string;
  state:string;
  contactno: string;
  bankName: string;
  ifscCode: string;
  adharCard: string;
  panCard: string;
  educations: IEducation[];
  experiences: IExperience[];
  skills: string[];
  commission: number;
  eventCommission: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  _id: string;
};

export type User = {
  email: string;
  password: string;
  name?: string;
  is_verified?: boolean;
  image?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  access: string[];
  contact_number?: string;
  address?: string;
  city?: string;
  state?: string;
  refer_by?: string;
  my_referrals: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
};

interface IEducation {
  institute: string;
  degree: string;
  program: string;
  startDate: Date;
  currentlyEnrolled?: boolean;
  endDate?: Date;
  description?: string;
  certificateImage?: string;
  _id: string;
}

interface IExperience {
  title: string;
  employmentType: string; // Full time, Part time, Internship, Contract, Freelance
  companyName: string;
  location: string;
  locationType: string; // Onsite, Remote
  currentlyWorking?: boolean;
  startDate: Date;
  endDate?: Date;
  description?: string;
  _id: string;
}

export type Student = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  createdAt:string;
  address?: string;
  country: string;
  designation: string;
  about?: string;
  profilePicture?: string;
  password: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  educations: IEducation[];
  experiences: IExperience[];
  skills: string[];
  adharCardImage?: string;
  panCardImage?: string;
  tenthMarksheetImage?: string;
  twelthMarksheetImage?: string;
  referralCode?: string;
  status: boolean;
  _id: string;
};

interface IBlogCategory {
  name: string;
  status?: boolean;
  _id: string;
}

export type Blog = {
  title: string;
  image: string;
  createdAt:string;
  description: string;
  category?: IBlogCategory;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
  status: boolean;
  _id: string;
};

export type Career = {
  name: string;
  title: string;
  overview: string;
  image: string;
  eligibility: string;
  typesOfJobRoles?: string;
  payScaleSalary?: string;
  careerOpportunities?: string;
  topColleges?: string;
  status: boolean;
  _id: string;
};

export type EmailVerification = {
  userId: User;
  otp: string;
  createdAt: Date;
  status: boolean;
  _id: string;
};

export type Feedback = {
  feedback: string;
  user?: Student;
  _id: string;
};

export type InstituteInquiry = {
  name: string;
  mobile: string;
  email?: string;
  stream?: Stream;
  course?: Course;
  institute?: Institute;
  status: boolean;
  _id: string;
};

export type Level = {
  name: string;
  status?: boolean;
  _id: string;
};
interface PaymentMethod {
  name: string;
  image: string;
  status: boolean;
  _id: string;
}

export type Payout = {
  user: User | Student | Counselor;
  userType?: User | Student | Counselor;
  requestedAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  status?: 'REQUESTED' | 'UNPAID' | 'REJECTED' | 'PAID';
  _id: string;
};

export type QuestionAnswer = {
  question?: string;
  answer?: string;
  askedBy?: Student;
  answeredBy?: Counselor;
  status?: boolean;
  _id: string;
};

export type Review = {
  email?: string;
  fullName?: string;
  gender?: string;
  createdAt:string
  contactNumber?: string;
  country?: string;
  institute?: Institute;
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
  studentDocument?: string;
  studentSelfie?: string;
  reviewerLinkedInUrl?: string;
  reviewerTwitterUrl?: string;
  guestLectureByVisitor?: boolean;
  intership?: boolean;
  noPracticalExposure?: boolean;
  researchProject?: boolean;
  moreThan15LecturesPerWeek?: boolean;
  lessThan5LecturesPerWeek?: boolean;
  around5To15LecturesPerWeek?: boolean;
  moreThan20LecturesPerWeek?: boolean;
  rusticatedActionIsTaken?: boolean;
  offUnderRestAreResticated?: boolean;
  noActionIsTaken?: boolean;
  rusticateWarningIssued?: boolean;
  entrepreneurshipNotActive?: boolean;
  entrepreneurshipModerateActive?: boolean;
  entrepreneurshipLessActive?: boolean;
  entrepreneurshipHighActive?: boolean;
  testWeekly?: boolean;
  testMonthly?: boolean;
  testSemesterly?: boolean;
  testAnnually?: boolean;
  isUniform?: boolean;
  isFlexibleDressCode?: boolean;
  noDressCode?: boolean;
  multipleSportsGroups?: boolean;
  noSportsGroups?: boolean;
  coachingProvided?: boolean;
  noCoachingProvided?: boolean;
  estimativePlacementProcess?: boolean;
  veryFewPlacementDrives?: boolean;
  nonFunctionalPlacement?: boolean;
  highLowSalaryRangeOffered?: boolean;
  lectureAsPerSession?: boolean;
  additionDoubtClass?: boolean;
  devisionFromSession?: boolean;
  projectAssignmentWorkshopStudyTools?: boolean;
  isLatestVersionOfBooksAvailable?: boolean;
  noBooksAvailable?: boolean;
  outdatedBooks?: boolean;
  limitedBooks?: boolean;
  twoToThreeEventsPerWeek?: boolean;
  noScheduledPlans?: boolean;
  workshopAndSeminarsAreCunductedRegularly?: boolean;
  annualEventCalenderFollowed?: boolean;
  designatedTeacherOrStudentRepresentativesAreAvailable?: boolean;
  lowDesignatedTeacherOrStudentRepresentativesAreAvailable?: boolean;
  healthyAndQualityFood?: boolean;
  noFoodMenuIsAvailable?: boolean;
  unHealthyFood?: boolean;
  nutritiousFoodAvailable?: boolean;
  dailyWiseMenuIsAvailable?: boolean;
  allModesOfTransportationAvailable?: boolean;
  limitedModesOfTransportationAvailable?: boolean;
  status: boolean;
  _id: string;
};

export type Webinar = {
  title?: string;
  image?: string;
  description?: string;
  webinarLInk?: string;
  date?: Date;
  time?: string;
  createdAt:string;
  duration?: string;
  webinarCreatedBy?: Institute;
  status?: boolean;
  _id: string;
};

export type Wishlist = {
  courses: Course[];
  colleges: Institute[];
  student: Student;
  _id: string;
};

export type Media = {
  title:string;
  images: string[];
  video: string;
  creteadAt: string;
  status: boolean;
  updatedAt: string;
  _id: string;
};

export type Promotion = {
  title: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  isLive: boolean;
  creteadAt: string;
  status: boolean;
  updatedAt: string;
  _id: string;
};
export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

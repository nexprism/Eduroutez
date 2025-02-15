import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const reviewSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    fullName: {
      type: String,
    },
    gender: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    country: {
      type: String,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    address: {
      type: String,
    },
    yearOfGraduation: {
      type: String,
    },
    reviewTitle: {
      type: String,
    },
    placementStars: {
      type: Number,
    },
    placementDescription: {
      type: String,
    },
    facultyStars: {
      type: Number,
    },
    facultyDescription: {
      type: String,
    },
    campusLifeStars: {
      type: Number,
    },
    campusLifeDescription: {
      type: String,
    },
    suggestionsStars: {
      type: Number,
    },
    suggestionDescription: {
      type: String,
    },
    recommendation: {
      type: Boolean,
    },
    studentIdImage:{
      type: String, // image
    },
    selfieImage: {
      type: String, // image
    },
    socialLinks: {
      type: [],
    },
    reviewerTwitterUrl: {
      type: String,
    },
    guestLectureByVisitor: {
      type: Boolean,
    },
    intership: {
      type: Boolean,
    },
    noPracticalExposure: {
      type: Boolean,
    },
    researchProject: {
      type: Boolean,
    },
    moreThan15LecturesPerWeek: {
      type: Boolean,
    },
    lessThan5LecturesPerWeek: {
      type: Boolean,
    },
    around5To15LecturesPerWeek: {
      type: Boolean,
    },
    moreThan20LecturesPerWeek: {
      type: Boolean,
    },
    rusticatedActionIsTaken: {
      type: Boolean,
    },
    offUnderRestAreResticated: {
      type: Boolean,
    },
    noActionIsTaken: {
      type: Boolean,
    },
    rusticateWarningIssued: {
      type: Boolean,
    },
    entrepreneurshipNotActive: {
      type: Boolean,
    },
    entrepreneurshipModerateActive: {
      type: Boolean,
    },
    entrepreneurshipLessActive: {
      type: Boolean,
    },
    entrepreneurshipHighActive: {
      type: Boolean,
    },
    testWeekly: {
      type: Boolean,
    },
    testMonthly: {
      type: Boolean,
    },
    testSemesterly: {
      type: Boolean,
    },
    testAnnually: {
      type: Boolean,
    },
    isUniform: {
      type: Boolean,
    },
    isFlexibleDressCode: {
      type: Boolean,
    },
    noDressCode: {
      type: Boolean,
    },
    multipleSportsGroups: {
      type: Boolean,
    },
    noSportsGroups: {
      type: Boolean,
    },
    coachingProvided: {
      type: Boolean,
    },
    noCoachingProvided: {
      type: Boolean,
    },
    estimativePlacementProcess: {
      type: Boolean,
    },
    veryFewPlacementDrives: {
      type: Boolean,
    },
    nonFunctionalPlacement: {
      type: Boolean,
    },
    highLowSalaryRangeOffered: {
      type: Boolean,
    },
    lectureAsPerSession: {
      type: Boolean,
    },
    additionDoubtClass: {
      type: Boolean,
    },
    devisionFromSession: {
      type: Boolean,
    },
    projectAssignmentWorkshopStudyTools: {
      type: Boolean,
    },
    isLatestVersionOfBooksAvailable: {
      type: Boolean,
    },
    noBooksAvailable: {
      type: Boolean,
    },
    outdatedBooks: {
      type: Boolean,
    },
    limitedBooks: {
      type: Boolean,
    },
    twoToThreeEventsPerWeek: {
      type: Boolean,
    },
    noScheduledPlans: {
      type: Boolean,
    },
    workshopAndSeminarsAreCunductedRegularly: {
      type: Boolean,
    },
    annualEventCalenderFollowed: {
      type: Boolean,
    },
    designatedTeacherOrStudentRepresentativesAreAvailable: {
      type: Boolean,
    },
    lowDesignatedTeacherOrStudentRepresentativesAreAvailable: {
      type: Boolean,
    },
    healthyAndQualityFood: {
      type: Boolean,
    },
    noFoodMenuIsAvailable: {
      type: Boolean,
    },
    unHealthyFood: {
      type: Boolean,
    },
    nutritiousFoodAvailable: {
      type: Boolean,
    },
    dailyWiseMenuIsAvailable: {
      type: Boolean,
    },
    allModesOfTransportationAvailable: {
      type: Boolean,
    },
    limitedModesOfTransportationAvailable: {
      type: Boolean,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
applySoftDelete(reviewSchema);
export default Review;

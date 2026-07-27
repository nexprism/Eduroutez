import express from "express";
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

import { signup, verifyEmail, login, userProfile, logout, changeUserPassword, sendUserPasswordResetEmail, userPasswordReset, getCountries, getStatesByCountry, getCitiesByState, getStatesCities, sendOtp, getStateCityById, verifyOtp, resetPasswordWithOtp, googleLogin, facebookLogin } from "../../controllers/auth-controller.js";
import accessTokenAutoRefresh from "../../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { createCoupon, deleteCoupon, getCoupon, getCoupons, updateCoupon } from "../../controllers/coupon-controller.js";
import { createTransaction, getTransactions } from "../../controllers/transaction-controller.js";
import { createTemplate, deleteTemplate, getTemplate, getTemplates, updateTemplate } from "../../controllers/template-controller.js";
import { CategoryMiddleware, UserMiddleware, requireAuth, QueryMiddleware } from "../../middlewares/index.js";
import { getUsers, updateUser, allowUser, denyUser, holdUser, getMyRefferal, redeemPoints, getRedeemHistory, getAllRefferal, earningReports, dashboard, instituteDashboard, counselorDashboard, likeDislike, submitReview, updateAllSlugs, getMyCoupons } from "../../controllers/users-controller.js";
import { createCategory, deleteCategory, getCategory, updateCategory } from "../../controllers/category-controller.js";
import { createStream, deleteStream, getStream, getStreams, trendingStreams, updateStream } from "../../controllers/stream-controller.js";
import { createSubscription, deleteSubscription, getSubscription, getSubscriptions, updateSubscription, purchasePlan } from "../../controllers/subscription-controller.js";
import { createCourseCategory, deleteCourseCategory, getCourseCategories, getCourseCategory, updateCourseCategory } from "../../controllers/course-category-controller.js";
import { createCourse, deleteCourse, getCourse, getCourses, updateCourse, getPopularCourses, getTrendingCourses, getCourseByInstitute } from "../../controllers/course-controller.js";
import { createInstitute, deleteInstitute, getInstitute, getInstituteByEmail, getInstitutes, makeInstitute, updateInstitute, upgradeInstitute, addGallery, deleteGallery, addFacility, deleteFacility, submitIssue, getIssue, bestRatedInstitute, bulkAddInstitutes, getHelpList, updateIssue, downloadBruchure, megamenuCollages, trendingInstitute, popularInstitute, recommendedInstitute } from "../../controllers/institute-controller.js";
import { createCareer, deleteCareer, getCareer, getCareers, updateCareer, getCareerByinstituteId } from "../../controllers/career-controller.js";
import { createInstituteInquiry, deleteInstituteInquiry, getInstituteInquiries, getInstituteInquiry, updateInstituteInquiry } from "../../controllers/institute-inquiry-controller.js";
import { bookSlots, createCounselor, deleteCounselor, getCounselor, getCounselors, markSlot, updateCounselor, getCounselorsByInstitute, submitcounsellorReview, getCounselorById, getCounselorsByCategory, scheduleTest } from "../../controllers/counselor-controller.js";
import { createStudent, deleteStudent, getStudent, getStudents, updateStudent } from "../../controllers/student-controller.js";
import { createPaymentMethod, deletePaymentMethod, getPaymentMethod, getPaymentMethods, updatePaymentMethod } from "../../controllers/payment-method-controller.js";
import { createReview, deleteReview, getReview, getReviews, updateReview, getReviewsByUser, getReviewByInstitute, getMyReviews } from "../../controllers/review-controller.js";
import { createBlogCategory, deleteBlogCategory, getBlogCategories, getBlogCategory, updateBlogCategory } from "../../controllers/blog-category-controller.js";
import { createCareerCategory, deleteCareerCategory, getCareerCategories, getCareerCategory, updateCareerCategory } from "../../controllers/career-category-controller.js";
import { createRecruiter, deleteRecruiter, getRecruiters, getRecruitersByInstitute, getRecruiter, updateRecruiter } from "../../controllers/recruiters-controller.js";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog, getBlogsByInstitute } from "../../controllers/blog-controller.js";
import { createNews, deleteNews, getNews, getNewsById, getNewsByInstitute, getNewsBySuperAdmin, updateNews } from "../../controllers/news-controller.js";
import { createPayout, deletePayout, getPayout, getPayouts, updatePayout, getPayoutsByUser } from "../../controllers/payout-controller.js";
import { createFeedback, deleteFeedback, getFeedback, getFeedbacks, updateFeedback } from "../../controllers/feedback-controller.js";
import { createQuestionAnswer, deleteQuestionAnswer, getQuestionAnswer, getQuestionAnswers, updateQuestionAnswer, getQuestionAnswerByEmail, submitAnswer, likeQuestionAnswer, likeAnswer, editAnswer, getMyQuestions, replyToAnswer } from "../../controllers/question-answer-controller.js";
import { createWishlist, deleteWishlist, getWishlist, getWishlists, updateWishlist } from "../../controllers/wishlist-controller.js";
// import { createWebinar, deleteWebinar, getWebinar, getWebinars, updateWebinar, getWebinarsByInstitute, getMonthlyWebinarCount, getWebinarTracking } from "../../controllers/webinar-controller.js";

import { createWebinar, deleteWebinar, getWebinar, getWebinars, updateWebinar, getWebinarsByInstitute, getMonthlyWebinarCount } from "../../controllers/webinar-controller.js";
import { createLevel, deleteLevel, getLevel, getLevels, updateLevel } from "../../controllers/level-controller.js";
import { createAdmin, getAdmins, loginAsInstitute } from "../../controllers/admin-controller.js";
import { createStaff, getStaff, updateStaff, deleteStaff, getStaffPermissions, getInstituteStaffPermissions, updateInstituteStaffPermissions } from "../../controllers/staff-controller.js";
import { createMedia, deleteMedia, getMedia, getMedias, updateMedia, uploadEditorFile } from "../../controllers/media-controller.js";
import { createBanner, deleteBanner, getBanner, getBanners, updateBanner } from "../../controllers/banner-controller.js";
import { getUserActivity, getRecentActivity, getActivityStats } from "../../controllers/activity-controller.js";
import { createPromotion, deletePromotion, getPromotion, getPromotions, updatePromotion } from "../../controllers/promotion-controller.js";
import { createCounselorSlots, getCounselorSlot, updateCounselorSlot, deleteCounselorSlot, getScheduleSlots, updateScheduleSlot, getAllScheduleSlots, getScheduleSlotbyId } from "../../controllers/counselorSlot-controller.js";
import { createEmail, deleteEmail, getEmail, getEmails, updateEmail } from "../../controllers/email.js";
import { createQuery, deleteQuery, getQueries, getQuery, getQueryByInstitute, updateQuery, QueryAllocation } from "../../controllers/query-controller.js";
import { createFAQ, deleteFAQ, getFAQ, getFAQs, updateFAQ, getFAQsByInstitute } from "../../controllers/faq-controller.js";
import { createPage, deletePage, getPage, getPages, getPagesByInstitute, updatePage, getPageByStreamLevel } from "../../controllers/customPage-controller.js";
import { createQuestionSet, getAllQuestionSets, getRandomTestSet, submitTestResult, getPendingVerifications, verifyCounselor, rejectCounselor, recordPayment, getLatestTestResult, updateQuestionSet, deleteQuestionSet, getQuestionSetById } from "../../controllers/counselor-test-controller.js";
// import { setBankDetails, validateReferralCode, generateReferralCode, bookWebinar, markAttendanceAndCreditReferrer, redeemEarnings } from "../../controllers/student-flow-controller.js";
// import { createWebinarPackage, getWebinarPackage, getWebinarPackages, getActiveWebinarPackages, updateWebinarPackage, deleteWebinarPackage } from "../../controllers/webinar-package-controller.js";
// import { purchaseWebinarPackage, getPurchaseDetails, getAllPurchases, getInstitutePurchases, getMyPurchases, updatePurchase, deletePurchase, useWebinar, confirmPayment, getPurchaseStatistics, checkWebinarAvailability } from "../../controllers/purchased-webinar-package-controller.js";
// import { requireAdmin, requireInstitute, verifyOwnershipOrAdmin } from "../../middlewares/role-based-auth.js";
// import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayPayment, refundRazorpayPayment } from "../../controllers/razorpay-controller.js";

import { upload } from "../../middlewares/upload-middleware.js";
const router = express.Router();

/**
 * auth routes
 */
router.post("/signup", signup);
router.post("/admin", createAdmin);
router.get("/admins", getAdmins);
router.post("/admin/login-as-institute/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), loginAsInstitute);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/allow", allowUser);
router.post("/deny", denyUser);
router.post("/hold", holdUser);
router.post("/logout", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), logout);
router.post("/change-password", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), changeUserPassword);
router.post("/reset-password-link", sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);

/**
 * subscription routes
 */
router.post("/subscription", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createSubscription);
router.get("/subscriptions", getSubscriptions);
router.get("/subscription/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getSubscription);
router.patch("/subscription/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateSubscription);
router.delete("/subscription/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteSubscription);

/**
 * Email Templates routes
 */
router.post("/create-Email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createEmail);
router.get("/create-Emails", getEmails);
router.get("/create-Email/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getEmail);
router.patch("/create-Email/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateEmail);
router.delete("/create-Email/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteEmail);

/**
 * stream routes
 */
router.post("/stream", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createStream);
router.get("/streams", getStreams);
//trending streams
router.get("/trending-streams", trendingStreams);
router.get("/stream/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getStream);
router.patch("/stream/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateStream);
router.delete("/stream/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteStream);

/**
 * course-category routes
 */
router.post("/course-category", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCourseCategory);
router.get("/course-categories", getCourseCategories);
router.get("/course-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCourseCategory);
router.patch("/course-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCourseCategory);
router.delete("/course-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCourseCategory);

//like-dislike
router.post("/like-dislike", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), likeDislike);




/**
 * course routes
 */
router.post("/course", ...requireAuth, createCourse);
router.get("/courses", getCourses);
router.get("/popular-courses", getPopularCourses);
router.get("/trending-courses", getTrendingCourses);
router.get("/course/:id", getCourse);
router.patch("/course/:id", ...requireAuth, updateCourse);
router.delete("/course/:id", ...requireAuth, deleteCourse);
router.get("/course-by-institute/:id", getCourseByInstitute);
//monthly webinar count
router.get("/monthly-webinar-count/:id", getMonthlyWebinarCount);

/**
 * query routes
 */
router.post("/query", QueryMiddleware.validateCreateQuery, createQuery);
router.get("/queries", getQueries);
router.get("/query/:id", getQuery);
router.get("/query-by-institute/:id", getQueryByInstitute);
router.patch("/query/:id", updateQuery);
router.delete("/query/:id", deleteQuery);
//QueryAllocation
router.get("/lead-allocation", QueryAllocation);

//megamenu/colleges
router.get("/megamenu/colleges", megamenuCollages);


//countries
router.get("/countries", getCountries);
//states
router.post("/states-by-country", getStatesByCountry);

router.post("/state-city-by-id/:id", getStateCityById);

router.post("/cities-by-state", getCitiesByState);
//get state and city
router.get("/state-cities", getStatesCities);

/**
 * institute staff routes (must be BEFORE /institute/:email and /institute/:id to avoid "staff" matching as param)
 */
router.post("/institute/staff", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createStaff);
router.get("/institute/staff", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getStaff);
router.patch("/institute/staff/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateStaff);
router.delete("/institute/staff/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteStaff);
router.get("/staff/permissions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getStaffPermissions);
router.get("/institute/staff-permissions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getInstituteStaffPermissions);
router.patch("/institute/staff-permissions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateInstituteStaffPermissions);

/**
 * institute routes
 */
router.post("/institute", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createInstitute);
router.post("/instituteUpgrade/:email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), upgradeInstitute);
router.post("/institute/:email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), makeInstitute);

router.get("/institutes", getInstitutes);
router.get("/institute/:id", getInstitute);
router.post("/bulkAddInstitutes", bulkAddInstitutes);
router.get("/institutes/:email", getInstituteByEmail);
router.patch("/institute/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateInstitute);
router.delete("/institute/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteInstitute);
router.post("/addfacility/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), addFacility);
//delete facility
router.post("/delete-facility/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteFacility);
//best rated institute
router.get("/best-rated-institute", bestRatedInstitute);
//download-bruchure
router.get("/download-bruchure/:id", downloadBruchure);

//trending institutes
router.get("/trending-institutes", trendingInstitute);
//popular institutes
router.get("/popular-institutes", popularInstitute);
//recommended institutes
router.get("/recommended-institutes", recommendedInstitute);


//addGallery
router.post("/addGallery/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), addGallery);
router.post("/deleteGallery/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteGallery);



//submitIssue
router.post("/submitIssue", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitIssue);
router.get("/issues-list", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getHelpList);
//get issue
router.get("/issue/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getIssue);
//update issue status
router.patch("/updateIssue/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateIssue);

//update-all-slugs-by-model
router.get("/update-all-slugs/:model", updateAllSlugs);


/**
 * institute-inquiries routes
 */
router.post("/institute-inquiry", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createInstituteInquiry);
router.get("/institute-inquiries", getInstituteInquiries);
router.get("/institute-inquiry/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getInstituteInquiry);
router.patch("/institute-inquiry/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateInstituteInquiry);
router.delete("/institute-inquiry/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteInstituteInquiry);

/**
 * career routes
 */
router.post("/career", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCareer);
router.get("/careers", getCareers);
//router.get("/career/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCareer);
router.get("/career/:id", getCareer);
router.get("/career-by-institute/:instituteId", getCareerByinstituteId);
router.patch("/career/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCareer);
router.delete("/career/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCareer);

/**
 * counselor routes
 */
router.post(
  '/counselor',
  (req, res, next) => {
    console.log('Headers:', req.headers);
    console.log('Body:', req.body); // Will show parsed form-data fields
    next();
  },
  upload.none(),
  createCounselor
);//get couselor by institute
router.get("/counselors-by-institute/:institute", getCounselorsByInstitute);
router.get("/counselors", getCounselors);
router.get("/counselor/:email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselor);
router.get("/counselor-by-id/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselorById);
//counselloers-by-category
router.post("/counselors-by-category", getCounselorsByCategory);
router.patch("/counselor/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCounselor);
router.delete("/counselor/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCounselor);

/**
 * counselor verification & test routes
 */
// Superadmin only
router.post("/question-set", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createQuestionSet);
router.get("/question-sets", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getAllQuestionSets);
router.get("/question-set/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getQuestionSetById);
router.patch("/question-set/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateQuestionSet);
router.delete("/question-set/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteQuestionSet);
router.get("/counselor-test/pending-verifications", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPendingVerifications);
router.post("/counselor-test/verify/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), verifyCounselor);
router.post("/counselor-test/reject/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), rejectCounselor);


// Counselor only
router.post("/counselor-test/record-payment", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), recordPayment);

// Counselor: Check if eligible to give test
import { canCounselorGiveTest } from "../../controllers/counselor-test-controller.js";
router.get("/counselor-test/can-give", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), canCounselorGiveTest);

router.get("/counselor-test/questions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getRandomTestSet);
router.get("/counselor-test/get-result", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getLatestTestResult);
router.post("/counselor-test/submit", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitTestResult);



/**
 * counselorSlots routes
 */
router.post("/counselorslots", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCounselorSlots);
router.post("/bookslot", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), bookSlots);
// schedule test for counselor (choose date/time to take test later)
router.post("/counselor/schedule-test", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), scheduleTest);
router.get("/test-reminder-cron", async (req, res) => {
  try {
    const { runReminderCheck } = await import("../../utils/helpers/test-reminder-cron.js");
    await runReminderCheck();
    res.status(200).json({ message: "Test reminder logic manually triggered. Check server console for logs." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/markslot", markSlot);
router.get("/counselorslots", getCounselors);
router.get("/counselorslots/:email", getCounselorSlot);
//get scheduled slots
router.get("/scheduled-slots/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getScheduleSlots);
router.get("/scheduled-slots", getAllScheduleSlots);
//update scheduled slots
router.patch("/scheduled-slots/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateScheduleSlot);
router.get("/scheduled-slot/:id", getScheduleSlotbyId);

router.patch("/counselorslots/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCounselorSlot);
//delete counselor slot
router.delete("/counselorslot/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCounselorSlot);

/**
 * student routes
 */
router.post("/student", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createStudent);
router.get("/students", getStudents);
router.get("/student/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getStudent);
router.patch("/student/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateStudent);
router.delete("/student/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteStudent);

/**
 * payment-method routes
 */
router.post("/payment-method", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createPaymentMethod);
router.get("/payment-methods", getPaymentMethods);
router.get("/payment-method/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPaymentMethod);
router.patch("/payment-method/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePaymentMethod);
router.delete("/payment-method/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePaymentMethod);

/**
 * review routes
 */
// router.post("/review", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createReview);
// router.get("/reviews", getReviews);
// router.get("/review/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getReview);
// router.patch("/review/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateReview);
// router.delete("/review/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteReview);

router.post("/review", createReview);
router.get("/review", getReviews);
router.get("/review/:id", getReview);
router.patch("/review/:id", updateReview);
router.delete("/review/:id", deleteReview);
router.get("/reviews-by-user/:email", getReviewsByUser);
//my-review
router.post("/my-reviews", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyReviews);

//getReviewByInstitute
router.get("/review-by-institute/:id", getReviewByInstitute);


/**
 * blog-category routes
 */
router.post("/blog-category", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createBlogCategory);
router.get("/blog-category", getBlogCategories);
router.get("/blog-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBlogCategory);
router.patch("/blog-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateBlogCategory);
router.delete("/blog-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteBlogCategory);

//Recruiters
router.post("/recruiter", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createRecruiter);
router.get("/recruiters", getRecruiters);
router.get("/recruiters-by-institute/:id", getRecruitersByInstitute);
router.get("/recruiter/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getRecruiter);
router.patch("/recruiter/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateRecruiter);
router.delete("/recruiter/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteRecruiter);


//career-category
router.post("/career-category", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCareerCategory);
router.get("/career-category", getCareerCategories);
router.get("/career-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCareerCategory);
router.patch("/career-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCareerCategory);
router.delete("/career-category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCareerCategory);




/**
 * blog routes
 */
router.post("/blog", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createBlog);
router.get("/blogs", getBlogs);
router.get("/blogs-by-institute/:instituteId", getBlogsByInstitute);
// router.get("/blog/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBlog);
router.get("/blog/:id", getBlog);




router.patch("/blog/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateBlog);
router.delete("/blog/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteBlog);


//newsa
router.post("/create-news", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createNews);
router.get("/news", getNews);
router.get("/news/superadmin", getNewsBySuperAdmin)
router.get("/news/:institute", getNewsByInstitute);
router.get("/news/data/:id", getNewsById);
router.get("/news-by-institute/:id", getNewsByInstitute);
router.patch("/update-news/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateNews);
router.delete("/news/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteNews);



/**
 * payout routes
 */
router.post("/payout", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createPayout);
router.get("/payouts", getPayouts);
router.get("/payout/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPayout);
router.get("/payouts-by-user", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPayoutsByUser);
router.patch("/payout/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePayout);
router.delete("/payout/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePayout);

/**
 * feedback routes
 */
router.post("/feedback", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createFeedback);
router.get("/feedbacks", getFeedbacks);
router.get("/feedback/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getFeedback);
router.patch("/feedback/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateFeedback);
router.delete("/feedback/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteFeedback);

/**
 * question-answer routes
 */
router.post("/question-answer", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createQuestionAnswer); // Require authentication for question submission
router.get("/question-answers", getQuestionAnswers);
router.get("/question-answer/:email", getQuestionAnswerByEmail);
router.get("/question-answer-detail/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getQuestionAnswer);
router.patch("/question-answer/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateQuestionAnswer);
router.delete("/question-answer/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteQuestionAnswer);
router.post("/question-answer/:id/answer", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitAnswer);
router.post("/question-answer/:id/like", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), likeQuestionAnswer);
router.post("/question-answer/:id/answer/:answerId/like", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), likeAnswer);
router.patch("/question-answer/:id/answer/:answerId", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), editAnswer);
router.post("/question-answer/:id/answer/:answerId/reply", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), replyToAnswer);
router.get("/my-questions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyQuestions);

/**
 * FAQs routes
 */
router.post("/faq", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createFAQ);
router.get("/faq", getFAQs);
router.get("/faq/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getFAQ);
router.patch("/faq/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateFAQ);
router.delete("/faq/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteFAQ);
router.get("/faq-by-institute/:id", getFAQsByInstitute);

/**
 * wishlist routes
 */
router.post("/wishlist", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createWishlist);
router.get("/wishlists", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getWishlists);
router.get("/wishlist/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getWishlist);
router.patch("/wishlist/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateWishlist);
router.delete("/wishlist/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteWishlist);

/**
 * webinar routes
 */
router.post("/webinar", ...requireAuth, createWebinar);
router.get("/webinars", getWebinars);
router.get("/webinars-by-institute/:instituteId", getWebinarsByInstitute);
router.get("/webinar/:id", ...requireAuth, getWebinar);
router.patch("/webinar/:id", ...requireAuth, updateWebinar);
router.delete("/webinar/:id", ...requireAuth, deleteWebinar);

/**
 * level routes
 */
router.post("/level", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createLevel);
router.get("/levels", getLevels);
router.get("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getLevel);
router.patch("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateLevel);
router.delete("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteLevel);

/**
 * banner routes
 */
router.post("/banner", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createBanner);
router.get("/banners", getBanners);
router.get("/banner/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBanner);
router.patch("/banner/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateBanner);
router.delete("/banner/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteBanner);

/**
 * user routes
 */
router.get("/user", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), userProfile);
router.patch("/user/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateUser);
router.get("/users", UserMiddleware.validateGetAllRequest, accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getUsers);
//get my refferal api
router.get("/counselors", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselors);
router.get("/my-refferal", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyRefferal);
router.get("/my-coupons", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyCoupons);
router.get("/all-refferal", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getAllRefferal);
//get-eaarning-reports
router.get("/earning-reports", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), earningReports);
//sales report
router.get("/admin-dashboard", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), dashboard);
//instiute dashboard
router.get("/institute-dashboard", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), instituteDashboard);
//counselor dashboard
router.get("/counselor-dashboard", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), counselorDashboard);
//send otp
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/redeem-points", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), redeemPoints);
//redeem history
router.get("/redeem-history", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getRedeemHistory);

//razorpay create order
router.post("/purchase-plan", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), purchasePlan);

//activity routes
router.get("/activity", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getUserActivity);
router.get("/activity/recent", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getRecentActivity);
router.get("/activity/stats", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getActivityStats);

//submit-counsellor-feedback
router.post("/submit-counsellor-review", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitcounsellorReview);
//submit-review
router.post("/submit-review", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitReview);






/**
 * category routes
 */
// router.post("/category", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCategory);
// router.get("/categories", CategoryMiddleware.validateGetAllRequest, getCategories);
// router.get("/category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCategory);
// router.patch("/category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCategory);
// router.delete("/category/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCategory);

/**
 * coupon routes
 */
router.post("/coupon", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCoupon);
router.get("/coupons", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCoupons);
// router.get("/coupons-by-category", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCoupons);
router.get("/coupon/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCoupon);
router.patch("/coupon/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCoupon);
router.delete("/coupon/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCoupon);
/**
 * transaction routes
 */
router.post("/transaction", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createTransaction);
router.get("/transactions", getTransactions);
/**
 * template routes
 */
router.post("/template", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createTemplate);
router.get("/templates", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getTemplates);
router.get("/template/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getTemplate);
router.patch("/template/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateTemplate);
router.delete("/template/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteTemplate);

/**
 * promotion routes
 */
router.post("/promotion", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createPromotion);
router.get("/promotions", getPromotions);
router.get("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPromotion);
router.patch("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePromotion);
router.delete("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePromotion);

/**
 * media routes
 */
router.post("/media", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createMedia);
router.post("/upload-editor", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), upload.single('upload'), uploadEditorFile);
router.get("/media", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMedias);
router.get("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMedia);
router.patch("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateMedia);
router.delete("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteMedia);

router.post("/page", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createPage);
router.get("/page", getPages);
router.get("/page-by-institute/:instituteId", getPagesByInstitute);

// router.get("/blog/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBlog);
router.get("/page/:id", getPage);
//get page by strem and level
router.get("/page/:stream/:level", getPageByStreamLevel);




router.patch("/page/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePage);
router.delete("/page/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePage);

/**
 * AI Chatbot / Counselor routes  – 24×7 admission support
 * POST   /chatbot/chat              → send a message (public, session-based)
 * GET    /chatbot/history/:sid      → get message history for a session
 * DELETE /chatbot/session/:sid      → clear a session
 * GET    /chatbot/sessions          → list all sessions (admin only)
 */
import { chatWithBot, getChatHistory, deleteChatSession, listChatSessions } from "../../controllers/chatbot-controller.js";
import {
    createAssessment,
    getAssessments,
    getAssessment,
    deleteAssessment,
    seedDefaultAssessment,
    submitAssessment,
    getAssessmentResult,
    getMyResults,
} from "../../controllers/assessment-controller.js";
import { getMarketTrends, askMarketQuestion } from "../../controllers/trend-controller.js";
import { predictCareerOutcomeController } from "../../controllers/career-outcome-controller.js";
import { recommendController } from "../../controllers/recommendation-controller.js";
import { relatedContentController } from "../../controllers/related-content-controller.js";
import { geoDemandController } from "../../controllers/geo-demand-controller.js";

// Public endpoints (no auth required – sessions identified by sessionId UUID)
router.post("/chatbot/chat", chatWithBot);
router.get("/chatbot/history/:sessionId", getChatHistory);
router.delete("/chatbot/session/:sessionId", deleteChatSession);

// Admin-only: list all chat sessions
router.get("/chatbot/sessions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), listChatSessions);

// ─────────────────────────────────────────────
//  Assessment (Personality-to-College Fit)
// ─────────────────────────────────────────────
// List + fetch assessments are public; create/delete/seed require auth
router.get("/assessments", getAssessments);
router.post("/assessment/seed-default", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), seedDefaultAssessment);
router.post("/assessment", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createAssessment);
router.get("/assessment/:id", getAssessment);
router.delete("/assessment/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteAssessment);

// Submit answers + get college-fit result (public so guests can try it)
router.post("/assessment/:id/submit", submitAssessment);
router.get("/assessment/result/:resultId", getAssessmentResult);

// Authenticated user: list own results
router.get("/assessment/results/me", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyResults);

// ─────────────────────────────────────────────
//  Market Trends (Course Demand & Salary Analyzer)
// ─────────────────────────────────────────────
router.get("/market-trends", getMarketTrends);
router.post("/market-trends/ask", askMarketQuestion);

// ─────────────────────────────────────────────
//  Career Outcome Predictor (salary / placement / growth / higher-study)
// ─────────────────────────────────────────────
router.post("/career-outcome/predict", predictCareerOutcomeController);

// ─────────────────────────────────────────────
//  AI College Matchmaking Engine (scores + budget + location + behavior)
// ─────────────────────────────────────────────
router.post("/recommendation", recommendController);

// ─────────────────────────────────────
//  Geo-Demand Intelligence (city / district / state demand heatmaps)
// ─────────────────────────────────────
router.get("/recommendation/geo-demand", geoDemandController);

// ────────────────────────────────────────────────────────────
//  Related Content Engine (blogs / careers / courses / institutes)
// ────────────────────────────────────────────────────────────
router.get("/related-content", relatedContentController);

export default router;

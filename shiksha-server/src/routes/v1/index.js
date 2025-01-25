import express from "express";
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;``

import { signup, verifyEmail, login, userProfile, logout, changeUserPassword, sendUserPasswordResetEmail, userPasswordReset } from "../../controllers/auth-controller.js";
import accessTokenAutoRefresh from "../../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { createCoupon, deleteCoupon, getCoupon, getCoupons, updateCoupon } from "../../controllers/coupon-controller.js";
import { createTransaction, getTransactions } from "../../controllers/transaction-controller.js";
import { createTemplate, deleteTemplate, getTemplate, getTemplates, updateTemplate } from "../../controllers/template-controller.js";
import { CategoryMiddleware, UserMiddleware } from "../../middlewares/index.js";
import { getUsers, updateUser, allowUser, denyUser, getMyRefferal, redeemPoints, getRedeemHistory, getAllRefferal } from "../../controllers/users-controller.js";
import { createCategory, deleteCategory,getCategory, updateCategory } from "../../controllers/category-controller.js";
import { createStream, deleteStream, getStream, getStreams, updateStream } from "../../controllers/stream-controller.js";
import { createSubscription, deleteSubscription, getSubscription, getSubscriptions, updateSubscription, purchasePlan } from "../../controllers/subscription-controller.js";
import { createCourseCategory, deleteCourseCategory, getCourseCategories, getCourseCategory, updateCourseCategory } from "../../controllers/course-category-controller.js";
import { createCourse, deleteCourse, getCourse, getCourses, updateCourse, getPopularCourses, getCourseByInstitute } from "../../controllers/course-controller.js";
import { createInstitute, deleteInstitute, getInstitute, getInstituteByEmail, getInstitutes, makeInstitute, updateInstitute, upgradeInstitute, addGallery, addFacility, submitIssue, bestRatedInstitute, bulkAddInstitutes, getHelpList, updateIssue, downloadBruchure } from "../../controllers/institute-controller.js";
import { createCareer, deleteCareer, getCareer, getCareers, updateCareer ,getCareerByinstituteId } from "../../controllers/career-controller.js";
import { createInstituteInquiry, deleteInstituteInquiry, getInstituteInquiries, getInstituteInquiry, updateInstituteInquiry } from "../../controllers/institute-inquiry-controller.js";``
import { bookSlots, createCounselor, deleteCounselor, getCounselor, getCounselors, markSlot, updateCounselor, getCounselorsByInstitute, submitcounsellorReview } from "../../controllers/counselor-controller.js";
import { createStudent, deleteStudent, getStudent, getStudents, updateStudent } from "../../controllers/student-controller.js";
import { createPaymentMethod, deletePaymentMethod, getPaymentMethod, getPaymentMethods, updatePaymentMethod } from "../../controllers/payment-method-controller.js";
import { createReview, deleteReview, getReview, getReviews, updateReview ,getReviewsByUser,getReviewByInstitute} from "../../controllers/review-controller.js";
import { createBlogCategory, deleteBlogCategory, getBlogCategories, getBlogCategory, updateBlogCategory } from "../../controllers/blog-category-controller.js";
import { createCareerCategory, deleteCareerCategory, getCareerCategories, getCareerCategory, updateCareerCategory } from "../../controllers/career-category-controller.js";
import { createRecruiter, deleteRecruiter, getRecruiters, getRecruitersByInstitute, getRecruiter, updateRecruiter } from "../../controllers/recruiters-controller.js";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog,getBlogsByInstitute } from "../../controllers/blog-controller.js";
import { createNews, deleteNews, getNews, getNewsById, getNewsByInstitute, updateNews } from "../../controllers/news-controller.js";
import { createPayout, deletePayout, getPayout, getPayouts, updatePayout, getPayoutsByUser } from "../../controllers/payout-controller.js";
import { createFeedback, deleteFeedback, getFeedback, getFeedbacks, updateFeedback } from "../../controllers/feedback-controller.js";
import { createQuestionAnswer, deleteQuestionAnswer, getQuestionAnswer, getQuestionAnswers, updateQuestionAnswer ,getQuestionAnswerByEmail} from "../../controllers/question-answer-controller.js";
import { createWishlist, deleteWishlist, getWishlist, getWishlists, updateWishlist } from "../../controllers/wishlist-controller.js";
import { createWebinar, deleteWebinar, getWebinar, getWebinars, updateWebinar, getWebinarsByInstitute, getMonthlyWebinarCount } from "../../controllers/webinar-controller.js";
import { createLevel, deleteLevel, getLevel, getLevels, updateLevel } from "../../controllers/level-controller.js";
import { createAdmin, getAdmins } from "../../controllers/admin-controller.js";
import { createMedia, deleteMedia, getMedia, getMedias, updateMedia } from "../../controllers/media-controller.js";
import { createPromotion, deletePromotion, getPromotion, getPromotions, updatePromotion } from "../../controllers/promotion-controller.js";
import { createCounselorSlots, getCounselorSlot, updateCounselorSlot } from "../../controllers/counselorSlot-controller.js";
import { createEmail, deleteEmail, getEmail, getEmails, updateEmail } from "../../controllers/email.js";
import { createQuery, deleteQuery, getQueries, getQuery, updateQuery } from "../../controllers/query-controller.js";
import { createFAQ, deleteFAQ, getFAQ, getFAQs, updateFAQ ,getFAQsByInstitute} from "../../controllers/faq-controller.js";
import { createPage, deletePage, getPage, getPages, getPagesByInstitute, updatePage } from "../../controllers/customPage-controller.js";
import { upload } from "../../middlewares/upload-middleware.js";
const router = express.Router();

/**
 * auth routes
 */
router.post("/signup", signup);
router.post("/admin", createAdmin);
router.get("/admins", getAdmins);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/allow", allowUser);
router.post("/deny", denyUser);
router.post("/logout", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), logout);
router.post("/change-password", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), changeUserPassword);
router.post("/reset-password-link", sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);

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




/**
 * course routes
 */
router.post("/course", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCourse);
router.get("/courses", getCourses);
router.get("/popular-courses", getPopularCourses);
router.get("/course/:id", getCourse);
router.patch("/course/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCourse);
router.delete("/course/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCourse);
router.get("/course-by-institute/:id", getCourseByInstitute);
//monthly webinar count
router.get("/monthly-webinar-count/:id", getMonthlyWebinarCount);

/**
 * query routes
 */
router.post("/query", createQuery);
router.get("/queries", getQueries);
router.get("/query/:id", getQuery);
router.patch("/query/:id",  updateQuery);
router.delete("/query/:id", deleteQuery);

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
//best rated institute
router.get("/best-rated-institute", bestRatedInstitute);
//download-bruchure
router.get("/download-bruchure/:id", downloadBruchure);



//addGallery
router.post("/addGallery/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), addGallery);

//submitIssue
router.post("/submitIssue", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitIssue);
router.get("/issues-list", getHelpList);
//update issue status
router.patch("/updateIssue/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateIssue);


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
router.get("/counselors-by-institute/:institute", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselorsByInstitute);
router.get("/counselors", getCounselors);
router.get("/counselor/:email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselor);
router.patch("/counselor/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCounselor);
router.delete("/counselor/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCounselor);

/**
 * counselorSlots routes
 */
router.post("/counselorslots", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createCounselorSlots);
router.post("/bookslot", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), bookSlots);
router.post("/markslot", markSlot);
router.get("/counselorslots", getCounselors);
router.get("/counselorslots/:email", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselorSlot);
router.patch("/counselorslots/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateCounselorSlot);
// router.delete("/counselorslots/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteCounselorSlots);

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

router.post("/review",  createReview);
router.get("/review", getReviews);
router.get("/review/:id",  getReview);
router.patch("/review/:id", updateReview);
router.delete("/review/:id", deleteReview);
router.get("/reviews-by-user/:email", getReviewsByUser);
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
router.post("/question-answer",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createQuestionAnswer);
router.get("/question-answers", getQuestionAnswers);
router.get("/question-answer/:email",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getQuestionAnswerByEmail);
router.get("/question-answer/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getQuestionAnswer);
router.patch("/question-answer/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }),  updateQuestionAnswer);
router.delete("/question-answer/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }),  deleteQuestionAnswer);

/**
 * FAQs routes
 */
router.post("/faq",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createFAQ);
router.get("/faq", getFAQs);
router.get("/faq/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getFAQ);
router.patch("/faq/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }),  updateFAQ);
router.delete("/faq/:id",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }),  deleteFAQ);
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
router.post("/webinar", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createWebinar);
router.get("/webinars", getWebinars);
router.get("/webinars-by-institute/:instituteId", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getWebinarsByInstitute);
router.get("/webinar/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getWebinar);
router.patch("/webinar/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateWebinar);
router.delete("/webinar/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteWebinar);

/**
 * level routes
 */
router.post("/level", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createLevel);
router.get("/levels", getLevels);
router.get("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getLevel);
router.patch("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateLevel);
router.delete("/level/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteLevel);

/**
 * role routes
 */
// router.post("/role", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createBanner);
// router.get("/roles", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBanners);
// router.get("/role/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBanner);
// router.patch("/role/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateBanner);
// router.delete("/role/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteBanner);

/**
 * user routes
 */
router.get("/user", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), userProfile);
router.patch("/user/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateUser);
router.get("/users", UserMiddleware.validateGetAllRequest, accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getUsers);
//get my refferal api
router.get("/counselors", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getCounselors);
router.get("/my-refferal", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMyRefferal);
router.get("/all-refferal", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getAllRefferal);
router.post("/redeem-points", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), redeemPoints);
//redeem history
router.get("/redeem-history", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getRedeemHistory);

//razorpay create order
router.post("/purchase-plan", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), purchasePlan);

//submit-counsellor-feedback
router.post("/submit-counsellor-review", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), submitcounsellorReview);






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
router.get("/transactions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getTransactions);
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
router.get("/promotions", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPromotions);
router.get("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getPromotion);
router.patch("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePromotion);
router.delete("/promotion/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePromotion);

/**
 * media routes
 */
router.post("/media", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createMedia);
router.get("/media", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMedias);
router.get("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getMedia);
router.patch("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updateMedia);
router.delete("/media/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteMedia);

router.post("/page", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), createPage);
router.get("/page", getPages);
router.get("/page-by-institute/:instituteId", getPagesByInstitute);    

// router.get("/blog/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), getBlog);
router.get("/page/:id", getPage);




router.patch("/page/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), updatePage);
router.delete("/page/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deletePage);



export default router;

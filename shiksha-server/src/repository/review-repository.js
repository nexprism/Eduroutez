import Review from "../models/Review.js";
import CrudRepository from "./crud-repository.js";
import Blog from "../models/Blog.js";
import Course from "../models/Course.js";
import Career from "../models/Career.js";
import Counselor from "../models/Counselor.js";


class ReviewRepository extends CrudRepository {
  constructor() {
    super(Review);
  }

  //getAllByInstitute
  async getAllByInstitute(instituteId) {
    try {
      const reviews = await Review.find({ institute: instituteId });
      return reviews;
    }
    catch (error) {
      throw error;
    }
  }

  //getMyReviews
  async getMyReviews(user, type) {
    try {

      let model = Review;
      let userId = user.email;
      if (type === "blog") {
        model = Blog;
        userId = user._id;
      } else if (type === "course") {
        model = Course;
        userId = user._id;
      } else if (type === "counselor") {
        model = Counselor;
        userId = user.email;
      } else{
        model = Review;
        userId = user.email;
      }

      let reviews;

      if (type === "institute") {
        reviews = await Review.find({ email: userId }).sort({ createdAt: -1 }).populate('institute');
        return reviews
      } else if (type === "counselor") {
        const blogs = await model.find({ "reviews.studentEmail": userId });
        reviews = blogs.map(blog => {
          return blog.reviews
            .filter(review => review.studentEmail === userId) // Filter reviews matching studentEmail with userId
            .map(review => {
              return {
          _id: review._id,
          ObjectId: blog._id,
          objectName: (type === "counselor") ? blog.firstname + " " + blog.lastname : blog.title,
          slug: '',
          rating: review.rating,
          comment: review.comment,
          studentId: review.studentId,
          studentName: user.name,
          studentEmail: user.email,
          reviewedAt: review.reviewedAt
              };
            });
        }).flat();

        // Sort reviews in descending order by reviewedAt
        reviews.sort((a, b) => {
          const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
          const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
          return dateB - dateA;
        });

        return reviews;
      } else {
        const blogs = await model.find({ "reviews.studentId": userId });
        reviews = blogs.map(blog => {
          console.log('user', userId);
          console.log('blog', blog.reviews[0].studentId);
          return blog.reviews
            .filter(review => review.studentId.toString() === userId.toString()) // Filter reviews matching studentId with userId
            .map(review => {
              return {
          _id: review._id,
          ObjectId: blog._id,
          objectName: (type === "course") ? blog.courseTitle : blog.title,
          slug: blog.slug,
          rating: review.rating,
          comment: review.comment,
          studentId: review.studentId,
          studentName: user.name,
          studentEmail: user.email,
          reviewedAt: review.reviewedAt
              };
            });
        }).flat();
        console.log('reviews',reviews.length);
        return reviews;

      }
      
    } catch (error) {
      throw error;
    }
  }


  async getAllByUser(email) {
    try {
      const reviews = await Review.find({ email: email }).populate('institute');
      return reviews;
    } catch (error) {
      throw error;
    }
  }
}



export { ReviewRepository };

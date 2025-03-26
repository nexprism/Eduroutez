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
          return blog.reviews.map(review => {
            // if(!review.reviewedAt){
            //   review.reviewedAt = Date.now();
            //   //update review
            //   blog.save();
            // }
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

        console.log('Raw reviews before sorting:', reviews.map(r => ({
          objectName: r.objectName,
          comment: r.comment,
          reviewedAt: r.reviewedAt,
          type: typeof r.reviewedAt
        })));

        //descending by reviewedAt
        reviews.sort((a, b) => {
          // Convert to timestamps, treating null/undefined as 0
          const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
          const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;

          // Sort in descending order
          return dateB - dateA;
        });

        console.log('Raw reviews after sorting:', reviews.map(r => ({
          objectName: r.objectName,
          comment: r.comment,
          reviewedAt: r.reviewedAt,
          type: typeof r.reviewedAt
        })));

        
        // console.log('reviews', reviews);
        return reviews;
      } else {
         const blogs = await model.find({ "reviews.studentId": userId });
         
        reviews = blogs.map(blog => {
          return blog.reviews.map(review => {
            
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

        reviews.sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
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

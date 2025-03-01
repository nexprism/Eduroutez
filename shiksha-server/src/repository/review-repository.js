import Review from "../models/Review.js";
import CrudRepository from "./crud-repository.js";
import Blog from "../models/Blog.js";
import Career from "../models/Career.js";


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
      } else if (type === "career") {
        model = Career;
        userId = user._id;
      } else if (type === "news") {
        model = News;
        userId = user._id;
      }

      let reviews;

      if (type === "institute") {
        reviews = await Review.find({ email: userId });
      } else {
         reviews = await model.find({ "reviews.studentId": userId });
      }
      
      return reviews;
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

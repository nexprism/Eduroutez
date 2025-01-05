// import Course from "../models/Course.js";
import Course from "../models/Course.js";
import CrudRepository from "./crud-repository.js";

class CourseRepository extends CrudRepository {
  constructor() {
    super(Course);
  }



async getPopularCourses() {
  try {

    //get popular courses base on rating with reviews details with limit 3
    const courses = await this.model.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          rating: { $avg: "$reviews.rating" },
          reviews: { $push: "$reviews" },
        },
      },
      {
        $sort: { rating: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    

    return courses;
  } catch (error) {
    throw error;
  }
}

}

export { CourseRepository };

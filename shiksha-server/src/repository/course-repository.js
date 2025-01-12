// import Course from "../models/Course.js";
import Course from "../models/Course.js";
import CrudRepository from "./crud-repository.js";

class CourseRepository extends CrudRepository {
  constructor() {
    super(Course);
  }

  //getCourseByInstitute
  async getCourseByInstitute(instituteId) {
    try {
      console.log("instituteId", instituteId);
      const courses = await Course.find({ instituteCategory: instituteId });
      return courses;
    }
    catch (error) {
      throw error;
    }
  }




async getPopularCourses() {
  try {
    const courses = await Course.find({ isCoursePopular: true });
    return courses;
  } catch (error) {
    throw error;
  }
}

}

export { CourseRepository };

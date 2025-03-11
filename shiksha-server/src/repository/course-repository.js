// import Course from "../models/Course.js";
import Course from "../models/Course.js";
import CrudRepository from "./crud-repository.js";

class CourseRepository extends CrudRepository {
  constructor() {
    super(Course);
  }

  //getbyfield
  async getByField(value, populateFields = [], field = "_id") {
    try {
      const course = await Course.findOne({ [field]: value }).populate(populateFields);
      return course;
    }
    catch (error) {
      throw error;
    }

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

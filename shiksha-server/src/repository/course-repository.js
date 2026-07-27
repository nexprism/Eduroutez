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




async getPopularCourses(extraFilters = {}, limit = 20) {
  try {
    const filter = { $or: [{ isCoursePopular: true }, { isCoursePopular: 'true' }], ...extraFilters };
    console.log('getPopularCourses filter:', filter);
    const courses = await Course.find(filter).limit(limit).lean();
    console.log('getPopularCourses found:', courses.length);
    return courses;
  } catch (error) {
    throw error;
  }
}

async getTrendingCourses(extraFilters = {}, limit = 20) {
  try {
    const filter = { $or: [{ isCourseTrending: true }, { isCourseTrending: 'true' }], ...extraFilters };
    console.log('getTrendingCourses filter:', filter);
    const courses = await Course.find(filter).limit(limit).lean();
    console.log('getTrendingCourses found:', courses.length);
    return courses;
  } catch (error) {
    throw error;
  }
}

}

export { CourseRepository };

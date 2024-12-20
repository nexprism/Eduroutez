// import Course from "../models/Course.js";
import Course from "../models/Course.js";
import CrudRepository from "./crud-repository.js";

class CourseRepository extends CrudRepository {
  constructor() {
    super(Course);
  }
}

export { CourseRepository };

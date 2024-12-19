import CourseCategory from "../models/CourseCategory.js";
import CrudRepository from "./crud-repository.js";

class CourseCategoryRepository extends CrudRepository {
  constructor() {
    super(CourseCategory);
  }
}

export { CourseCategoryRepository };

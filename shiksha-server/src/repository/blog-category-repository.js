import BlogCategory from "../models/BlogCategory.js";
import CrudRepository from "./crud-repository.js";

class BlogCategoryRepository extends CrudRepository {
  constructor() {
    super(BlogCategory);
  }
}

export { BlogCategoryRepository };

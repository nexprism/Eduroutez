import Blog from "../models/Blog.js";
import CrudRepository from "./crud-repository.js";

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }
}

export { BlogRepository };

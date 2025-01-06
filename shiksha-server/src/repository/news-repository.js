import News from "../models/news.js";
import CrudRepository from "./crud-repository.js";

class NewsRepository extends CrudRepository {
  constructor() {
      super(News);
  }
}

export { NewsRepository };

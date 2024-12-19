import Media from "../models/Media.js";
import CrudRepository from "./crud-repository.js";

class MediaRepository extends CrudRepository {
  constructor() {
    super(Media);
  }
}

export { MediaRepository };

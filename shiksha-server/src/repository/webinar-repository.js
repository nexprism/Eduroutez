import Webinar from "../models/Webinar.js";
import CrudRepository from "./crud-repository.js";

class WebinarRepository extends CrudRepository {
  constructor() {
    super(Webinar);
  }
}

export { WebinarRepository };

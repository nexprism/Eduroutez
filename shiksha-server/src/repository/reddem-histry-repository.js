import ReddemHistry from "../models/ReddemHistry.js";
import CrudRepository from "./crud-repository.js";

class ReddemHistryRepository extends CrudRepository {
  constructor() {
    super(ReddemHistry);
  }
}

export { ReddemHistryRepository };

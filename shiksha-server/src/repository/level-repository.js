import Level from "../models/Level.js";
import CrudRepository from "./crud-repository.js";

class LevelRepository extends CrudRepository {
  constructor() {
    super(Level);
  }
}

export { LevelRepository };

import Stream from "../models/Stream.js";
import CrudRepository from "./crud-repository.js";

class StreamRepository extends CrudRepository {
  constructor() {
    super(Stream);
  }
}

export { StreamRepository };

import Banner from "../models/Banner.js";
import CrudRepository from "./crud-repository.js";

class BannerRepository extends CrudRepository {
  constructor() {
    super(Banner);
  }
}

export { BannerRepository };

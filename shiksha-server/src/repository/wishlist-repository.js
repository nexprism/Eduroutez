import Wishlist from "../models/Wishlist.js";
import CrudRepository from "./crud-repository.js";

class WishlistRepository extends CrudRepository {
  constructor() {
    super(Wishlist);
  }
}

export { WishlistRepository };

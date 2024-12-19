import Coupon from "../models/Coupon.js";
import CrudRepository from "./crud-repository.js";

class CouponRepository extends CrudRepository {
  constructor() {
    super(Coupon);
  }
}

export { CouponRepository };

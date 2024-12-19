import Subscription from "../models/Subscription.js";
import CrudRepository from "./crud-repository.js";

class SubscriptionRepository extends CrudRepository {
  constructor() {
    super(Subscription);
  }
}

export { SubscriptionRepository };

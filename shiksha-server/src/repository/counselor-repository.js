import Counselor from "../models/Counselor.js";
import CrudRepository from "./crud-repository.js";

class CounselorRepository extends CrudRepository {
  constructor() {
    super(Counselor);
  }

  async makeCounselor(data) {
    const { email } = data;
    let counselor = await this.model.findOne({ email });

    if (counselor) {
      counselor = await this.model.findOneAndUpdate({ email }, data, { new: true });
    } else {
      counselor = new this.model(data);
      await counselor.save();
    }

    return counselor;
  }
  
  async get(email) {
    try {
      const result = await this.model.findOne({ email });
      return result;
    } catch (error) {
      throw error;
    }
  }
}


export { CounselorRepository };

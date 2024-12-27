import CounselorSlot from "../models/CounselorSlot.js";
import CrudRepository from "./crud-repository.js";

class CounselorSlotRepository extends CrudRepository {
  constructor() {
    super(CounselorSlot);
  }

  async get(email) {
    try {
      const result = await this.model.findOne({ counselorEmail: email });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(email, data) {
    try {
      const result = await this.model.findOneAndUpdate(
        { counselorEmail: email },
        data,
        { new: true }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

}

export { CounselorSlotRepository };

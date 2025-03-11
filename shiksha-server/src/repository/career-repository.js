import Career from "../models/Career.js";
import CrudRepository from "./crud-repository.js";

class CareerRepository extends CrudRepository {
  constructor() {
    super(Career);
  }

  //getByField
    async getByField(value, field) {
      try {
        const career = await Career.findOne({ [field]: value });
        return career;
      } catch (error) {
        console.error('Error in CareerRepository.getByField:', error.message);
        throw error;
      }
    }

  async getCareer(instituteId) {
    try {
      console.log('id', instituteId);
      const careers = await Career.find({ instituteId: instituteId });
      console.log(careers);
      return careers;
    } catch (error) {
      console.error('Error in careerRepository.getAllByInstitute:', error.message);
      throw error;
    }
  }
}

export { CareerRepository };
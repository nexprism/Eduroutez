import Career from "../models/Career.js";
import CrudRepository from "./crud-repository.js";

class CareerRepository extends CrudRepository {
  constructor() {
    super(Career);
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
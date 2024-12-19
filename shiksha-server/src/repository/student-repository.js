import Student from "../models/Student.js";
import CrudRepository from "./crud-repository.js";

class StudentRepository extends CrudRepository {
  constructor() {
    super(Student);
  }
}

export { StudentRepository };

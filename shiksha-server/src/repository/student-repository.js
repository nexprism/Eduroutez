import Student from "../models/Student.js";
import CrudRepository from "./crud-repository.js";

class StudentRepository extends CrudRepository {
  constructor() {
    super(Student);
  }

  async makeStudent(data) {
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
}

export { StudentRepository };

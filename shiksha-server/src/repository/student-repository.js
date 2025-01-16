import Student from "../models/Student.js";
import CrudRepository from "./crud-repository.js";

class StudentRepository extends CrudRepository {
  constructor() {
    super(Student);
  }

  async makeStudent(data) {
    const { user } = data;
    let counselor = await this.model.findOne({ _id: user });
    console.log("counselor", counselor);
    if (counselor) {
      counselor = await this.model.findOneAndUpdate({ _id: user }, data, {
        new: true,
      });
    } else {
      counselor = new this.model(data);
      await counselor.save();
    }

    return counselor;
  }
}

export { StudentRepository };

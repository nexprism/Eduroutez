import { StudentRepository } from "../repository/index.js";
import { UserRepository } from "../repository/index.js";

class StudentService {
  constructor() {
    this.studentRepository = new StudentRepository();
    this.userRepository = new UserRepository();
  }

  async create(data) {
    try {
      console.log('data',data)

      const userpayload = {
        name: data.name,
        email: data.email,
        contact_number: data.phone,
        about: data.about,
      };

      const userResponse = await this.userRepository.update(data.user, userpayload);

      const student = await this.studentRepository.makeStudent(data);
      return student;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
    const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        if (parsedFilters.category !== "by-category") {
          filterConditions[key] = value;
        }
      }

      // Build search conditions for multiple fields with partial matching
      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      // Build sort conditions
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      // Execute query with dynamic filters, sorting, and pagination
      const populateFields = [];
      const students = await this.studentRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      // Check if grouping by category is requested
      if (parsedFilters.category === "by-category") {
        const groupedResult = students.result.reduce((acc, student) => {
          student.category.forEach((cat) => {
            const categoryName = cat.title; // Make sure this is the correct field for the category name
            if (categoryName) {
              // Initialize the category array if it doesn't exist
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              // Add the current student to the relevant category array
              acc[categoryName].push(student);
            } else {
              // Handle cases where category title is missing
              if (!acc["undefined"]) {
                acc["undefined"] = [];
              }
              acc["undefined"].push(student);
            }
          });
          return acc;
        }, {});
        return groupedResult;
      }
      return students;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the students", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(id) {
    const student = await this.studentRepository.get(id);
    return student;
  }
  async update(id, data) {
    try {

      const userpayload = {
        name: data.name,
        email: data.email,
        contact_number: data.contactno,
      };

    
      const userResponse = await this.userRepository.update(id, userpayload);



      const student = await this.studentRepository.update(id, data);
      return student;



    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const student = await this.studentRepository.destroy(id);
      return student;
    } catch (error) {
      throw error;
    }
  }
}

export default StudentService;

/*
    this is my #first #tweet . I am really #excited
*/

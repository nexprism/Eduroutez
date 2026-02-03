import { StatusCodes } from "http-status-codes";
import { InstituteRepository } from "../repository/index.js";
import { InstituteIssuesRepository } from "../repository/index.js";
import { UserRepository } from "../repository/index.js";

import AppError from "../utils/errors/app-error.js";
class InstituteService {
  constructor() {
    this.instituteRepository = new InstituteRepository();
    this.instituteIssuesRepository = new InstituteIssuesRepository();
    this.userRepository = new UserRepository
  }
  

  async create(data) {
    try {
      const institute = await this.instituteRepository.create(data);
      return institute;
    } catch (error) {
      throw error;
    }
  }

  async make(email,data){
    try {
      const institute = await this.instituteRepository.make(email,data);
      return institute;
    } catch (error) {
      throw error;
    }
  }

  async addFacility(id,data){
    try {
      console.log('id',id);
      console.log('data',data);
      const updatesInstitute = await this.instituteRepository.addFacility(id, data.title);
console.log('updatesInstitute',updatesInstitute);
      return updatesInstitute;
    } catch (error) {
      console.log(error.message);
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //deleteFacility
  async deleteFacility(id,facilityId){
    try {
      const updatesInstitute = await this.instituteRepository.removeFacility(id,facilityId);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //deleteGallery
  async deleteGallery(id,galleryimg){
    try {
      const updatesInstitute = await this.instituteRepository.removeGallery(id,galleryimg);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async Upgrade(email,data){
    try {
      const institute=await this.instituteRepository.upgrade(email,data);
      console.log(institute);
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special characters
}

  async getAll(query, browserUrl) {
  try {
    const {
      page = 1,
      limit = 100,
      filters = "{}",
      searchFields = "{}",
      sort = "{}",
      select = "{}"
    } = query;

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 100, 1000); // Cap limit at 1000 to prevent memory issues

    // Safely parse JSON strings with error handling
    let parsedFilters = {};
    let parsedSearchFields = {};
    let parsedSort = {};
    let parsedSelect = {};

    try {
      parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    } catch (e) {
      console.error('Error parsing filters:', e.message);
      parsedFilters = {};
    }

    try {
      parsedSearchFields = typeof searchFields === 'string' ? JSON.parse(searchFields) : searchFields;
    } catch (e) {
      console.error('Error parsing searchFields:', e.message);
      parsedSearchFields = {};
    }

    try {
      parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;
    } catch (e) {
      console.error('Error parsing sort:', e.message);
      parsedSort = {};
    }

    try {
      parsedSelect = typeof select === 'string' ? JSON.parse(select) : select;
    } catch (e) {
      console.error('Error parsing select:', e.message);
      parsedSelect = {};
    }

    const filterConditions = { deletedAt: null };

    if (browserUrl !== undefined && !browserUrl.includes('admin')) {
      filterConditions.onhold = false;
    }

    let ratingFilter = 0;
    let trendingFilter = 0;

    const streamSpecFilters = [];
    const locationFilters = [];
    const examFilters = [];
    const otherFilters = [];

    for (let [key, value] of Object.entries(parsedFilters)) {
      if (key === 'Exam') key = "examAccepted";

      if (value === "true") {
        filterConditions[key] = true;
      } else if (value === "false") {
        filterConditions[key] = false;
      } else {
        const createRegex = val => ({ $regex: this.escapeRegex(val), $options: 'i' });

        if (key === 'streams' || key === 'specialization') {
          if (Array.isArray(value)) {
            const regexPattern = value.map(this.escapeRegex).join('|');
            streamSpecFilters.push({ [key]: { $regex: regexPattern, $options: 'i' } });
          } else {
            streamSpecFilters.push({ [key]: createRegex(value) });
          }
        } else if (key === 'state' || key === 'city') {
          const path = `${key}.name`;
          if (Array.isArray(value)) {
            const regexPattern = value.map(this.escapeRegex).join('|');
            locationFilters.push({ [path]: { $regex: regexPattern, $options: 'i' } });
          } else {
            locationFilters.push({ [path]: createRegex(value) });
          }
        } else if (key === 'organisationType') {
          if (Array.isArray(value)) {
            const regexPattern = value.map(this.escapeRegex).join('|');
            otherFilters.push({ [key]: { $regex: regexPattern, $options: 'i' } });
          } else {
            otherFilters.push({ [key]: createRegex(value) });
          }
        } else if (key === 'Fees') {
          const feesConditions = [];
          if (Array.isArray(value)) {
            value.forEach(range => {
              let condition = {};
              if (range === "> 5 Lakh") {
                condition = { minFees: { $gt: 500000 } };
              } else if (range === "3 - 5 Lakh") {
                condition = { minFees: { $gt: 300000 }, maxFees: { $lte: 500000 } };
              } else if (range === "1 - 3 Lakh") {
                condition = { minFees: { $gt: 100000 }, maxFees: { $lte: 300000 } };
              } else if (range === "< 1 Lakh") {
                condition = { maxFees: { $lte: 100000 } };
              }
              feesConditions.push(condition);
            });
            if (feesConditions.length > 0) {
              otherFilters.push({ $or: feesConditions });
            }
          }
        } else if (key === 'examAccepted') {
          if (Array.isArray(value)) {
            value.forEach(exam => {
              examFilters.push({ [key]: { $regex: `(^|,)${this.escapeRegex(exam)}(,|$)`, $options: 'i' } });
            });
          } else {
            examFilters.push({ [key]: { $regex: `(^|,)${this.escapeRegex(value)}(,|$)`, $options: 'i' } });
          }
        } else if (key === 'Ratings') {
          ratingFilter = 1;
        } else if (key === 'isTrending') {
          trendingFilter = 1;
        } else {
          filterConditions[key] = value;
        }
      }
    }

    const finalFilters = [];

    if (streamSpecFilters.length > 0) finalFilters.push({ $or: streamSpecFilters });
    if (locationFilters.length > 0) finalFilters.push({ $or: locationFilters });
    if (examFilters.length > 0) finalFilters.push({ $or: examFilters });
    if (otherFilters.length > 0) otherFilters.forEach(filter => finalFilters.push(filter));

    if (finalFilters.length > 0) {
      if (streamSpecFilters.length > 0 && locationFilters.length > 0) {
        filterConditions.$and = finalFilters;
      } else {
        filterConditions.$or = finalFilters;
      }
    }

    // 🔧 Escape regex in search conditions
    const searchConditions = [];
    for (const [field, term] of Object.entries(parsedSearchFields)) {
      const escapedTerm = this.escapeRegex(term);
      if (field === 'courseTitle') {
        searchConditions.push({ 'courses.courseTitle': { $regex: escapedTerm, $options: "i" } });
      } else if (field === 'state') {
        searchConditions.push({ 'state.name': { $regex: escapedTerm, $options: "i" } });
      } else if (field === 'city') {
        searchConditions.push({ 'city.name': { $regex: escapedTerm, $options: "i" } });
      } else {
        searchConditions.push({ [field]: { $regex: escapedTerm, $options: "i" } });
      }
    }

    if (searchConditions.length > 0) {
      filterConditions.$or = searchConditions;
    }

    const sortConditions = {};
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === "asc" ? 1 : -1;
    }

    const populateFields = ["reviews", "plan"];
    const selectFields = parsedSelect;

    const institutes = await this.instituteRepository.getAll(
      filterConditions,
      sortConditions,
      pageNum,
      limitNum,
      populateFields,
      selectFields
    );

    institutes.result.forEach(institute => {
      if (!institute) return; // Skip null/undefined institutes
      
      try {
        if (institute.reviews && Array.isArray(institute.reviews) && institute.reviews.length > 0) {
          const totalStars = institute.reviews.reduce((sum, review) => {
            if (!review) return sum;
            return sum + (review.placementStars || 0) +
              (review.campusLifeStars || 0) +
              (review.facultyStars || 0) +
              (review.suggestionsStars || 0);
          }, 0);
          const overallRating = totalStars / (institute.reviews.length * 4);
          institute.overallRating = Math.round(overallRating);
        } else {
          institute.overallRating = 0;
        }
      } catch (ratingError) {
        console.error('Error calculating rating for institute:', institute._id, ratingError.message);
        institute.overallRating = 0;
      }
    });

    if (parsedFilters.Ratings && Array.isArray(parsedFilters.Ratings) && ratingFilter === 1) {
      const ratingStrings = parsedFilters.Ratings.map(r => r.split(' ')[0]);
      institutes.result = institutes.result.filter(i =>
        ratingStrings.includes(i.overallRating.toString()));
      const totalDocuments = institutes.result.length;
      institutes.totalPages = Math.ceil(totalDocuments / limitNum);
      institutes.totalDocuments = totalDocuments;
    }

    if (parsedFilters.isTrending && trendingFilter === 1) {
      institutes.result = institutes.result.filter(i =>
        i.plan?.features?.some(f => f.key === "Trending Institutes" && f.value === "Yes"));
      const totalDocuments = institutes.result.length;
      institutes.totalPages = Math.ceil(totalDocuments / limitNum);
      institutes.totalDocuments = totalDocuments;
    }

    return institutes;
  } catch (error) {
    console.error("Error in getAll institutes:", error.message);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    if (error.message.includes("JSON")) {
      throw new AppError("Invalid query parameters format", StatusCodes.BAD_REQUEST);
    } else if (error.message.includes("populate")) {
      throw new AppError("Error loading related data", StatusCodes.INTERNAL_SERVER_ERROR);
    } else {
      throw new AppError(`Cannot fetch data of all the institutes: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
  
 

  //megamenuCollages
  async megamenuCollages() {
    try {
      const institutes = await this.instituteRepository.megamenuCollages();
      return institutes;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the institutes", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id, field = '_id') {
    // Get the institute model
    const instituteModel = await this.instituteRepository.getByField(id, field);
    console.log('instituteModel',instituteModel);
    // Convert model to plain JavaScript object
    // Different ORMs have different methods to do this:
    let institute;

    // For Mongoose
    if (typeof instituteModel.toObject === 'function') {
      institute = instituteModel.toObject();
    }
    // For Sequelize
    else if (typeof instituteModel.get === 'function' && typeof instituteModel.get({ plain: true }) !== 'undefined') {
      institute = instituteModel.get({ plain: true });
    }
    // For TypeORM or generic case
    else if (typeof instituteModel.toJSON === 'function') {
      institute = instituteModel.toJSON();
    }
    // Fallback: manual conversion using object spread
    else {
      institute = JSON.parse(JSON.stringify(instituteModel));
    }

    // Update views by 1
    const views = institute.views + 1;
    await this.instituteRepository.update(institute.id, { views });

    console.log('institute views',institute.views);

    

    return institute;
  }


  //downloadBruchure
  async downloadBruchure(id){
    try {

      //get institute 

      const institute = await this.instituteRepository.get(id);
      if (!institute) {
        throw new AppError("Institute not found", StatusCodes.NOT_FOUND);
      }

    const bruchure = institute.brochure;
    
    return bruchure;
      
    } catch (error) {
      throw new AppError("Cannot fetch institute bruchure", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }



  //bestRatedInstitute
  async bestRatedInstitute() {
    try {
      const institute = await this.instituteRepository.bestRatedInstitute();
      return institute;
    } catch (error) {
      throw new AppError("Cannot fetch best rated institute", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  

//addGallery
  async addGallery(id,data){
    console.log(id);
    console.log('data',data);
    try {
      const updatesInstitute = await this.instituteRepository.addGallery(id, data.gallery);
      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }















  

  async getbyemail(email) {
    const institute = await this.instituteRepository.getByEmail(email);
    return institute;
  }
  

  async addCourses(id,data){
    try {
      const updatesInstitute = await this.instituteRepository.addCourse(id, data);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //updateCourses
  async updateCourses(id,courseId,data){
    try {
      const updatesInstitute = await this.instituteRepository.updateCourse(id,courseId, data);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
      

  async addReviews(id,data){
    try {
      const updatesInstitute = await this.instituteRepository.addReview(id, data);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async deleteCourse(instituteId,courseId){
    try {
      const updatesInstitute = await this.instituteRepository.removeCourse(instituteId,courseId);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id, data) {
    try {
      const institute = await this.instituteRepository.update(id, data);

      return institute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const institute = await this.instituteRepository.deleteById(id);
      return institute;
    } catch (error) {
      console.log('delete error',error.message);
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The institute you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //submitIssue
  async submitIssue(id,data){
    try {
      
      const payload = { 
        ...data,
        institute: id,
        status: "Pending",
      };

      console.log('data', payload);
      const issue = await this.instituteIssuesRepository.createIssue(payload);
      return issue;
    } catch (error) {
      console.log('error',error.message);
      throw new AppError("Cannot submit the issue ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //getIssue
  async getIssue(id){
    try {
      const issue = await this.instituteIssuesRepository.getIssueById(id);
      return issue;
    } catch (error) {
      throw new AppError("Cannot fetch the issue ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //updateIssue
  async updateIssue(id,data){
    try {
      const updatesIssue = await this.instituteIssuesRepository.update(id, data);
      return updatesIssue;
    } catch (error) {
      throw new AppError("Cannot update the issue ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


    
    async getHelpList() {
      try {
        const helpList = await this.instituteIssuesRepository.getHelpList();
        return helpList;
      } catch (error) {
        console.log(error.message);
        throw new AppError("Cannot fetch help list", StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
  
}

export default InstituteService;

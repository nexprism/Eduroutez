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
  
  async getAll(query) {
    try {
      const { page = 1, limit = 100000000000000, filters = "{}", searchFields = "{}", sort = "{}",select = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // console.log("select", select);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
      const filterConditions = { deletedAt: null, onhold: true };
      var ratingFilter = 0;
      var trendingFilter = 0;
      for (var [key, value] of Object.entries(parsedFilters)) {
        if (key === 'Exam') {
          key = "examAccepted";
        }

        if (value === "true") {
          filterConditions[key] = true;
        } else if (value === "false") {
          filterConditions[key] = false;
        } else {
          if (key === 'streams' || key === 'specialization' || key === 'state' || key === 'city' || key === 'examAccepted' || key === 'organisationType') {
            if (Array.isArray(value)) {
              const regexPattern = value.join('|'); // Convert array to regex pattern
              filterConditions.$or = filterConditions.$or || [];
              if(key === 'state' || key === 'city') {
                filterConditions.$or.push({ [`${key}.name`]: { $regex: regexPattern, $options: 'i' } });
              } else {
                filterConditions.$or.push({ [key]: { $regex: regexPattern, $options: 'i' } });
              }
            } else {
              filterConditions.$or = filterConditions.$and || [];
              filterConditions.$or.push({ [key]: { $regex: value, $options: 'i' } });
            }
          } else if (key === 'Fees') {
            // Handling multiple min and max fee filters
            console.log("fees value", value);

            //items: ["> 5 Lakh", "3 - 5 Lakh", "1 - 3 Lakh", "< 1 Lakh"],

            if (Array.isArray(value)) {
              filterConditions.$or = filterConditions.$and || [];

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

                console.log("Condition", condition);
                filterConditions.$or.push(condition);
              });
            }
          } else if (key === 'examAccepted') {
            if (Array.isArray(value)) {
              filterConditions.$and = filterConditions.$and || [];
              value.forEach(exam => {
                filterConditions.$and.push({ [key]: { $regex: `(^|,)${exam}(,|$)`, $options: 'i' } });
              });
            } else {
              console.log("hello")
              filterConditions.$and = filterConditions.$and || [];
              filterConditions.$and.push({ [key]: { $regex: `(^|,)${value}(,|$)`, $options: 'i' } });
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

      console.log("filterConditions", filterConditions);

      // Build search conditions for multiple fields with partial matching
      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        if (field === 'courseTitle') {
          searchConditions.push({ 'courses.courseTitle': { $regex: term, $options: "i" } });
        } else if (field === 'state') {
          searchConditions.push({ 'state.name': { $regex: term, $options: "i" } });
        } else if (field === 'city') {
          searchConditions.push({ 'city.name': { $regex: term, $options: "i" } });
        } else {
          searchConditions.push({ [field]: { $regex: term, $options: "i" } });
        }
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      console.log("searchConditions", searchConditions);

      // Build sort conditions
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      // Execute query with dynamic filters, sorting, and pagination
      const populateFields = ["reviews", "plan"];
      const selectFields = JSON.parse(select);

      const institutes = await this.instituteRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields, selectFields);
      
      institutes.result.forEach(institute => {
        if (institute.reviews){
      const overallRating = institute.reviews.length > 0
        ? institute?.reviews.reduce((sum, review) => sum + (review.placementStars || 0) +
          (review.campusLifeStars || 0) +
          (review.facultyStars || 0) +
          (review.suggestionsStars || 0), 0) / (institute?.reviews.length * 4 || 1)
        : 0;

        institute.overallRating = Math.round(overallRating);
        }else{
          institute.overallRating = 0;
        }
      });

      //if in filter pass rating = 1/3/2/4/5 filter by rating
      // console.log('parsedFilters',parsedFilters);
      console.log('ratingFilter',ratingFilter);
      if (parsedFilters.Ratings && Array.isArray(parsedFilters.Ratings) && ratingFilter === 1) {
        institutes.result = institutes.result.filter(institute => {
          const ratingStrings = parsedFilters.Ratings.map(rating => rating.split(' ')[0]); // Extract numeric part from "1 star", "5 star", etc.
          console.log('institute.overallRating', ratingStrings);
          return ratingStrings.includes(institute.overallRating.toString());
        });
        const totalDocuments = institutes.result.length;
        const totalPages = Math.ceil(totalDocuments / limitNum);
        institutes.totalPages = totalPages;
        institutes.totalDocuments = totalDocuments;
      }

      // console.log('trendingFilter',trendingFilter);
      // console.log('insti',institutes.result.length);

      

      //if in filter pass isTrending = 1 filter by trending
      if (parsedFilters.isTrending && trendingFilter === 1) {
        institutes.result = institutes.result.filter(institute => {
          return institute.plan?.features?.some(feature => feature.key === "Trending Institutes" && feature.value === "Yes");
        });
        const totalDocuments = institutes.result.length;
        const totalPages = Math.ceil(totalDocuments / limitNum);
        institutes.totalPages = totalPages;
        institutes.totalDocuments = totalDocuments;
      }

      // update totalDocuments and totalPages

      
      return institutes;

    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the institutes", StatusCodes.INTERNAL_SERVER_ERROR);
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

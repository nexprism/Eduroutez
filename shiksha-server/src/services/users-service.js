import e from "express";
import { UserRepository } from "../repository/index.js";
import { ReddemHistryRepository } from "../repository/index.js";
import { CounselorRepository } from "../repository/index.js";
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.reddemHistryRepository = new ReddemHistryRepository();
    this.counsellorRepository = new CounselorRepository();
    
  }

  async getlist() {
    try {
      const users = await this.userRepository.getALL();
      return users;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getlist() {
    try {
      const users = await this.userRepository.getALL();
      return users;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create(data) {
    try {
      const user = await this.userRepository.create(data);
      return user;
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
        filterConditions[key] = value;
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
      const categories = await this.userRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return categories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  

async getCounselors() {
  try {
    // Add role filter for counselors
    const filterConditions = { role: "counselor" };

    // Execute query without sorting and pagination
    const counselors = await this.userRepository.getlist(filterConditions);

    return counselors;
  } catch (error) {
    throw new AppError("Cannot fetch data of all the counselors", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


async getUserByReferalCode(referalCode) {
  try {
    const user = await this.userRepository.findBy({ referalCode });
    return user;
  } catch (error) {
    throw error;
  }
}


////update referalUser my_referrals
async updateReferalUser(referalUser, userId) {
  try {
    const my_referrals = [];
    if (referalUser.my_referrals) {
      my_referrals.push(userId);
    }

    const referdata = {
      my_referrals: my_referrals,
      points: referalUser.points + 50,
    };

    const referalUserPayload = { ...referdata };

    // console.log('referalUserPayload',referalUserPayload)

    const referalUserResponse = await this.userRepository.update(referalUser._id, referalUserPayload);

    return referalUserResponse;
  } catch (error) {
    throw error;
  }
}

async redeemPoints(userId, points) {
  try {

    const user = await this.userRepository.getById(userId);

    const updatedPoints = user.points - points;
    const updatedBalance = user.balance + points / 2;

    const payload = {
      points: updatedPoints,
      balance: updatedBalance,
    };

    const reddemHistryPayload = {
      user: userId,
      points: points,
      remarks: points + " points redeemed",
    };

    if (user.role == 'cousellor') {
      // console.log('user.role:', user.role);
      const response = await this.counsellorRepository.update(userId, payload);
      const reddemHistryResponse = await this.reddemHistryRepository.create(reddemHistryPayload);
      return response;
    }else{
     const response = await this.userRepository.update(userId, payload);
    //  console.log('response:', response);
     const reddemHistryResponse = await this.reddemHistryRepository.create(reddemHistryPayload);
     return response;
    }
    


  } catch (error) {
    throw error;
  }
}

  //earningReports
async earningReports(userId = '') {
  try {
    const user = await this.userRepository.earningReports(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

  //dashboard
  async dashboard(userId = '') {
  try {
    const user = await this.userRepository.dashboardDetails(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

  //instituteDashboard
  async instituteDashboard(userId = '') {
  try {
    const user = await this.userRepository.instituteDashboard(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

  //counselorDashboard
  async counselorDashboard(userId) {
  try {
    const user = await this.userRepository.counselorDashboard(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

  //likeDislike
  async likeDislike(userId, courseId, like, type) {
  try {
    const user = await this.userRepository.likeDislike(userId, courseId, like, type);
    return user;
  } catch (error) {
    throw error;
  }
}

  //submitReview
  async submitReview(itemId, reviewpayload, type) {
  try {
    const user = await this.userRepository.submitReview(itemId, reviewpayload, type);
    return user;
  } catch (error) {
    throw error;
  }
}

  //sendSms
  async sendSms(userId, message) {
  try {
    const user = await this.userRepository.getById(userId);
    return user;
  } catch (error) {
    throw error;
  }
}


//getRedeemHistory
async getRedeemHistory(userId) {
  try {
    const response = await this.reddemHistryRepository.getAll({ user: userId });
    return response;
  } catch (error) {
    throw error;
  }
}


//getMyRefferal
async getMyRefferal(id) {
  try {
    const refferal = await this.userRepository.getAll({ refer_by: id });
    return refferal;
  } catch (error) {
    throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


  async getAllRefferal() {
    try {
      // Fetch all users where 'refer_by' is not null and populate the 'refer_by' field
      const all_refferal = await this.userRepository.getAll({
        refer_by: { $ne: null }
      });

      // Populating the 'refer_by' field with user details
      const populatedReferrals = await this.userRepository.model.populate(all_refferal, { path: 'refer_by' });

      // Log the count of referrals fetched
      console.log('all_refferal count:', all_refferal);

      // Return the populated list of referrals
      return populatedReferrals;
    } catch (error) {
      console.error('Error fetching referral data:', error.message);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      console.log('id', id);
      const user = await this.userRepository.getById(id);

      return user;
    } catch (error) {
      throw error;
    }
  }


  async update(id, data) {
    
    try {
      const institute = await this.userRepository.update(id, data);

      return institute;
    } catch (error) {
      throw new AppError("Cannot update the user ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }   



}

export default UserService;

/*
    this is my #first #tweet . I am really #excited
*/

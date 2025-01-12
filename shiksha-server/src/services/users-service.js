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
      const filterConditions = {};

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

    const user = await this.userRepository.get(userId);

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

}

export default UserService;

/*
    this is my #first #tweet . I am really #excited
*/

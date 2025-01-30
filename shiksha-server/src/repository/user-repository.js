import User from "../models/User.js";
import State from "../models/States.js";
import City from "../models/Cities.js";
import CrudRepository from "./crud-repository.js";

class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  //getStates
  async getStates() {
    try {
      const states = await State.find({country_id: 101});
      return states;
    } catch (error) {
      throw error;
    }
  }

  //getCityByState
  async getCityByState(stateId) {
    try {

    const cities = await City.find({state_id:stateId });

    console.log('cities',cities);
      return cities;
    }
    catch (error) {
      throw error;
    }

  }


  async get(email) {
    const student = await User.findOne({ email }).populate("plan");
    return student;
  }
  

  async getById(id) {
    const student  = await User.findById(id).populate("plan");
    return student;
  }

  async findBy(data) {
    try {
      //get user with popuplate plan
      const response = await User.findOne(data).populate("plan");
      return response;
    } catch (error) {
      throw error;
    }
  }

  // getAll tieht .populate('refer_by')
  async getAll(query) {
    try {
      const response = await User.find(query);

      if(query.refer_by && query.plan) {
        response = await User.find(query).populate('refer_by').populate('plan');
      }
      

      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export { UserRepository };

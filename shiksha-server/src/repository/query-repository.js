import Institute from "../models/Institute.js";
import Query from "../models/Query.js";
import QueryAllocation from "../models/QueryAllocation.js";
import CrudRepository from "./crud-repository.js";

class QueryRepository extends CrudRepository {
  constructor() {
    super(Query);
  }

  async getQueryByInstitute(instituteId) {
    try {
      const query = await Query.find({ instituteId : instituteId }).populate("instituteId");
      return query;

    } catch (error) {
      throw error;
    }

  }

  //queryRepository
  async QueryAllocation(data) {
    try {
      console.log("Starting query allocation...");

      // Get all queries submitted today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const queries = await Query.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "Pending"
      });

      console.log("Queries length: ", queries.length);

      if (queries.length === 0) {
        console.log("No queries found for today.");
        return;
      }

      const institutes = await Institute.find().populate("plan");

        // console.log("Institutes: ", institutes);

      const allocationData = {};
      let totalAllocation = 0;

      institutes.forEach((institute) => {
        // console.log("Institute: ", institute.plan.features);
        if (institute.plan){
        if (institute.plan.features) {
          //get Lead Allocation feature

          for(const feature of institute.plan.features) {
            if (feature.key === "Lead Allocation") {
              allocationData[institute._id] = feature.value;
              totalAllocation += parseInt(feature.value);
            }
          }

        }
      }
      });

      if (totalAllocation === 0) {
        console.log("No institutes available for query allocation.");
        return;
      }

       const sortedInstitutes = Object.entries(allocationData)
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id);


      let assignedQueries = 0;

      // Allocate queries proportionally
      for (const instituteId of sortedInstitutes) {
        const instituteAllocation = Math.floor((allocationData[instituteId] / 100) * queries.length);
        console.log("Institute allocation: ", instituteAllocation);

        const allocatedQueries = queries.splice(0, instituteAllocation);
        console.log("Allocated queries: ", allocatedQueries.length);

        // for (const query of allocatedQueries) {
        //   await QueryAllocation.create({ query: query._id, institute: instituteId });
        //   // await Query.findByIdAndUpdate(query._id, { status: "Open" });
        //   await Institute.findByIdAndUpdate(instituteId, { $push: { allocatedQueries: query._id } });
        // }

        assignedQueries += allocatedQueries.length;

        if (queries.length === 0) break;
      }

      console.log("Total allocation: ", totalAllocation);
      console.log("sortedInstitutes data: ", sortedInstitutes);

      console.log("Query allocation completed.");
    }
    catch (error) {
      throw error;
    }
  }

  //get
  async get(id) {
    try {
      const query = await Query.findById(id).populate("instituteId");
      return query;
    } catch (error) {
      throw error;
    }
  }

        
}

export { QueryRepository };

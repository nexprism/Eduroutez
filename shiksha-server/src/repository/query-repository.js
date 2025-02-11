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
      const query = await QueryAllocation.find({ institute : instituteId }).populate("query");
      return query;

    } catch (error) {
      throw error;
    }

  }

  //queryRepository
  async QueryAllocation(instituteId) {
    try {
      console.log("Starting query allocation...");

      // Get all queries submitted today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const queries = await Query.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      console.log("Queries length: ", queries.length);

      if (queries.length === 0) {
        console.log("No queries found for today.");
        return;
      }

      // Get all institutes and their plans
      const institutes = await Institute.find().populate("plan");

      let allocationData = {};
      let totalAllocation = 0;

      // Extract allocation percentage from plan features
      institutes.forEach((institute) => {
        if (institute.plan && institute.plan.features) {
          for (const feature of institute.plan.features) {
            if (feature.key === "Lead Allocation") {
              const allocationValue = parseInt(feature.value) || 0;
              allocationData[institute._id] = allocationValue;
              totalAllocation += allocationValue;
            }
          }
        }
      });

      if (totalAllocation === 0) {
        console.log("No institutes available for query allocation.");
        return;
      }

      // Sort institutes by allocation percentage (higher first)
      const sortedInstitutes = Object.entries(allocationData)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

      console.log("Total allocation: ", totalAllocation);
      console.log("Sorted Institutes: ", sortedInstitutes);

      let assignedQueries = 0;

      // Allocate queries proportionally
      for (const query of queries) {
        for (const instituteId of sortedInstitutes) {
          const allocationPercentage = allocationData[instituteId];

          // Determine if this institute should receive the query
          const shouldAllocate = Math.random() * 100 < allocationPercentage;

          if (shouldAllocate) {
            // Save allocation
            await QueryAllocation.create({ query: query._id, institute: instituteId });

            // Add query to institute's allocated list
            await Institute.findByIdAndUpdate(instituteId, {
              $push: { allocatedQueries: query._id }
            });

            //add instituteId to query

            await Query.findByIdAndUpdate(query._id, { 
              $push: { instituteIds: instituteId }
            });




            assignedQueries++;
          }
        }

      }

      console.log(`Query allocation completed. Total allocations: ${assignedQueries}`);
    } catch (error) {
      console.error("Error in query allocation:", error);
    }

  }

  //get
  async get(id) {
    try {
      const query = await Query.findById(id).populate("instituteIds",);
      return query;
    } catch (error) {
      throw error;
    }
  }

        
}

export { QueryRepository };

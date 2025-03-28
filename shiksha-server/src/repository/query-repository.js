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
  
  //getTrendingStreams
  async getTrendingStreams(filterCon = {}, sortCon = {}, pageNum = 1, limitNum = 10, populateFields = [], selectFields = {}, groupBy = {}) {
    try {
      // Ensure pagination parameters are valid
      const page = Math.max(1, parseInt(pageNum)); // Ensure page is at least 1
      const limit = Math.max(1, parseInt(limitNum)); // Ensure limit is at least 1

      // Perform aggregation
      const trendingStreams = await Query.aggregate([
        {
          $match: { ...filterCon, stream: { $exists: true, $ne: null }, level: { $exists: true, $ne: null } }, // Apply filters and ensure stream and level are set
        },
        {
          $group: {
            _id: { stream: "$stream", level: "$level" }, // Group by stream & level
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $sort: { count: -1 }, // Sort by highest query count
        },
        {
          $lookup: {
            from: "streams", // Assuming "streams" collection contains stream details
            localField: "_id.stream",
            foreignField: "_id",
            as: "streamDetails",
          },
        },
        {
          $skip: (page - 1) * limit, // Apply pagination: Skip previous pages
        },
        {
          $limit: limit, // Limit results per page
        },
      ]);

      const totalDocuments = await Query.aggregate([
        {
          $match: { ...filterCon, stream: { $exists: true, $ne: null }, level: { $exists: true, $ne: null } }, // Apply filters and ensure stream and level are set
        },
        {
          $group: {
            _id: { stream: "$stream", level: "$level" }, // Group by stream & level
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $count: "total", // Count total documents
        },
      ]);



      

      // Return the response
      return {
        result: trendingStreams,
        currentPage: page,
        totalPages: Math.ceil(totalDocuments.length > 0 ? totalDocuments[0].total / limit : 0),
        totalDocuments: totalDocuments,
      };
    } catch (error) {
      console.error("Error in getTrendingStreams:", error.message);
      throw new Error("Failed to fetch trending streams");
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
      const query = await Query.findById(id).populate({
        path: 'instituteIds',
        select: 'instituteName email phoneNumber',
        populate: {
          path: 'allocatedQueries',
          match: { _id: id }
        }
      });

      console.log('dfghj', query.instituteIds);
      return query;

    } catch (error) {
      throw error;
    }
  }

        
}

export { QueryRepository };

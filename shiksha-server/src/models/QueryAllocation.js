import mongoose from "mongoose";

const queryAllocationSchema = new mongoose.Schema({
    query: { type: mongoose.Schema.Types.ObjectId, ref: "Query" },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    allocatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Open", "Closed"], default: "Pending" },
});

const QueryAllocation = mongoose.model("QueryAllocation", queryAllocationSchema);
export default QueryAllocation;

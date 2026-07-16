import { StatusCodes } from "http-status-codes";
import { getGeoDemand } from "../services/geo-demand-service.js";

export async function geoDemandController(req, res) {
  try {
    const days = Number(req.query.days) || 365;
    const data = await getGeoDemand({ days });
    return res.status(StatusCodes.OK).json({
      success: true,
      data,
      message: "Geo demand intelligence generated",
    });
  } catch (error) {
    console.error("geoDemandController error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to generate geo demand",
    });
  }
}

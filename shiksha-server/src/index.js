import express from "express";
import cors from "cors";

import passport from "passport";
import cookieParser from "cookie-parser";
import "./config/jwt-authenticate.js";

import apiRoutes from "./routes/index.js";

import { ServerConfig } from "./config/index.js";
import { DATABASE } from "./utils/database/index.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { setupINIT } from "./utils/helpers/init.js";
const app = express();

app.use("/uploads", express.static("uploads"));
const corsOptions = {
  // origin: process.env.FRONTEND_HOST,
  origin: "*", // Allows all origins
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Eduroutez API Documentation",
      version: "1.0.0",
      description: "API documentation for the Eduroutez application",
      contact: {
        name: "Rahil A.",
        email: "developer@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${ServerConfig.PORT}`,
        description: "Development server",
      },
    ],
  },
  // Path to the API docs
  apis: ["./src/routes/v1/*.js"], // Path to your API route files
};

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Serve swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", apiRoutes);
app.listen(ServerConfig.PORT, async () => {
  console.log(`Server started on port ${ServerConfig.PORT}`);
  await DATABASE.connect(ServerConfig.DATABASE_URL);
  console.log("Mongo db connected");
  console.log("setup init");
  await setupINIT();
  console.log("setup init done");
});

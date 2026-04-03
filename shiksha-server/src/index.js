import express from "express";
import cors from "cors";
import compression from "compression";

import passport from "passport";
import cookieParser from "cookie-parser";
import "./config/jwt-authenticate.js";

import apiRoutes from "./routes/index.js";

import { ServerConfig } from "./config/index.js";
import { DATABASE } from "./utils/database/index.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { setupINIT } from "./utils/helpers/init.js";
import { initTestReminderCron } from "./utils/helpers/test-reminder-cron.js";
import { sendEmail } from "./utils/Email/email.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://admin.eduroutez.com",
    "https://eduroutez.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression()); // ✅ Enable gzip compression
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

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
  apis: ["./src/routes/v1/*.js"], // Path to your API route files
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", apiRoutes);

// Email route using centralized sendEmail utility
app.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!Array.isArray(to) || to.length === 0) {
    return res
      .status(400)
      .json({ error: "Recipient email list is empty or invalid" });
  }

  try {
    const recipients = to.join(",");
    const info = await sendEmail(recipients, subject, message);
    console.log("Email sent successfully through Gmail SMTP:", info.messageId);
    return res.status(200).json({ message: "Email sent successfully", body: info });
  } catch (error) {
    console.error("Error sending email through Gmail SMTP:", error);
    return res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

app.listen(ServerConfig.PORT, async () => {
  await DATABASE.connect(ServerConfig.DATABASE_URL);
  console.log("Mongo db connected");
  console.log("setup init");
  await setupINIT();
  console.log("setup init done");

  // Initialize background tasks
  initTestReminderCron();
  console.log("test reminder cron initialized");
});

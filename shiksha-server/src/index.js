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
import mg from "mailgun-js";
const app = express();

app.use("/uploads", express.static("uploads"));
const corsOptions = {
  // origin: process.env.FRONTEND_HOST,
  origin: ["http://localhost:5173", "http://localhost:3000"],
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

const mailgun=()=>mg({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

app.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body; // `to` is an array
  if (!Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ error: "Recipient email list is empty or invalid" });
  }

  // Convert the array of email addresses to a comma-separated string
  const recipients = to.join(",");

  const data = {
    from: '"Eduroutez" <eduroutezdigital@gmail.com>',
    to: recipients,
    subject: subject,
    html: message
  };

  console.log(data);

  mailgun().messages().send(data, (error, body) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send email", details: error });
    }
    return res.status(200).json({ message: "Email sent successfully", body });
  });
});


app.listen(ServerConfig.PORT, async () => {
  console.log(`Server started on port ${ServerConfig.PORT}`);
  await DATABASE.connect(ServerConfig.DATABASE_URL);
  console.log("Mongo db connected");
  console.log("setup init");
  await setupINIT();
  console.log("setup init done");
});

import { config } from "dotenv";
config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const SALT = process.env.SALT;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
const JWT_EMAIL_RESET_SECRET = process.env.JWT_EMAIL_RESET_SECRET_KEY;
export { PORT, DATABASE_URL, SALT, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_EMAIL_RESET_SECRET };

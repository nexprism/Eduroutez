import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../../.env");

config({ path: envPath });
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const SALT = process.env.SALT;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
const JWT_EMAIL_RESET_SECRET = process.env.JWT_EMAIL_RESET_SECRET_KEY;
const FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:3000';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || FRONTEND_HOST;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export { PORT, DATABASE_URL, SALT, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_EMAIL_RESET_SECRET, FRONTEND_HOST, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET };

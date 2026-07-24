import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authOptions = {
  scopes: ["https://www.googleapis.com/auth/calendar"],
};

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
  authOptions.keyFile = path.join(__dirname, "..", "credentials", "service-account.json");
}

const auth = new google.auth.GoogleAuth(authOptions);

const calendar = google.calendar({
  version: "v3",
  auth,
});

export default calendar;

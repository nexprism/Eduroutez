import mongoose from "mongoose";
import { ServerConfig } from "../src/config/index.js";
import { DATABASE } from "../src/utils/database/index.js";
import Activity from "../src/models/Activity.js";
import Institute from "../src/models/Institute.js";
import Course from "../src/models/Course.js";

async function seed() {
  await DATABASE.connect(ServerConfig.DATABASE_URL);
  console.log("Connected");

  const institutes = await Institute.find().limit(50).lean();
  const courses = await Course.find().limit(30).lean();

  if (!institutes.length && !courses.length) {
    console.log("No institutes or courses found");
    await mongoose.disconnect();
    return;
  }

  const users = await mongoose.connection.db
    .collection("users")
    .find()
    .limit(1)
    .toArray();

  if (!users.length) {
    console.log("No users found");
    await mongoose.disconnect();
    return;
  }

  const userId = users[0]._id;

  await Activity.deleteMany({ "metadata.seed": true });

  const now = Date.now();
  const DAY = 86400000;

  const geoActivities = [
    { targetType: "Institute", daysAgo: 10, city: "Mumbai", state: "Maharashtra" },
    { targetType: "Institute", daysAgo: 20, city: "Mumbai", state: "Maharashtra" },
    { targetType: "Institute", daysAgo: 50, city: "Pune", state: "Maharashtra" },
    { targetType: "Institute", daysAgo: 120, city: "Pune", state: "Maharashtra" },
    { targetType: "Institute", daysAgo: 15, city: "Jaipur", state: "Rajasthan" },
    { targetType: "Institute", daysAgo: 60, city: "Jaipur", state: "Rajasthan" },
    { targetType: "Institute", daysAgo: 200, city: "Jaipur", state: "Rajasthan" },
    { targetType: "Institute", daysAgo: 5, city: "Delhi", state: "Delhi" },
    { targetType: "Institute", daysAgo: 30, city: "Delhi", state: "Delhi" },
    { targetType: "Institute", daysAgo: 90, city: "Delhi", state: "Delhi" },
    { targetType: "Institute", daysAgo: 180, city: "Delhi", state: "Delhi" },
    { targetType: "Institute", daysAgo: 8, city: "Chennai", state: "Tamil Nadu" },
    { targetType: "Institute", daysAgo: 45, city: "Chennai", state: "Tamil Nadu" },
    { targetType: "Institute", daysAgo: 150, city: "Chennai", state: "Tamil Nadu" },
    { targetType: "Institute", daysAgo: 3, city: "Bengaluru", state: "Karnataka" },
    { targetType: "Institute", daysAgo: 25, city: "Bengaluru", state: "Karnataka" },
    { targetType: "Institute", daysAgo: 100, city: "Bengaluru", state: "Karnataka" },
    { targetType: "Institute", daysAgo: 210, city: "Bengaluru", state: "Karnataka" },
    { targetType: "Institute", daysAgo: 12, city: "Hyderabad", state: "Telangana" },
    { targetType: "Institute", daysAgo: 70, city: "Hyderabad", state: "Telangana" },
    { targetType: "Career", daysAgo: 14, city: "Kolkata", state: "West Bengal" },
    { targetType: "Career", daysAgo: 40, city: "Kolkata", state: "West Bengal" },
    { targetType: "Course", daysAgo: 6, city: "Ahmedabad", state: "Gujarat" },
    { targetType: "Course", daysAgo: 55, city: "Ahmedabad", state: "Gujarat" },
    { targetType: "Course", daysAgo: 130, city: "Lucknow", state: "Uttar Pradesh" },
  ];

  const inserts = [];
  for (const g of geoActivities) {
    let targetId = null;
    let targetName = g.targetType === "Institute"
      ? `${g.city} Institute of ${g.state}`
      : `${g.city} ${g.targetType}`;

    if (g.targetType === "Institute") {
      const match = institutes.find(
        (i) =>
          i.city?.name?.toLowerCase() === g.city.toLowerCase() &&
          i.state?.name?.toLowerCase() === g.state.toLowerCase()
      );
      if (match) {
        targetId = match._id;
        targetName = match.instituteName;
      }
    }
    if (g.targetType === "Course") {
      const match = courses.find(
        (c) =>
          (c.city?.toLowerCase() || c.city?.name?.toLowerCase()) === g.city.toLowerCase()
      );
      if (match) {
        targetId = match._id;
        targetName = match.courseTitle;
      }
    }

    const typeMap = {
      Institute: "wishlist_institute",
      Course: "wishlist_course",
      Career: "like_career",
    };

    inserts.push({
      user: userId,
      type: typeMap[g.targetType] || "like_career",
      targetType: g.targetType,
      targetId,
      targetName,
      createdAt: new Date(now - g.daysAgo * DAY),
      metadata: { seed: true },
    });
  }

  await Activity.insertMany(inserts);
  console.log(`Inserted ${inserts.length} geo-diverse activity signals across multiple states.`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});

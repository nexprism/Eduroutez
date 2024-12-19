import { ServerConfig } from "../../config/index.js";
import User from "../../models/User.js";
import bcrypt from "bcrypt";

export async function setupINIT() {
  try {
    // // Check if the SUPER_ADMIN role exists
    // let superAdminRole = await Role.findOne({ name: "SUPER_ADMIN" });
    // if (!superAdminRole) {
    //   superAdminRole = await Role.create({ name: "SUPER_ADMIN", permissions: [] });
    //   console.log("SUPER_ADMIN role created.");
    // } else {
    //   console.log("SUPER_ADMIN role already exists. skipping...");
    // }

    // Check if a SUPER_ADMIN user exists
    const superAdminUser = await User.findOne({ email: "superadmin@gmail.com" });
    if (!superAdminUser) {
      const hashedPassword = await bcrypt.hash("465@$ddhg%$%$vfDFC53", +ServerConfig.SALT);
      await User.create({
        email: "superadmin@gmail.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      });
      console.log("SUPER_ADMIN user created.");
    } else {
      console.log("SUPER_ADMIN user already exists. skipping...");
    }
  } catch (error) {
    console.error("Error initializing SUPER_ADMIN:", error);
  }
}

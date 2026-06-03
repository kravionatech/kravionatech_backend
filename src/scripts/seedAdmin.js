/**
 * seedAdmin.js — Super-admin user seed
 * Creates kravionatech@gmail.com / Asdf@123 as super_admin (idempotent)
 * Run:  node src/scripts/seedAdmin.js
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { databaseConnection } from "../config/db.js";
import { UserModel } from "../models/user.model.js";

const ADMIN = {
  name: "Kraviona Admin",
  email: "kravionatech@gmail.com",
  username: "kravionaadmin",
  phone: "+919608553167",
  password: "Asdf@123",
  role: "super_admin",
  isVerified: true,
  isActive: true,
};

const run = async () => {
  await databaseConnection();
  console.log("\n🌱  Seeding super-admin user...\n");

  const hashed = bcrypt.hashSync(ADMIN.password, 10);

  const existing = await UserModel.findOne({ email: ADMIN.email }).select("_id email role");

  if (existing) {
    // Update password + role (idempotent)
    await UserModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          password: hashed,
          role: "super_admin",
          isVerified: true,
          isActive: true,
          "verification.isVerified": true,
        },
      }
    );
    console.log(`  ✅ Updated existing user: ${ADMIN.email}`);
  } else {
    await UserModel.create({
      name: ADMIN.name,
      email: ADMIN.email,
      username: ADMIN.username,
      phone: ADMIN.phone,
      password: hashed,
      role: ADMIN.role,
      isVerified: true,
      isActive: true,
      verification: { isVerified: true, emailOtp: null },
    });
    console.log(`  ✅ Created new super-admin: ${ADMIN.email}`);
  }

  console.log(`\n🎉  Admin seed complete!`);
  console.log(`   Email   : ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  console.log(`   Role    : super_admin\n`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

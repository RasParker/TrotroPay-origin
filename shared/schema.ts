import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  pin: text("pin").notNull(),
  role: text("role").notNull(), // passenger, mate, driver, owner
  name: text("name").notNull(),
  momoBalance: decimal("momo_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().unique(), // e.g., GT-1234-20
  route: text("route").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  mateId: integer("mate_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  stops: text("stops").array().notNull(),
  fares: text("fares").array().notNull(), // JSON string array of stop:fare pairs
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  passengerId: integer("passenger_id").references(() => users.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  mateId: integer("mate_id").references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  ownerId: integer("owner_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  destination: text("destination").notNull(),
  route: text("route").notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  paymentMethod: text("payment_method").notNull().default("momo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id),
  driverCommission: decimal("driver_commission", { precision: 5, scale: 2 }).notNull().default("15.00"),
  mateCommission: decimal("mate_commission", { precision: 5, scale: 2 }).notNull().default("10.00"),
  platformFee: decimal("platform_fee", { precision: 5, scale: 2 }).notNull().default("5.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

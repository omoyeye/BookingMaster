import { pgTable, text, serial, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  frequency: text("frequency").notNull(),
  duration: integer("duration").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  toilets: integer("toilets"),
  livingRooms: integer("living_rooms"),
  kitchen: integer("kitchen"),
  utilityRoom: integer("utility_room"),
  carpetCleaning: integer("carpet_cleaning"),
  notifyMoreTime: boolean("notify_more_time").default(false),
  propertyType: text("property_type"),
  propertyStatus: text("property_status"),
  surfaceType: text("surface_type"),
  surfaceMaterial: text("surface_material"),
  squareFootage: integer("square_footage"),
  bookingDate: text("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  specialInstructions: text("special_instructions"),
  quoteRequest: text("quote_request"),
  smsReminders: boolean("sms_reminders").default(false),
  tipPercentage: integer("tip_percentage").default(0),
  customTip: decimal("custom_tip"),
  selectedExtras: jsonb("selected_extras").$type<string[]>().default([]),
  basePrice: decimal("base_price").notNull(),
  extrasTotal: decimal("extras_total").default("0"),
  tipAmount: decimal("tip_amount").default("0"),
  totalPrice: decimal("total_price").notNull(),
});

export const serviceExtras = pgTable("service_extras", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  duration: text("duration"), // Duration in format like "1hr", "45mins", "1hr:30mins"
});

// Admin authentication table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Will be hashed
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  lastLogin: text("last_login"),
});

// Customer reminders table
export const customerReminders = pgTable("customer_reminders", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  reminderType: text("reminder_type").notNull().default("24_hour"), // "24_hour", "custom"
  message: text("message").notNull(),
  scheduledAt: text("scheduled_at").notNull(), // When to send the reminder
  sentAt: text("sent_at"), // When the reminder was actually sent
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed"
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  createdBy: integer("created_by").notNull(), // Admin user ID who created the reminder
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertServiceExtraSchema = createInsertSchema(serviceExtras).omit({
  id: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertCustomerReminderSchema = createInsertSchema(customerReminders).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertServiceExtra = z.infer<typeof insertServiceExtraSchema>;
export type ServiceExtra = typeof serviceExtras.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertCustomerReminder = z.infer<typeof insertCustomerReminderSchema>;
export type CustomerReminder = typeof customerReminders.$inferSelect;

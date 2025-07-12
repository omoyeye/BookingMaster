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

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertServiceExtraSchema = createInsertSchema(serviceExtras).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertServiceExtra = z.infer<typeof insertServiceExtraSchema>;
export type ServiceExtra = typeof serviceExtras.$inferSelect;

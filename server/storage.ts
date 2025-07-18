import { 
  users, 
  bookings, 
  serviceExtras, 
  adminUsers, 
  customerReminders,
  type User, 
  type InsertUser, 
  type Booking, 
  type InsertBooking, 
  type ServiceExtra, 
  type InsertServiceExtra,
  type AdminUser,
  type InsertAdminUser,
  type CustomerReminder,
  type InsertCustomerReminder,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getServiceExtras(serviceType: string): Promise<ServiceExtra[]>;
  createServiceExtra(extra: InsertServiceExtra): Promise<ServiceExtra>;
  
  // Admin authentication methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: number): Promise<void>;
  
  // Customer reminder methods
  createCustomerReminder(reminder: InsertCustomerReminder): Promise<CustomerReminder>;
  getCustomerReminder(id: number): Promise<CustomerReminder | undefined>;
  getCustomerRemindersByBooking(bookingId: number): Promise<CustomerReminder[]>;
  getAllPendingReminders(): Promise<CustomerReminder[]>;
  updateReminderStatus(id: number, status: string, sentAt?: string): Promise<void>;
  getAllReminders(): Promise<CustomerReminder[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getServiceExtras(serviceType: string): Promise<ServiceExtra[]> {
    return await db.select().from(serviceExtras).where(eq(serviceExtras.serviceType, serviceType));
  }

  async createServiceExtra(insertExtra: InsertServiceExtra): Promise<ServiceExtra> {
    const [extra] = await db
      .insert(serviceExtras)
      .values(insertExtra)
      .returning();
    return extra;
  }

  // Admin authentication methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return adminUser || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return adminUser || undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const [adminUser] = await db
      .insert(adminUsers)
      .values(insertAdminUser)
      .returning();
    return adminUser;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(adminUsers.id, id));
  }

  // Customer reminder methods
  async createCustomerReminder(insertReminder: InsertCustomerReminder): Promise<CustomerReminder> {
    const [reminder] = await db
      .insert(customerReminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async getCustomerReminder(id: number): Promise<CustomerReminder | undefined> {
    const [reminder] = await db.select().from(customerReminders).where(eq(customerReminders.id, id));
    return reminder || undefined;
  }

  async getCustomerRemindersByBooking(bookingId: number): Promise<CustomerReminder[]> {
    return await db.select().from(customerReminders).where(eq(customerReminders.bookingId, bookingId));
  }

  async getAllPendingReminders(): Promise<CustomerReminder[]> {
    return await db.select().from(customerReminders).where(eq(customerReminders.status, "pending"));
  }

  async updateReminderStatus(id: number, status: string, sentAt?: string): Promise<void> {
    const updateData: any = { status };
    if (sentAt) {
      updateData.sentAt = sentAt;
    }
    await db
      .update(customerReminders)
      .set(updateData)
      .where(eq(customerReminders.id, id));
  }

  async getAllReminders(): Promise<CustomerReminder[]> {
    return await db.select().from(customerReminders);
  }
}

export const storage = new DatabaseStorage();
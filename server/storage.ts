import { users, bookings, serviceExtras, type User, type InsertUser, type Booking, type InsertBooking, type ServiceExtra, type InsertServiceExtra } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getServiceExtras(serviceType: string): Promise<ServiceExtra[]>;
  createServiceExtra(extra: InsertServiceExtra): Promise<ServiceExtra>;
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
      .values([insertBooking])
      .returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
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
}

export const storage = new DatabaseStorage();
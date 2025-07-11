import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { sendCustomerConfirmationEmail, sendOwnerNotificationEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get service extras by service type
  app.get("/api/service-extras/:serviceType", async (req, res) => {
    try {
      const serviceType = req.params.serviceType;
      const extras = await storage.getServiceExtras(serviceType);
      res.json(extras);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service extras" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Send confirmation emails (non-blocking)
      sendCustomerConfirmationEmail(booking).catch(error => {
        console.error('Failed to send customer confirmation email:', error);
      });
      
      sendOwnerNotificationEmail(booking).catch(error => {
        console.error('Failed to send owner notification email:', error);
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

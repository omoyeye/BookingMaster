import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, type Booking } from "@shared/schema";
import { z } from "zod";
import { sendCustomerConfirmationEmail, sendOwnerNotificationEmail } from "./email-service";

// Calendar conflict detection utility
function detectCalendarConflicts(bookings: Booking[]) {
  const conflicts: { booking1: Booking; booking2: Booking; overlapMinutes: number }[] = [];
  
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const booking1 = bookings[i];
      const booking2 = bookings[j];
      
      // Only check bookings on the same date
      if (booking1.bookingDate === booking2.bookingDate) {
        const time1 = parseTimeToMinutes(booking1.bookingTime);
        const time2 = parseTimeToMinutes(booking2.bookingTime);
        const duration1 = booking1.duration * 60; // Convert hours to minutes
        const duration2 = booking2.duration * 60;
        
        // Check for overlap
        const end1 = time1 + duration1;
        const end2 = time2 + duration2;
        
        const overlapStart = Math.max(time1, time2);
        const overlapEnd = Math.min(end1, end2);
        
        if (overlapStart < overlapEnd) {
          conflicts.push({
            booking1,
            booking2,
            overlapMinutes: overlapEnd - overlapStart
          });
        }
      }
    }
  }
  
  return conflicts;
}

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
      console.error('Booking creation error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(500).json({ message: "Failed to create booking", error: error.message });
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

  // Admin endpoints
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Admin bookings fetch error:', error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/conflicts", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      const conflicts = detectCalendarConflicts(bookings);
      res.json(conflicts);
    } catch (error) {
      console.error('Admin conflicts fetch error:', error);
      res.status(500).json({ message: "Failed to detect conflicts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

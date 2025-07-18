import { storage } from './storage';
import { sendReminderEmail } from './email-service';
import type { CustomerReminder, Booking } from '@shared/schema';

export class ReminderService {
  private static instance: ReminderService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // Start the reminder service (check every hour)
  start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    console.log('Starting reminder service...');
    this.intervalId = setInterval(async () => {
      await this.processPendingReminders();
    }, 60 * 60 * 1000); // Check every hour

    // Also check immediately on startup
    this.processPendingReminders();
  }

  // Stop the reminder service
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Reminder service stopped');
    }
  }

  // Process all pending reminders
  private async processPendingReminders(): Promise<void> {
    try {
      const pendingReminders = await storage.getAllPendingReminders();
      const now = new Date();

      for (const reminder of pendingReminders) {
        const scheduledTime = new Date(reminder.scheduledAt);
        
        // Check if it's time to send the reminder
        if (scheduledTime <= now) {
          await this.sendReminder(reminder);
        }
      }
    } catch (error) {
      console.error('Error processing pending reminders:', error);
    }
  }

  // Send a single reminder
  private async sendReminder(reminder: CustomerReminder): Promise<void> {
    try {
      // Get the booking details
      const booking = await storage.getBooking(reminder.bookingId);
      if (!booking) {
        console.error(`Booking not found for reminder ${reminder.id}`);
        await storage.updateReminderStatus(reminder.id, 'failed');
        return;
      }

      // Send email reminder
      const success = await this.sendEmailReminder(booking, reminder.message);
      
      if (success) {
        await storage.updateReminderStatus(reminder.id, 'sent', new Date().toISOString());
        console.log(`Reminder sent successfully for booking ${booking.id}`);
      } else {
        await storage.updateReminderStatus(reminder.id, 'failed');
        console.error(`Failed to send reminder for booking ${booking.id}`);
      }
    } catch (error) {
      console.error(`Error sending reminder ${reminder.id}:`, error);
      await storage.updateReminderStatus(reminder.id, 'failed');
    }
  }

  // Send email reminder to customer
  private async sendEmailReminder(booking: Booking, reminderMessage: string): Promise<boolean> {
    try {
      return await sendReminderEmail(booking, reminderMessage);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }

  // Create a reminder for a booking (24 hours before)
  async createBookingReminder(bookingId: number, adminId: number, customMessage?: string): Promise<CustomerReminder | null> {
    try {
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate 24 hours before the booking
      const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`);
      const reminderDateTime = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000);

      const defaultMessage = `This is a friendly reminder that your ${this.getServiceName(booking.serviceType)} appointment is scheduled for tomorrow at ${this.formatTime(booking.bookingTime)}. We look forward to providing you with excellent service!`;

      const reminderData = {
        bookingId,
        reminderType: 'custom' as const,
        message: customMessage || defaultMessage,
        scheduledAt: reminderDateTime.toISOString(),
        status: 'pending' as const,
        createdBy: adminId,
      };

      return await storage.createCustomerReminder(reminderData);
    } catch (error) {
      console.error('Error creating booking reminder:', error);
      return null;
    }
  }

  // Auto-create reminders for all bookings that don't have them
  async createMissingReminders(adminId: number): Promise<number> {
    try {
      const allBookings = await storage.getAllBookings();
      let created = 0;

      for (const booking of allBookings) {
        // Check if booking already has a reminder
        const existingReminders = await storage.getCustomerRemindersByBooking(booking.id);
        
        if (existingReminders.length === 0) {
          // Only create reminder for future bookings
          const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`);
          const now = new Date();
          
          if (bookingDateTime > now) {
            const reminder = await this.createBookingReminder(booking.id, adminId);
            if (reminder) {
              created++;
            }
          }
        }
      }

      return created;
    } catch (error) {
      console.error('Error creating missing reminders:', error);
      return 0;
    }
  }

  // Helper methods
  private getServiceName(serviceType: string): string {
    const names = {
      general: 'General Cleaning',
      deep: 'Deep Cleaning',
      tenancy: 'End of Tenancy Cleaning',
      airbnb: 'AirBnB Cleaning',
      commercial: 'Commercial Cleaning',
      jet: 'Jet Washing/Garden Cleaning'
    };
    return names[serviceType] || serviceType;
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}

// Export singleton instance
export const reminderService = ReminderService.getInstance();
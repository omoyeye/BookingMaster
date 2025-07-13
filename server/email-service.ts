import nodemailer from 'nodemailer';
import { Booking } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration - using gmail as default
const emailConfig: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'info@urinakcleaning.co.uk',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export async function sendCustomerConfirmationEmail(booking: Booking): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"URINAKCLEANING" <info@urinakcleaning.co.uk>',
      to: booking.email,
      subject: `Booking Confirmation #${booking.id} - URINAKCLEANING`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #2563eb; margin: 0;">URINAKCLEANING</h1>
            <p style="margin: 5px 0; color: #666;">Professional Cleaning Services</p>
            <p style="margin: 5px 0; color: #666;">86a High Street Beckenham, Kent, London BR3 1ED</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for your booking!</h2>
            
            <p>Dear ${booking.fullName},</p>
            
            <p>We're excited to confirm your cleaning service booking. Here are your booking details:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Booking Information</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Service Type:</strong> ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Cleaning</p>
              <p><strong>Date:</strong> ${booking.bookingDate}</p>
              <p><strong>Time:</strong> ${booking.bookingTime}</p>
              <p><strong>Duration:</strong> ${booking.duration} hours</p>
              <p><strong>Frequency:</strong> ${booking.frequency}</p>
              <p><strong>Total Amount:</strong> £${booking.totalPrice}</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Service Address</h3>
              <p>
                ${booking.address1}<br>
                ${booking.address2 ? booking.address2 + '<br>' : ''}
                ${booking.city}, ${booking.postcode}
              </p>
            </div>
            
            ${booking.selectedExtras && booking.selectedExtras.length > 0 ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Additional Services</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${booking.selectedExtras.map(extra => `<li>${extra}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
              <p>Our support team will contact you within 24 hours to confirm your booking and answer any questions you may have.</p>
              <p>If you need to make any changes or have questions, please contact us immediately.</p>
            </div>
            
            <div style="margin-top: 30px;">
              <h3 style="color: #374151;">Contact Information</h3>
              <p>For any questions or changes to your booking, please contact us:</p>
              <p><strong>Phone:</strong> +44-7786687791</p>
              <p><strong>Email:</strong> info@urinakcleaning.co.uk</p>
              <p><strong>Business Hours:</strong> Monday - Sunday, 8:00 AM - 6:00 PM</p>
            </div>
            
            <p style="margin-top: 30px;">Thank you for choosing URINAKCLEANING for your cleaning needs!</p>
            <p>We look forward to serving you!</p>
            
            <p>Best regards,<br>
            The URINAKCLEANING Team</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              This is an automated confirmation email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    return false;
  }
}

export async function sendOwnerNotificationEmail(booking: Booking): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"URINAKCLEANING Booking System" <noreply@urinakcleaning.co.uk>',
      to: 'info@urinakcleaning.co.uk',
      subject: `New Booking Alert #${booking.id} - ${booking.serviceType} Cleaning`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NEW BOOKING ALERT</h1>
            <p style="margin: 5px 0; color: #fca5a5;">URINAKCLEANING</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">You have a new booking!</h2>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">Booking Summary</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Service Type:</strong> ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Cleaning</p>
              <p><strong>Date & Time:</strong> ${booking.bookingDate} at ${booking.bookingTime}</p>
              <p><strong>Duration:</strong> ${booking.duration} hours</p>
              <p><strong>Frequency:</strong> ${booking.frequency}</p>
              <p><strong>Total Amount:</strong> £${booking.totalPrice}</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${booking.fullName}</p>
              <p><strong>Email:</strong> ${booking.email}</p>
              <p><strong>Phone:</strong> ${booking.phone}</p>
              <p><strong>Address:</strong><br>
                ${booking.address1}<br>
                ${booking.address2 ? booking.address2 + '<br>' : ''}
                ${booking.city}, ${booking.postcode}
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Property Details</h3>
              ${booking.bedrooms ? `<p><strong>Bedrooms:</strong> ${booking.bedrooms}</p>` : ''}
              ${booking.bathrooms ? `<p><strong>Bathrooms:</strong> ${booking.bathrooms}</p>` : ''}
              ${booking.toilets ? `<p><strong>Toilets:</strong> ${booking.toilets}</p>` : ''}
              ${booking.livingRooms ? `<p><strong>Living Rooms:</strong> ${booking.livingRooms}</p>` : ''}
              ${booking.propertyType ? `<p><strong>Property Type:</strong> ${booking.propertyType}</p>` : ''}
              ${booking.surfaceType ? `<p><strong>Surface Type:</strong> ${booking.surfaceType}</p>` : ''}
              ${booking.squareFootage ? `<p><strong>Square Footage:</strong> ${booking.squareFootage} sq ft</p>` : ''}
            </div>
            
            ${booking.selectedExtras && booking.selectedExtras.length > 0 ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Additional Services</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${booking.selectedExtras.map(extra => `<li>${extra}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Pricing Breakdown</h3>
              <p><strong>Base Price:</strong> £${booking.basePrice}</p>
              <p><strong>Additional Services:</strong> £${booking.extrasTotal}</p>
              <p><strong>Tip:</strong> £${booking.tipAmount}</p>
              <p style="font-size: 18px; color: #dc2626;"><strong>TOTAL: £${booking.totalPrice}</strong></p>
            </div>
            
            ${booking.specialInstructions ? `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Special Instructions</h3>
              <p style="white-space: pre-wrap;">${booking.specialInstructions}</p>
            </div>
            ` : ''}
            
            ${booking.quoteRequest ? `
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0369a1; margin-top: 0;">Quote Request Details</h3>
              <p style="white-space: pre-wrap;">${booking.quoteRequest}</p>
              <p style="margin-top: 15px; padding: 10px; background-color: #e0f2fe; border-radius: 4px; color: #0369a1;">
                <strong>Action Required:</strong> This customer requires a custom quote. Please review their requirements and provide a personalized quote within 24 hours.
              </p>
            </div>
            ` : ''}
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e40af; margin-top: 0;">Action Required</h3>
              <p>Please contact the customer within 24 hours to confirm the booking and schedule the service.</p>
              <p>Customer confirmation email has been sent automatically.</p>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              CleanPro Services - Booking Management System
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending owner notification email:', error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}
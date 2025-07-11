import { db } from "./db";
import { serviceExtras } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Clear existing service extras
  await db.delete(serviceExtras);
  
  // Insert service extras
  const extras = [
    // General/Standard Cleaning
    { serviceType: 'general', name: 'Oven Cleaning', description: 'Deep clean inside and outside of oven', price: '25' },
    { serviceType: 'general', name: 'Fridge Cleaning', description: 'Inside and outside fridge cleaning', price: '20' },
    { serviceType: 'general', name: 'Interior Windows', description: 'Clean interior windows and sills', price: '15' },
    { serviceType: 'general', name: 'Inside Cupboards', description: 'Clean inside kitchen cupboards', price: '30' },
    
    // Deep Cleaning
    { serviceType: 'deep', name: 'Oven Deep Clean', description: 'Intensive oven cleaning with degreasing', price: '35' },
    { serviceType: 'deep', name: 'Carpet Deep Clean', description: 'Professional carpet cleaning', price: '40' },
    { serviceType: 'deep', name: 'Window Deep Clean', description: 'Interior and exterior window cleaning', price: '25' },
    { serviceType: 'deep', name: 'Appliance Deep Clean', description: 'All kitchen appliances cleaned', price: '45' },
    
    // End of Tenancy
    { serviceType: 'tenancy', name: 'Oven Professional Clean', description: 'Guaranteed oven cleaning for deposit', price: '50' },
    { serviceType: 'tenancy', name: 'Carpet Professional Clean', description: 'Professional carpet cleaning for deposit', price: '60' },
    { serviceType: 'tenancy', name: 'Wall Washing', description: 'Clean walls and remove marks', price: '40' },
    { serviceType: 'tenancy', name: 'Garage/Shed Clean', description: 'Clean garage or shed areas', price: '30' },
    
    // AirBnB Cleaning
    { serviceType: 'airbnb', name: 'Linen Change', description: 'Fresh linen and towels provided', price: '20' },
    { serviceType: 'airbnb', name: 'Welcome Pack Setup', description: 'Setup welcome amenities', price: '15' },
    { serviceType: 'airbnb', name: 'Key Management', description: 'Handle guest key exchange', price: '10' },
    { serviceType: 'airbnb', name: 'Inventory Check', description: 'Check and report inventory status', price: '12' },
    
    // Jet Washing/Garden Cleaning
    { serviceType: 'jet', name: 'Driveway Sealing', description: 'Apply protective sealant after cleaning', price: '80' },
    { serviceType: 'jet', name: 'Moss Treatment', description: 'Remove and treat moss growth', price: '35' },
    { serviceType: 'jet', name: 'Gutter Cleaning', description: 'Clean gutters and downspouts', price: '45' },
    { serviceType: 'jet', name: 'Patio Furniture Clean', description: 'Clean outdoor furniture', price: '25' },
    
    // Commercial Cleaning
    { serviceType: 'commercial', name: 'Floor Waxing', description: 'Professional floor waxing service', price: '100' },
    { serviceType: 'commercial', name: 'Carpet Cleaning', description: 'Commercial carpet cleaning', price: '80' },
    { serviceType: 'commercial', name: 'Window Cleaning', description: 'Interior and exterior commercial windows', price: '60' },
    { serviceType: 'commercial', name: 'Disinfection Service', description: 'Full disinfection of premises', price: '120' },
  ];

  await db.insert(serviceExtras).values(extras);
  
  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);
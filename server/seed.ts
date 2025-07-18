import { db } from "./db";
import { serviceExtras, adminUsers } from "@shared/schema";
import bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Clear existing service extras
  await db.delete(serviceExtras);
  
  // Insert service extras - applies to all service types
  const baseExtras = [
    // Additional rooms not covered in property details
    { name: 'Conservatory', description: 'Conservatory cleaning', price: '30' },
    { name: 'Patio/balcony', description: 'Patio or balcony cleaning', price: '30' },
    { name: 'Study', description: 'Study room cleaning', price: '20' },
    { name: 'Hallway/Staircase', description: 'Hallway and staircase cleaning', price: '10' },
    
    // Kitchen Appliances
    { name: 'Single Oven', description: 'Single oven deep clean', price: '35' },
    { name: 'Double Oven', description: 'Double oven deep clean', price: '50' },
    { name: 'Range Oven', description: 'Range oven deep clean', price: '70' },
    { name: 'Single Fridge', description: 'Single fridge cleaning', price: '35' },
    { name: 'Double Fridge', description: 'Double fridge cleaning', price: '55' },
    { name: 'Washer', description: 'Washing machine cleaning', price: '20' },
    { name: 'Dryer', description: 'Dryer cleaning', price: '20' },
    { name: 'Dishwasher', description: 'Dishwasher cleaning', price: '20' },
    
    // Furniture (Carpet cleaning is handled in property details)
    { name: 'Single mattress', description: 'Single mattress cleaning', price: '25' },
    { name: 'Double mattress', description: 'Double mattress cleaning', price: '35' },
    { name: 'King size mattress', description: 'King size mattress cleaning', price: '45' },
    { name: 'Arm chair', description: 'Armchair cleaning', price: '20' },
    { name: '2 seater sofa', description: '2 seater sofa cleaning', price: '30' },
    { name: '3 seater sofa', description: '3 seater sofa cleaning', price: '40' },
    
    // Windows & Blinds
    { name: 'Reachable external window', description: 'External window cleaning', price: '5' },
    { name: 'Window blind', description: 'Window blind cleaning', price: '10' },
  ];

  // Create extras for each service type
  const extras = [];
  const serviceTypes = ['general', 'deep', 'tenancy', 'airbnb', 'jet', 'commercial'];
  
  serviceTypes.forEach(serviceType => {
    baseExtras.forEach(extra => {
      extras.push({
        serviceType,
        name: extra.name,
        description: extra.description,
        price: extra.price
      });
    });
    
    // Add special AirBnB-specific services
    if (serviceType === 'airbnb') {
      const airbnbExtras = [
        { name: 'External Laundry (per bed set)', description: 'External laundry service per bed set', price: '20' },
        { name: 'Ironing Service', description: 'Professional ironing service', price: '15' },
        { name: 'Internal Laundry', description: 'Internal laundry service (FREE)', price: '0' }
      ];
      
      airbnbExtras.forEach(extra => {
        extras.push({
          serviceType,
          name: extra.name,
          description: extra.description,
          price: extra.price
        });
      });
    }
  });

  await db.insert(serviceExtras).values(extras);
  
  // Insert default admin user
  console.log("Creating default admin user...");
  
  // Clear existing admin users
  await db.delete(adminUsers);
  
  // Hash the default admin password
  const hashedPassword = await bcrypt.hash('admin123!', 10);
  
  // Create default admin user
  await db.insert(adminUsers).values({
    username: 'urinak',
    password: hashedPassword,
    email: 'info@urinakcleaning.co.uk',
    role: 'admin'
  });
  
  console.log(`Seeded ${extras.length} service extras`);
  console.log("Created default admin user: urinak / admin123!");
  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);
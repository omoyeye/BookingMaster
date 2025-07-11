import { bookings, serviceExtras, type Booking, type InsertBooking, type ServiceExtra, type InsertServiceExtra } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getServiceExtras(serviceType: string): Promise<ServiceExtra[]>;
  createServiceExtra(extra: InsertServiceExtra): Promise<ServiceExtra>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private bookings: Map<number, Booking>;
  private serviceExtras: Map<number, ServiceExtra>;
  private currentUserId: number;
  private currentBookingId: number;
  private currentExtraId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.serviceExtras = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentExtraId = 1;
    this.initializeServiceExtras();
  }

  private initializeServiceExtras() {
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
      
      // Jet Washing
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

    extras.forEach(extra => {
      const id = this.currentExtraId++;
      this.serviceExtras.set(id, { id, ...extra });
    });
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      // Convert undefined values to null for optional fields
      bedrooms: insertBooking.bedrooms ?? null,
      bathrooms: insertBooking.bathrooms ?? null,
      toilets: insertBooking.toilets ?? null,
      livingRooms: insertBooking.livingRooms ?? null,
      propertyType: insertBooking.propertyType ?? null,
      propertyStatus: insertBooking.propertyStatus ?? null,
      surfaceType: insertBooking.surfaceType ?? null,
      surfaceMaterial: insertBooking.surfaceMaterial ?? null,
      squareFootage: insertBooking.squareFootage ?? null,
      address2: insertBooking.address2 ?? null,
      specialInstructions: insertBooking.specialInstructions ?? null,
      customTip: insertBooking.customTip ?? null,
      smsReminders: insertBooking.smsReminders ?? false,
      tipPercentage: insertBooking.tipPercentage ?? 0,
      selectedExtras: insertBooking.selectedExtras ?? [],
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getServiceExtras(serviceType: string): Promise<ServiceExtra[]> {
    return Array.from(this.serviceExtras.values()).filter(
      (extra) => extra.serviceType === serviceType
    );
  }

  async createServiceExtra(insertExtra: InsertServiceExtra): Promise<ServiceExtra> {
    const id = this.currentExtraId++;
    const extra: ServiceExtra = { ...insertExtra, id };
    this.serviceExtras.set(id, extra);
    return extra;
  }
}

export const storage = new MemStorage();

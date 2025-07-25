import { 
  users, vehicles, routes, transactions, commissions,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type Route, type InsertRoute,
  type Transaction, type InsertTransaction,
  type Commission, type InsertCommission
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: string): Promise<User | undefined>;

  // Vehicles
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | undefined>;
  getVehiclesByOwnerId(ownerId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;

  // Routes
  getRoute(id: number): Promise<Route | undefined>;
  getRouteByName(name: string): Promise<Route | undefined>;
  getAllRoutes(): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]>;
  getTodaysTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Commissions
  getCommissionByOwnerId(ownerId: number): Promise<Commission | undefined>;
  createCommission(commission: InsertCommission): Promise<Commission>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ momoBalance: balance })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.vehicleId, vehicleId));
    return vehicle || undefined;
  }

  async getVehiclesByOwnerId(ownerId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.ownerId, ownerId));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle || undefined;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async getRouteByName(name: string): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.name, name));
    return route || undefined;
  }

  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db
      .insert(routes)
      .values(insertRoute)
      .returning();
    return route;
  }

  async updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined> {
    const [route] = await db
      .update(routes)
      .set(updates)
      .where(eq(routes.id, id))
      .returning();
    return route || undefined;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.passengerId, userId));
  }

  async getTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.vehicleId, vehicleId));
  }

  async getTodaysTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.vehicleId, vehicleId),
          gte(transactions.createdAt, today)
        )
      );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getCommissionByOwnerId(ownerId: number): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.ownerId, ownerId));
    return commission || undefined;
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const [commission] = await db
      .insert(commissions)
      .values(insertCommission)
      .returning();
    return commission;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private routes: Map<number, Route>;
  private transactions: Map<number, Transaction>;
  private commissions: Map<number, Commission>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.routes = new Map();
    this.transactions = new Map();
    this.commissions = new Map();
    this.currentId = 1;
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create test users
    const passenger: User = {
      id: this.currentId++,
      phone: "0245678901",
      pin: "1234",
      role: "passenger",
      name: "Kwame Asante",
      momoBalance: "25.40",
      createdAt: new Date(),
    };
    this.users.set(passenger.id, passenger);

    const mate: User = {
      id: this.currentId++,
      phone: "0234567890",
      pin: "1234",
      role: "mate",
      name: "Kofi Mate",
      momoBalance: "0.00",
      createdAt: new Date(),
    };
    this.users.set(mate.id, mate);

    const driver: User = {
      id: this.currentId++,
      phone: "0223456789",
      pin: "1234",
      role: "driver",
      name: "John Mensah",
      momoBalance: "0.00",
      createdAt: new Date(),
    };
    this.users.set(driver.id, driver);

    const owner: User = {
      id: this.currentId++,
      phone: "0212345678",
      pin: "1234",
      role: "owner",
      name: "Mary Owner",
      momoBalance: "0.00",
      createdAt: new Date(),
    };
    this.users.set(owner.id, owner);

    // Create test routes
    const route1: Route = {
      id: this.currentId++,
      code: "192",
      name: "Circle - Lapaz",
      startPoint: "Circle",
      endPoint: "Lapaz",
      stops: ["Circle", "37 Station", "Achimota", "Lapaz"],
      fares: ["Circle:0.00", "37 Station:2.00", "Achimota:2.50", "Lapaz:3.50"],
      createdAt: new Date(),
    };
    this.routes.set(route1.id, route1);

    const route2: Route = {
      id: this.currentId++,
      code: "207",
      name: "Tema - Accra",
      startPoint: "Tema",
      endPoint: "Accra",
      stops: ["Tema", "Ashaiman", "Teshie", "Accra"],
      fares: ["Tema:0.00", "Ashaiman:2.50", "Teshie:3.00", "Accra:4.00"],
      createdAt: new Date(),
    };
    this.routes.set(route2.id, route2);

    // Create test vehicles
    const vehicle1: Vehicle = {
      id: this.currentId++,
      vehicleId: "GT-1234-20",
      route: "Circle - Lapaz",
      ownerId: owner.id,
      driverId: driver.id,
      mateId: mate.id,
      isActive: true,
      createdAt: new Date(),
    };
    this.vehicles.set(vehicle1.id, vehicle1);

    const vehicle2: Vehicle = {
      id: this.currentId++,
      vehicleId: "GT-5678-19",
      route: "Tema - Accra",
      ownerId: owner.id,
      driverId: driver.id,
      mateId: mate.id,
      isActive: true,
      createdAt: new Date(),
    };
    this.vehicles.set(vehicle2.id, vehicle2);

    // Create a driver without initial route assignment for testing
    const newDriver: User = {
      id: this.currentId++,
      phone: "0244567890",
      pin: "1234",
      role: "driver",
      name: "Samuel Tetteh",
      momoBalance: "0.00",
      createdAt: new Date(),
    };
    this.users.set(newDriver.id, newDriver);

    // Vehicle without route for initial selection testing
    const vehicleNoRoute: Vehicle = {
      id: this.currentId++,
      vehicleId: "GT-9999-21",
      route: null,
      ownerId: owner.id,
      driverId: newDriver.id,
      mateId: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.vehicles.set(vehicleNoRoute.id, vehicleNoRoute);

    // Create test commission
    const commission: Commission = {
      id: this.currentId++,
      ownerId: owner.id,
      driverCommission: "15.00",
      mateCommission: "10.00",
      platformFee: "5.00",
      createdAt: new Date(),
    };
    this.commissions.set(commission.id, commission);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser,
      id, 
      momoBalance: insertUser.momoBalance || "0.00",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.momoBalance = balance;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(vehicle => vehicle.vehicleId === vehicleId);
  }

  async getVehiclesByOwnerId(ownerId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.ownerId === ownerId);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentId++;
    const vehicle: Vehicle = { 
      ...insertVehicle,
      id, 
      ownerId: insertVehicle.ownerId || null,
      driverId: insertVehicle.driverId || null,
      mateId: insertVehicle.mateId || null,
      isActive: insertVehicle.isActive ?? true,
      createdAt: new Date() 
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (vehicle) {
      const updated = { ...vehicle, ...updates };
      this.vehicles.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getRouteByName(name: string): Promise<Route | undefined> {
    return Array.from(this.routes.values()).find(route => route.name === name);
  }

  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.currentId++;
    const route: Route = { 
      ...insertRoute, 
      id, 
      createdAt: new Date() 
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (route) {
      const updated = { ...route, ...updates };
      this.routes.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.passengerId === userId
    );
  }

  async getTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.vehicleId === vehicleId
    );
  }

  async getTodaysTransactionsByVehicleId(vehicleId: number): Promise<Transaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.transactions.values()).filter(
      transaction => 
        transaction.vehicleId === vehicleId && 
        transaction.createdAt && 
        transaction.createdAt >= today
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = { 
      ...insertTransaction,
      id, 
      passengerId: insertTransaction.passengerId || null,
      vehicleId: insertTransaction.vehicleId || null,
      mateId: insertTransaction.mateId || null,
      driverId: insertTransaction.driverId || null,
      ownerId: insertTransaction.ownerId || null,
      status: insertTransaction.status || "completed",
      paymentMethod: insertTransaction.paymentMethod || "momo",
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getCommissionByOwnerId(ownerId: number): Promise<Commission | undefined> {
    return Array.from(this.commissions.values()).find(
      commission => commission.ownerId === ownerId
    );
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const id = this.currentId++;
    const commission: Commission = { 
      ...insertCommission,
      id, 
      ownerId: insertCommission.ownerId || null,
      driverCommission: insertCommission.driverCommission || "15.00",
      mateCommission: insertCommission.mateCommission || "10.00",
      platformFee: insertCommission.platformFee || "5.00",
      createdAt: new Date() 
    };
    this.commissions.set(id, commission);
    return commission;
  }
}

export const storage = new DatabaseStorage();
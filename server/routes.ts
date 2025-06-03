import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import QRCode from "qrcode";
import { storage } from "./storage";
import { insertTransactionSchema, type User } from "@shared/schema";
import { z } from "zod";
import "./types";

const loginSchema = z.object({
  phone: z.string().min(10),
  pin: z.string().min(4),
});

const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  pin: z.string().min(4),
  role: z.string(),
});

const paymentSchema = z.object({
  vehicleId: z.string(),
  destination: z.string(),
  amount: z.string(),
});

// Store active WebSocket connections by user ID
const activeConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate' && data.userId) {
          activeConnections.set(data.userId, ws);
          console.log(`User ${data.userId} authenticated on WebSocket`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove connection from active connections
      const entries = Array.from(activeConnections.entries());
      for (const [userId, connection] of entries) {
        if (connection === ws) {
          activeConnections.delete(userId);
          break;
        }
      }
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast to specific user
  function broadcastToUser(userId: number, message: any) {
    const connection = activeConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }

  // Broadcast to all vehicle crew (driver, mate, owner)
  function broadcastToVehicleCrew(vehicleId: number, message: any) {
    storage.getVehicle(vehicleId).then(vehicle => {
      if (vehicle) {
        if (vehicle.driverId) broadcastToUser(vehicle.driverId, message);
        if (vehicle.mateId) broadcastToUser(vehicle.mateId, message);
        if (vehicle.ownerId) broadcastToUser(vehicle.ownerId, message);
      }
    });
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, phone, pin, role } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({
        name,
        phone,
        pin,
        role,
        momoBalance: role === "passenger" ? "25.40" : "0.00", // Give passengers starting balance
      });

      req.session.userId = newUser.id;
      res.json({ user: { ...newUser, pin: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, pin } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(401).json({ message: "Invalid phone number or PIN" });
      }
      
      if (user.pin !== pin) {
        return res.status(401).json({ message: "Invalid phone number or PIN" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, pin: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { ...user, pin: undefined } });
  });

  // Vehicle routes
  app.get("/api/vehicles/by-id/:vehicleId", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleByVehicleId(req.params.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/vehicles/owner/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      const vehicles = await storage.getVehiclesByOwnerId(ownerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/routes/:name", async (req, res) => {
    try {
      const route = await storage.getRouteByName(req.params.name);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/vehicle/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const transactions = await storage.getTransactionsByVehicleId(vehicleId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/vehicle/:vehicleId/today", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const transactions = await storage.getTodaysTransactionsByVehicleId(vehicleId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment processing
  app.post("/api/payments/process", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { vehicleId, destination, amount, passengerCount = 1 } = req.body;
      
      // Get passenger
      const passenger = await storage.getUser(req.session.userId);
      if (!passenger) {
        return res.status(404).json({ message: "Passenger not found" });
      }

      // Get vehicle
      const vehicle = await storage.getVehicleByVehicleId(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if passenger has sufficient balance
      const currentBalance = parseFloat(passenger.momoBalance);
      const paymentAmount = parseFloat(amount);

      if (currentBalance < paymentAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        passengerId: passenger.id,
        vehicleId: vehicle.id,
        mateId: vehicle.mateId || 0,
        driverId: vehicle.driverId || 0,
        ownerId: vehicle.ownerId || 0,
        amount,
        destination,
        route: vehicle.route,
        status: "completed",
        paymentMethod: "momo",
      });

      // Update passenger balance
      const newBalance = (currentBalance - paymentAmount).toFixed(2);
      await storage.updateUserBalance(passenger.id, newBalance);

      // Calculate individual fare for display
      const individualFare = (paymentAmount / passengerCount).toFixed(2);

      // Broadcast payment notification to vehicle crew with group info
      const paymentNotification = {
        type: "payment_received",
        transaction: {
          ...transaction,
          passengerPhone: passenger.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
          passengerCount,
          individualFare,
          isGroupPayment: passengerCount > 1,
        },
      };

      broadcastToVehicleCrew(vehicle.id, paymentNotification);

      res.json({ 
        message: "Payment successful",
        transaction: {
          ...transaction,
          passengerCount,
          individualFare,
          isGroupPayment: passengerCount > 1,
        },
        newBalance 
      });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ message: "Payment failed" });
    }
  });

  // Dashboard data endpoints
  app.get("/api/dashboard/passenger/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: { ...user, pin: undefined },
        recentTransactions: transactions.slice(-5).reverse(),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all available routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  // Calculate fare between two stops on a route
  app.post("/api/routes/:routeId/calculate-fare", async (req, res) => {
    try {
      const { routeId } = req.params;
      const { boardingStop, alightingStop } = req.body;

      if (!boardingStop || !alightingStop) {
        return res.status(400).json({ 
          error: "Both boarding and alighting stops are required" 
        });
      }

      const route = await storage.getRoute(parseInt(routeId));
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }

      // Import fare calculator
      const { calculateFare } = await import("@shared/fare-calculator");
      
      const fareCalculation = calculateFare(route, boardingStop, alightingStop);
      
      res.json(fareCalculation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update route fares (for drivers)
  app.put("/api/routes/:routeId/fares", async (req, res) => {
    try {
      const { routeId } = req.params;
      const { fares } = req.body;

      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "driver") {
        return res.status(403).json({ message: "Only drivers can update fares" });
      }

      if (!fares || !Array.isArray(fares)) {
        return res.status(400).json({ error: "Fares array is required" });
      }

      // Get the route
      const route = await storage.getRoute(parseInt(routeId));
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }

      // Get all users to find all vehicle owners
      const allUsers = await storage.getAllUsers();
      const owners = allUsers.filter(u => u.role === "owner");
      
      // Get all vehicles from all owners
      let allVehicles: any[] = [];
      for (const owner of owners) {
        const ownerVehicles = await storage.getVehiclesByOwnerId(owner.id);
        allVehicles = [...allVehicles, ...ownerVehicles];
      }
      
      // Find the driver's vehicle on this route
      const userVehicle = allVehicles.find(v => v.driverId === user.id && v.route === route.name);
      if (!userVehicle) {
        return res.status(403).json({ message: "You are not assigned to a vehicle on this route" });
      }

      // Update the route's fares
      const updatedRoute = await storage.updateRoute(parseInt(routeId), { fares });
      
      res.json({ 
        message: "Fares updated successfully", 
        route: updatedRoute 
      });
    } catch (error: any) {
      console.error("Error updating fares:", error);
      res.status(500).json({ error: "Failed to update fares" });
    }
  });

  // Update vehicle route (for drivers)
  app.put("/api/vehicles/:vehicleId/route", async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { routeId } = req.body;

      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "driver") {
        return res.status(403).json({ message: "Only drivers can change routes" });
      }

      // Get the vehicle
      const vehicle = await storage.getVehicleByVehicleId(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Verify the driver is assigned to this vehicle
      if (vehicle.driverId !== user.id) {
        return res.status(403).json({ message: "You are not assigned to this vehicle" });
      }

      // Get the route details
      const route = await storage.getRoute(parseInt(routeId));
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Update the vehicle's route
      const updatedVehicle = await storage.updateVehicle(vehicle.id, {
        route: route.name
      });

      res.json({
        message: "Route updated successfully",
        vehicle: updatedVehicle,
        route: route
      });
    } catch (error) {
      console.error("Error updating vehicle route:", error);
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  // Generate QR code for vehicle
  app.get("/api/qr-code/:vehicleId", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      
      // Generate QR code data URL
      const qrData = `trotropay://payment/${vehicleId}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({ qrCodeUrl, vehicleId });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  app.get("/api/dashboard/mate/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find vehicle where user is mate - check all owners
      const allUsers = await storage.getAllUsers();
      const owners = allUsers.filter((u: User) => u.role === "owner");
      let vehicle = null;

      for (const owner of owners) {
        const ownerVehicles = await storage.getVehiclesByOwnerId(owner.id);
        const foundVehicle = ownerVehicles.find(v => v.mateId === userId);
        if (foundVehicle) {
          vehicle = foundVehicle;
          break;
        }
      }
      
      if (!vehicle) {
        return res.status(404).json({ message: "No vehicle assigned" });
      }

      const todayTransactions = await storage.getTodaysTransactionsByVehicleId(vehicle.id);
      const totalEarnings = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Generate weekly data (last 7 days) from actual transactions
      const allTransactions = await storage.getTransactionsByVehicleId(vehicle.id);
      const weeklyData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = allTransactions.filter(t => 
          t.createdAt && t.createdAt.toISOString().split('T')[0] === dateStr
        );
        
        const dayEarnings = dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        weeklyData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          earnings: dayEarnings.toFixed(2),
          trips: dayTransactions.length,
          commission: (dayEarnings * 0.10).toFixed(2)
        });
      }

      res.json({
        user: { ...user, pin: undefined },
        vehicle,
        todayEarnings: totalEarnings.toFixed(2),
        passengerCount: todayTransactions.length,
        recentPayments: todayTransactions.slice(-10).reverse(),
        weeklyData
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/driver/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find vehicle where user is driver - check all owners
      const allUsers = await storage.getAllUsers();
      const owners = allUsers.filter((u: User) => u.role === "owner");
      let vehicle = null;

      for (const owner of owners) {
        const ownerVehicles = await storage.getVehiclesByOwnerId(owner.id);
        const foundVehicle = ownerVehicles.find(v => v.driverId === userId);
        if (foundVehicle) {
          vehicle = foundVehicle;
          break;
        }
      }
      
      if (!vehicle) {
        return res.status(404).json({ message: "No vehicle assigned" });
      }

      const todayTransactions = await storage.getTodaysTransactionsByVehicleId(vehicle.id);
      const grossEarnings = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const driverShare = grossEarnings * 0.15; // 15% commission

      // Get mate info
      const mate = vehicle.mateId ? await storage.getUser(vehicle.mateId) : null;

      res.json({
        user: { ...user, pin: undefined },
        vehicle,
        grossEarnings: grossEarnings.toFixed(2),
        driverShare: driverShare.toFixed(2),
        mate: mate ? { ...mate, pin: undefined } : null,
        todayTransactions: todayTransactions.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/owner/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const vehicles = await storage.getVehiclesByOwnerId(userId);
      const commission = await storage.getCommissionByOwnerId(userId);

      // Calculate earnings for each vehicle
      const vehicleData = await Promise.all(
        vehicles.map(async (vehicle) => {
          const todayTransactions = await storage.getTodaysTransactionsByVehicleId(vehicle.id);
          const grossEarnings = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          const driverCommission = grossEarnings * 0.15;
          const mateCommission = grossEarnings * 0.10;
          const platformFee = grossEarnings * 0.05;
          const netEarnings = grossEarnings - driverCommission - mateCommission - platformFee;

          // Get driver and mate names
          const driver = vehicle.driverId ? await storage.getUser(vehicle.driverId) : null;
          const mate = vehicle.mateId ? await storage.getUser(vehicle.mateId) : null;

          return {
            ...vehicle,
            grossEarnings: grossEarnings.toFixed(2),
            netEarnings: netEarnings.toFixed(2),
            commissions: (driverCommission + mateCommission + platformFee).toFixed(2),
            driverName: driver?.name || "Unassigned",
            mateName: mate?.name || "Unassigned",
            todayTransactions: todayTransactions.length,
          };
        })
      );

      const totalGross = vehicleData.reduce((sum, v) => sum + parseFloat(v.grossEarnings), 0);
      const totalNet = vehicleData.reduce((sum, v) => sum + parseFloat(v.netEarnings), 0);

      res.json({
        user: { ...user, pin: undefined },
        vehicles: vehicleData,
        totalEarnings: totalGross.toFixed(2),
        netProfit: totalNet.toFixed(2),
        commission,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

import { db } from "./db";
import { users, vehicles, routes, commissions } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  try {
    // Create test users
    const [passenger] = await db.insert(users).values({
      phone: "0245678901",
      pin: "1234",
      role: "passenger",
      name: "Kwame Asante",
      momoBalance: "25.40",
    }).returning();

    const [mate] = await db.insert(users).values({
      phone: "0234567890",
      pin: "1234",
      role: "mate",
      name: "Kofi Mate",
      momoBalance: "0.00",
    }).returning();

    const [driver] = await db.insert(users).values({
      phone: "0223456789",
      pin: "1234",
      role: "driver",
      name: "John Mensah",
      momoBalance: "0.00",
    }).returning();

    const [owner] = await db.insert(users).values({
      phone: "0212345678",
      pin: "1234",
      role: "owner",
      name: "Mary Owner",
      momoBalance: "0.00",
    }).returning();

    // Create test routes
    const [route1] = await db.insert(routes).values({
      name: "Circle - Lapaz",
      startPoint: "Circle",
      endPoint: "Lapaz",
      stops: ["Circle", "37 Station", "Achimota", "Lapaz"],
      fares: ["Circle:0.00", "37 Station:2.00", "Achimota:2.50", "Lapaz:3.50"],
    }).returning();

    const [route2] = await db.insert(routes).values({
      name: "Tema - Accra",
      startPoint: "Tema",
      endPoint: "Accra",
      stops: ["Tema", "Ashaiman", "Teshie", "Accra"],
      fares: ["Tema:0.00", "Ashaiman:2.50", "Teshie:3.00", "Accra:4.00"],
    }).returning();

    // Create test vehicles
    await db.insert(vehicles).values({
      vehicleId: "GT-1234-20",
      route: "Circle - Lapaz",
      ownerId: owner.id,
      driverId: driver.id,
      mateId: mate.id,
      isActive: true,
    });

    await db.insert(vehicles).values({
      vehicleId: "GT-5678-19",
      route: "Tema - Accra",
      ownerId: owner.id,
      driverId: driver.id,
      mateId: mate.id,
      isActive: true,
    });

    // Create test commission
    await db.insert(commissions).values({
      ownerId: owner.id,
      driverCommission: "15.00",
      mateCommission: "10.00",
      platformFee: "5.00",
    });

    console.log("Database seeded successfully!");
    console.log("Test accounts:");
    console.log("- Passenger: 0245678901 / PIN: 1234");
    console.log("- Mate: 0234567890 / PIN: 1234");
    console.log("- Driver: 0223456789 / PIN: 1234");
    console.log("- Owner: 0212345678 / PIN: 1234");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase().then(() => process.exit(0));
import { eq, desc, and, sql, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  products,
  events,
  orders,
  orderItems,
  tickets,
  settings,
  cartItems,
  InsertCategory,
  InsertProduct,
  InsertEvent,
  InsertOrder,
  InsertOrderItem,
  InsertTicket,
  InsertSetting,
  InsertCartItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ============= CATEGORY OPERATIONS =============

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

export async function reorderCategory(id: number, newOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the category being moved
  const [category] = await db.select().from(categories).where(eq(categories.id, id));
  if (!category) throw new Error("Category not found");
  
  const oldOrder = category.displayOrder || 0;
  
  if (oldOrder === newOrder) return;
  
  // Get all categories
  const allCategories = await db.select().from(categories).orderBy(categories.displayOrder);
  
  // Update orders
  if (oldOrder < newOrder) {
    // Moving down: shift items between oldOrder and newOrder up
    for (const cat of allCategories) {
      const catOrder = cat.displayOrder || 0;
      if (catOrder > oldOrder && catOrder <= newOrder) {
        await db.update(categories)
          .set({ displayOrder: catOrder - 1 })
          .where(eq(categories.id, cat.id));
      }
    }
  } else {
    // Moving up: shift items between newOrder and oldOrder down
    for (const cat of allCategories) {
      const catOrder = cat.displayOrder || 0;
      if (catOrder >= newOrder && catOrder < oldOrder) {
        await db.update(categories)
          .set({ displayOrder: catOrder + 1 })
          .where(eq(categories.id, cat.id));
      }
    }
  }
  
  // Update the moved category
  await db.update(categories)
    .set({ displayOrder: newOrder })
    .where(eq(categories.id, id));
}

// ============= PRODUCT OPERATIONS =============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}

export async function getAllProducts(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const query = activeOnly
    ? db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt))
    : db.select().from(products).orderBy(desc(products.createdAt));
  return await query;
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.active, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.active, true)))
    .orderBy(desc(products.createdAt));
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function searchProducts(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(products)
    .where(and(like(products.name, `%${searchTerm}%`), eq(products.active, true)))
    .orderBy(desc(products.createdAt));
}

// ============= EVENT OPERATIONS =============

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(event);
  return result;
}

export async function getAllEvents(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const query = activeOnly
    ? db.select().from(events).where(eq(events.active, true)).orderBy(events.eventDate)
    : db.select().from(events).orderBy(events.eventDate);
  return await query;
}

export async function getFeaturedEvents() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(events)
    .where(and(eq(events.featured, true), eq(events.active, true)))
    .orderBy(events.eventDate)
    .limit(6);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

export async function decrementEventTickets(eventId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(events)
    .set({ availableTickets: sql`${events.availableTickets} - ${quantity}` })
    .where(eq(events.id, eventId));
}

// ============= ORDER OPERATIONS =============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// ============= ORDER ITEM OPERATIONS =============

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(item);
  return result;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============= TICKET OPERATIONS =============

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tickets).values(ticket);
  return result;
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tickets).where(eq(tickets.orderId, orderId));
}

export async function getTicketByNumber(ticketNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTicketStatus(id: number, status: string, usedAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set({ status: status as any, usedAt }).where(eq(tickets.id, id));
}

// ============= SETTINGS OPERATIONS =============

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(settings).orderBy(settings.key);
}

export async function upsertSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(settings)
    .values({ key, value, description })
    .onDuplicateKeyUpdate({ set: { value, description } });
}

// ============= CART OPERATIONS =============

export async function addToCart(item: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cartItems).values(item);
  return result;
}

export async function getCartItems(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const condition = userId 
    ? eq(cartItems.userId, userId)
    : sessionId 
    ? eq(cartItems.sessionId, sessionId)
    : undefined;
    
  if (!condition) return [];
  
  return await db.select().from(cartItems).where(condition);
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function deleteCartItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const condition = userId 
    ? eq(cartItems.userId, userId)
    : sessionId 
    ? eq(cartItems.sessionId, sessionId)
    : undefined;
    
  if (!condition) return;
  
  await db.delete(cartItems).where(condition);
}


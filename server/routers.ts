import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { createEventTickets, sendOrderNotification } from "./ticketService";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= CATEGORY ROUTES =============
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getCategoryById(input.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createCategory(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
    reorder: adminProcedure
      .input(z.object({ id: z.number(), newOrder: z.number() }))
      .mutation(async ({ input }) => {
        await db.reorderCategory(input.id, input.newOrder);
        return { success: true };
      }),
  }),

  // ============= PRODUCT ROUTES =============
  products: router({
    list: publicProcedure.input(z.object({ activeOnly: z.boolean().optional() })).query(async ({ input }) => {
      return await db.getAllProducts(input.activeOnly ?? true);
    }),

    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProducts();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),

    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return await db.getProductBySlug(input.slug);
    }),

    getByCategory: publicProcedure.input(z.object({ categoryId: z.number() })).query(async ({ input }) => {
      return await db.getProductsByCategory(input.categoryId);
    }),

    search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
      return await db.searchProducts(input.query);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          description: z.string().optional(),
          price: z.number(),
          compareAtPrice: z.number().optional(),
          categoryId: z.number().optional(),
          images: z.string().optional(),
          sizes: z.string().optional(),
          colors: z.string().optional(),
          stock: z.number().default(0),
          featured: z.boolean().default(false),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createProduct(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          compareAtPrice: z.number().optional(),
          categoryId: z.number().optional(),
          images: z.string().optional(),
          sizes: z.string().optional(),
          colors: z.string().optional(),
          stock: z.number().optional(),
          featured: z.boolean().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteProduct(input.id);
      return { success: true };
    }),
  }),

  // ============= EVENT ROUTES =============
  events: router({
    list: publicProcedure.input(z.object({ activeOnly: z.boolean().optional() })).query(async ({ input }) => {
      return await db.getAllEvents(input.activeOnly ?? true);
    }),

    featured: publicProcedure.query(async () => {
      return await db.getFeaturedEvents();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getEventById(input.id);
    }),

    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return await db.getEventBySlug(input.slug);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          description: z.string().optional(),
          venue: z.string(),
          address: z.string().optional(),
          eventDate: z.date(),
          eventEndDate: z.date().optional(),
          imageUrl: z.string().optional(),
          ticketPrice: z.number(),
          totalTickets: z.number(),
          availableTickets: z.number(),
          featured: z.boolean().default(false),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createEvent(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          venue: z.string().optional(),
          address: z.string().optional(),
          eventDate: z.date().optional(),
          eventEndDate: z.date().optional(),
          imageUrl: z.string().optional(),
          ticketPrice: z.number().optional(),
          totalTickets: z.number().optional(),
          availableTickets: z.number().optional(),
          featured: z.boolean().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEvent(id, data);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteEvent(input.id);
      return { success: true };
    }),
  }),

  // ============= ORDER ROUTES =============
  orders: router({
    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByUser(ctx.user.id);
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }
      // Users can only view their own orders, admins can view all
      if (ctx.user.role !== "admin" && order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      return order;
    }),

    getByNumber: publicProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ input }) => {
      return await db.getOrderByNumber(input.orderNumber);
    }),

    getItems: protectedProcedure.input(z.object({ orderId: z.number() })).query(async ({ input }) => {
      return await db.getOrderItems(input.orderId);
    }),

    create: publicProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          customerName: z.string(),
          customerEmail: z.string().email(),
          customerPhone: z.string(),
          shippingAddress: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          country: z.string().optional(),
          orderType: z.enum(["clothing", "event"]),
          totalAmount: z.number(),
          items: z
            .array(
              z.object({
                productId: z.number().optional(),
                productName: z.string(),
                productImage: z.string().optional(),
                size: z.string().optional(),
                color: z.string().optional(),
                quantity: z.number(),
                price: z.number(),
                subtotal: z.number(),
              })
            )
            .optional(),
          eventId: z.number().optional(),
          ticketQuantity: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate order number
        const orderNumber = `LV${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create order
        const orderResult = await db.createOrder({
          orderNumber,
          userId: input.userId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country,
          orderType: input.orderType,
          totalAmount: input.totalAmount,
          status: "pending",
        });

        const orderId = Number((orderResult as any).insertId);

        // Create order items for clothing orders
        if (input.orderType === "clothing" && input.items) {
          for (const item of input.items) {
            await db.createOrderItem({
              orderId,
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            });
          }

          // Send WhatsApp notification for clothing orders
          await sendOrderNotification({
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            orderType: input.orderType,
            totalAmount: input.totalAmount,
            shippingAddress: input.shippingAddress,
            items: input.items,
          });
        }

        // Create tickets for event orders
        if (input.orderType === "event" && input.eventId && input.ticketQuantity) {
          const event = await db.getEventById(input.eventId);
          if (!event) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
          }

          // Check ticket availability
          if (event.availableTickets < input.ticketQuantity) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough tickets available" });
          }

          // Create tickets with QR codes
          await createEventTickets({
            orderId,
            eventId: input.eventId,
            eventName: event.name,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            quantity: input.ticketQuantity,
            price: input.totalAmount,
          });

          // Decrement available tickets
          await db.decrementEventTickets(input.eventId, input.ticketQuantity);

          // Send WhatsApp notification for event orders
          await sendOrderNotification({
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            orderType: input.orderType,
            totalAmount: input.totalAmount,
          });
        }

        return { orderId, orderNumber };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============= TICKET ROUTES =============
  tickets: router({
    list: adminProcedure.query(async () => {
      return await db.getAllTickets();
    }),

    getByOrder: protectedProcedure.input(z.object({ orderId: z.number() })).query(async ({ input }) => {
      return await db.getTicketsByOrder(input.orderId);
    }),

    getByNumber: publicProcedure.input(z.object({ ticketNumber: z.string() })).query(async ({ input }) => {
      return await db.getTicketByNumber(input.ticketNumber);
    }),

    verify: adminProcedure.input(z.object({ ticketNumber: z.string() })).mutation(async ({ input }) => {
      const ticket = await db.getTicketByNumber(input.ticketNumber);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      if (ticket.status === "used") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ticket already used" });
      }
      if (ticket.status === "cancelled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ticket cancelled" });
      }
      await db.updateTicketStatus(ticket.id, "used", new Date());
      return { success: true, ticket };
    }),
  }),

  // ============= CART ROUTES =============
  cart: router({
    get: publicProcedure.input(z.object({ sessionId: z.string().optional() })).query(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      return await db.getCartItems(userId, sessionId);
    }),

    add: publicProcedure
      .input(
        z.object({
          sessionId: z.string().optional(),
          productId: z.number(),
          quantity: z.number(),
          size: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.addToCart({
          userId: ctx.user?.id,
          sessionId: input.sessionId,
          productId: input.productId,
          quantity: input.quantity,
          size: input.size,
          color: input.color,
        });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          quantity: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateCartItem(input.id, input.quantity);
        return { success: true };
      }),

    remove: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCartItem(input.id);
      return { success: true };
    }),

    clear: publicProcedure.input(z.object({ sessionId: z.string().optional() })).mutation(async ({ input, ctx }) => {
      await db.clearCart(ctx.user?.id, input.sessionId);
      return { success: true };
    }),
  }),

  // ============= SETTINGS ROUTES =============
  settings: router({
    get: adminProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      return await db.getSetting(input.key);
    }),

    list: adminProcedure.query(async () => {
      return await db.getAllSettings();
    }),

    upsert: adminProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertSetting(input.key, input.value, input.description);
        return { success: true };
      }),

    getWhatsApp: publicProcedure.query(async () => {
      const setting = await db.getSetting("whatsapp_number");
      return setting?.value || null;
    }),
  }),
});

export type AppRouter = typeof appRouter;


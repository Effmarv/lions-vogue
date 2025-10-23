import QRCode from "qrcode";
import * as db from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

interface TicketData {
  orderId: number;
  eventId: number;
  eventName: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  price: number;
}

/**
 * Generate a QR code for a ticket
 */
async function generateQRCode(ticketNumber: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(ticketNumber, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 400,
      margin: 2,
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to S3
    const { url } = await storagePut(`qrcodes/${ticketNumber}.png`, buffer, "image/png");

    return url;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Create tickets for an event order
 */
export async function createEventTickets(ticketData: TicketData): Promise<string[]> {
  const ticketNumbers: string[] = [];

  try {
    for (let i = 0; i < ticketData.quantity; i++) {
      // Generate unique ticket number
      const ticketNumber = `LVT${Date.now()}${Math.floor(Math.random() * 10000)}${i}`;

      // Generate QR code
      const qrCodeUrl = await generateQRCode(ticketNumber);

      // Create ticket in database
      await db.createTicket({
        ticketNumber,
        orderId: ticketData.orderId,
        eventId: ticketData.eventId,
        eventName: ticketData.eventName,
        customerName: ticketData.customerName,
        customerEmail: ticketData.customerEmail,
        quantity: 1,
        price: Math.floor(ticketData.price / ticketData.quantity),
        qrCode: qrCodeUrl,
        status: "valid",
      });

      ticketNumbers.push(ticketNumber);
    }

    // Send email notification with tickets
    await sendTicketEmail(ticketData, ticketNumbers);

    return ticketNumbers;
  } catch (error) {
    console.error("Error creating event tickets:", error);
    throw new Error("Failed to create event tickets");
  }
}

/**
 * Send ticket email to customer
 */
async function sendTicketEmail(ticketData: TicketData, ticketNumbers: string[]): Promise<void> {
  try {
    // Get all tickets with QR codes
    const tickets = await Promise.all(ticketNumbers.map((num) => db.getTicketByNumber(num)));

    // Build email content
    const ticketList = tickets
      .map(
        (ticket, index) => `
      <div style="margin: 20px 0; padding: 20px; border: 2px solid #FFD700; border-radius: 10px; background: #FFF;">
        <h3 style="color: #000; margin: 0 0 10px 0;">Ticket ${index + 1}</h3>
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket?.ticketNumber}</p>
        <p style="margin: 5px 0;"><strong>Event:</strong> ${ticketData.eventName}</p>
        <p style="margin: 5px 0;"><strong>Customer:</strong> ${ticketData.customerName}</p>
        <div style="margin-top: 15px; text-align: center;">
          <img src="${ticket?.qrCode}" alt="QR Code" style="max-width: 200px; height: auto;" />
        </div>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
          Present this QR code at the event entrance for verification.
        </p>
      </div>
    `
      )
      .join("");

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 20px; text-align: center;">
          <h1 style="color: #FFD700; margin: 0;">LIONS VOGUE</h1>
          <p style="color: #FFF; margin: 5px 0;">WEAR IT WITH STYLE</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">Your Event Tickets</h2>
          <p style="color: #333; line-height: 1.6;">
            Dear ${ticketData.customerName},
          </p>
          <p style="color: #333; line-height: 1.6;">
            Thank you for your purchase! Here are your tickets for <strong>${ticketData.eventName}</strong>.
          </p>
          
          ${ticketList}
          
          <div style="margin-top: 30px; padding: 20px; background: #F5F5F5; border-radius: 5px;">
            <h3 style="color: #000; margin: 0 0 10px 0;">Important Information</h3>
            <ul style="color: #333; line-height: 1.8; margin: 10px 0;">
              <li>Keep these tickets safe and bring them to the event</li>
              <li>Each ticket can only be used once</li>
              <li>Present the QR code at the entrance for scanning</li>
              <li>Screenshots or printed copies are acceptable</li>
            </ul>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-top: 20px;">
            If you have any questions, please contact us.
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            See you at the event!<br>
            <strong>Lions Vogue Team</strong>
          </p>
        </div>
        
        <div style="background: #F5F5F5; padding: 20px; text-align: center; border-top: 2px solid #FFD700;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Lions Vogue. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send notification to owner about new ticket purchase
    await notifyOwner({
      title: "New Event Ticket Purchase",
      content: `${ticketData.customerName} purchased ${ticketData.quantity} ticket(s) for ${ticketData.eventName}. Email: ${ticketData.customerEmail}`,
    });

    // Send email notification to admin if configured
    const adminEmailSetting = await db.getSetting("admin_email");
    if (adminEmailSetting?.value) {
      const adminEmailContent = `
New Event Ticket Purchase

Event: ${ticketData.eventName}
Customer: ${ticketData.customerName}
Email: ${ticketData.customerEmail}
Quantity: ${ticketData.quantity} ticket(s)
Total: $${(ticketData.price / 100).toFixed(2)}

Ticket Numbers:
${ticketNumbers.join("\n")}

Tickets have been sent to the customer's email.
`;
      
      console.log("\n=== ADMIN EMAIL NOTIFICATION (TICKET PURCHASE) ===");
      console.log(`To: ${adminEmailSetting.value}`);
      console.log(`Subject: New Event Ticket Purchase - ${ticketData.eventName}`);
      console.log(`\nMessage:\n${adminEmailContent}`);
      console.log("================================================\n");
      
      // TODO: Integrate with actual email service
    }

    // In a production environment, you would use a proper email service here
    // For now, we'll log the email content
    console.log("=== TICKET EMAIL ===");
    console.log(`To: ${ticketData.customerEmail}`);
    console.log(`Subject: Your Tickets for ${ticketData.eventName}`);
    console.log("HTML Content:", emailContent);
    console.log("===================");

    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // Example:
    // await emailService.send({
    //   to: ticketData.customerEmail,
    //   subject: `Your Tickets for ${ticketData.eventName}`,
    //   html: emailContent,
    // });
  } catch (error) {
    console.error("Error sending ticket email:", error);
    // Don't throw error here - tickets are already created
  }
}

/**
 * Send order notification to admin WhatsApp
 */
export async function sendOrderNotification(orderData: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: string;
  totalAmount: number;
  shippingAddress?: string;
  items?: Array<{ productName: string; quantity: number; size?: string; color?: string }>;
}): Promise<void> {
  try {
    // Get WhatsApp number from settings
    const whatsappSetting = await db.getSetting("whatsapp_number");

    if (!whatsappSetting?.value) {
      console.warn("WhatsApp number not configured in settings");
      return;
    }

    const whatsappNumber = whatsappSetting.value;

    // Build order details message
    let message = `🛍️ *NEW ORDER RECEIVED*\n\n`;
    message += `📋 Order Number: ${orderData.orderNumber}\n`;
    message += `👤 Customer: ${orderData.customerName}\n`;
    message += `📧 Email: ${orderData.customerEmail}\n`;
    message += `📱 Phone: ${orderData.customerPhone}\n`;
    message += `💰 Total: $${(orderData.totalAmount / 100).toFixed(2)}\n`;
    message += `📦 Type: ${orderData.orderType === "clothing" ? "Clothing Order" : "Event Ticket"}\n\n`;

    if (orderData.orderType === "clothing" && orderData.items) {
      message += `*ITEMS:*\n`;
      orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.productName}\n`;
        message += `   Qty: ${item.quantity}`;
        if (item.size) message += ` | Size: ${item.size}`;
        if (item.color) message += ` | Color: ${item.color}`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (orderData.shippingAddress) {
      message += `📍 *SHIPPING ADDRESS:*\n${orderData.shippingAddress}\n\n`;
    }

    message += `Please process this order as soon as possible.`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Send notification to owner
    await notifyOwner({
      title: "New Order Notification",
      content: `Order ${orderData.orderNumber} from ${orderData.customerName}. WhatsApp: ${whatsappUrl}`,
    });

    // Send email notification to admin if configured
    const adminEmailSetting = await db.getSetting("admin_email");
    if (adminEmailSetting?.value) {
      const emailSubject = `New ${orderData.orderType === "clothing" ? "Order" : "Event Booking"} #${orderData.orderNumber}`;
      const emailBody = message.replace(/\*/g, ""); // Remove markdown formatting
      
      console.log("\n=== ADMIN EMAIL NOTIFICATION ===");
      console.log(`To: ${adminEmailSetting.value}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`\nMessage:\n${emailBody}`);
      console.log("================================\n");
      
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // Example:
      // await sendEmail({
      //   to: adminEmailSetting.value,
      //   subject: emailSubject,
      //   text: emailBody,
      //   html: `<pre>${emailBody}</pre>`,
      // });
    }

    console.log("=== ORDER WHATSAPP NOTIFICATION ===");
    console.log(`WhatsApp Number: ${whatsappNumber}`);
    console.log(`Message: ${message}`);
    console.log(`URL: ${whatsappUrl}`);
    console.log("===================================");

    // In production, you could automatically send via WhatsApp Business API
    // or provide a link for the admin to click
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
}


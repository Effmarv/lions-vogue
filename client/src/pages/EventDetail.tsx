import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, ShoppingBag, Ticket, Clock } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const { data: event, isLoading } = trpc.events.getBySlug.useQuery({ slug: slug || "" });
  const createOrderMutation = trpc.orders.create.useMutation();

  const totalAmount = event ? event.ticketPrice * quantity : 0;

  const paystackConfig = {
    reference: `LV-${Date.now()}`,
    email: customerEmail,
    amount: totalAmount, // Paystack expects amount in kobo (cents)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxx",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async (reference: any) => {
    try {
      const result = await createOrderMutation.mutateAsync({
        customerName,
        customerEmail,
        customerPhone,
        orderType: "event",
        totalAmount,
        eventId: event!.id,
        ticketQuantity: quantity,
      });

      toast.success("Tickets purchased successfully! Check your email for QR codes.");
      
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    }
  };

  const handlePaymentClose = () => {
    toast.error("Payment cancelled");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (quantity > event.availableTickets) {
      toast.error("Not enough tickets available");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("Please fill in all fields");
      return;
    }

    // Initialize Paystack payment
    initializePayment({
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPastEvent = new Date(event.eventDate) < new Date();
  const isSoldOut = event.availableTickets === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-black text-white sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src="/logo.png" alt="Lions Vogue" className="h-12 w-12 rounded-full" />
                <div>
                  <h1 className="text-2xl font-bold text-yellow-400">LIONS VOGUE</h1>
                  <p className="text-xs text-gray-400">WEAR IT WITH STYLE</p>
                </div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop">
                <span className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer">Shop</span>
              </Link>
              <Link href="/events">
                <span className="text-yellow-400 font-semibold cursor-pointer">Events</span>
              </Link>
              <Link href="/cart">
                <span className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer">
                  <ShoppingBag className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Event Image */}
          <div>
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 mb-6">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-white" />
                </div>
              )}
            </div>

            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Date</p>
                      <p className="text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Time</p>
                      <p className="text-gray-600">
                        {new Date(event.eventDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Venue</p>
                      <p className="text-gray-600">{event.venue}</p>
                      {event.address && <p className="text-sm text-gray-500">{event.address}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Tickets Available</p>
                      <p className="text-gray-600">
                        {event.availableTickets} of {event.totalTickets}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
            {event.description && <p className="text-lg text-gray-600 mb-8">{event.description}</p>}

            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">${(event.ticketPrice / 100).toFixed(2)}</span>
                    <span className="text-gray-600">per ticket</span>
                  </div>
                  {isPastEvent && (
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <p className="font-semibold">This event has already passed</p>
                    </div>
                  )}
                  {isSoldOut && !isPastEvent && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                      <p className="font-semibold">Sold Out</p>
                    </div>
                  )}
                </div>

                {!isPastEvent && !isSoldOut && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="quantity">Number of Tickets</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={event.availableTickets}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Tickets will be sent to this email</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        required
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-3xl font-bold text-gray-900">${(totalAmount / 100).toFixed(2)}</span>
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? "Processing..." : "Purchase Tickets"}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Secured by Paystack • You'll receive QR codes via email
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-yellow-500/20 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Lions Vogue" className="h-12 w-12 rounded-full" />
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">LIONS VOGUE</h3>
                  <p className="text-xs text-gray-400">WEAR IT WITH STYLE</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Premium clothing and exclusive events for the modern trendsetter.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/shop">
                    <span className="hover:text-yellow-400 transition-colors cursor-pointer">Shop</span>
                  </Link>
                </li>
                <li>
                  <Link href="/events">
                    <span className="hover:text-yellow-400 transition-colors cursor-pointer">Events</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">For inquiries, please reach out through our social media channels.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Lions Vogue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


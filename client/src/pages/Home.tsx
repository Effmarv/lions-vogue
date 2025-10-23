import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Calendar, ArrowRight, Mail, Phone, MessageCircle, Instagram } from "lucide-react";
import { SOCIAL_LINKS } from "@/const";
import { Link } from "wouter";

function ContactInfo() {
  const { data: settings } = trpc.settings.list.useQuery();

  const supportEmail = settings?.find((s) => s.key === "support_email")?.value;
  const supportPhone = settings?.find((s) => s.key === "support_phone")?.value;
  const supportWhatsapp = settings?.find((s) => s.key === "support_whatsapp")?.value;

  return (
    <div className="space-y-2 text-gray-400">
      {supportEmail && (
        <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
          <Mail className="w-4 h-4" />
          <span>{supportEmail}</span>
        </a>
      )}
      {supportPhone && (
        <a href={`tel:${supportPhone}`} className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
          <Phone className="w-4 h-4" />
          <span>{supportPhone}</span>
        </a>
      )}
      {supportWhatsapp && (
        <a
          href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
      )}
      {!supportEmail && !supportPhone && !supportWhatsapp && (
        <p>For inquiries, please reach out through our social media channels.</p>
      )}
    </div>
  );
}

export default function Home() {
  const { data: featuredProducts } = trpc.products.featured.useQuery();
  const { data: featuredEvents } = trpc.events.featured.useQuery();

  return (
    <div className="min-h-screen">
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
                <span className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer">Events</span>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkQ3MDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdjJoLTJ2LTJoMnptMCAwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Wear It With <span className="text-yellow-400">Style</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Discover premium clothing and exclusive events that define your unique style
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-semibold text-lg px-8"
                >
                  Browse Events
                  <Calendar className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked styles just for you</p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product) => {
              const images = product.images ? JSON.parse(product.images) : [];
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
                : 0;

              return (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">${(product.price / 100).toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            ${(product.compareAtPrice! / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {(!featuredProducts || featuredProducts.length === 0) && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Don't miss out on exclusive experiences</p>
            </div>
            <Link href="/events">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents?.slice(0, 3).map((event) => (
              <Link key={event.id} href={`/event/${event.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{event.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.venue}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">${(event.ticketPrice / 100).toFixed(2)}</span>
                      <span className="text-sm text-gray-600">
                        {event.availableTickets} tickets left
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {(!featuredEvents || featuredEvents.length === 0) && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming events available</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Lions Vogue Community</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get exclusive access to new collections, special events, and style tips
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-10">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-yellow-500/20">
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
              <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
              <div className="flex gap-4 mb-6">
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-black border-2 border-white flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
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
                <li>
                  <Link href="/cart">
                    <span className="hover:text-yellow-400 transition-colors cursor-pointer">Cart</span>
                  </Link>
                </li>
              </ul>
            </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ContactInfo />
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


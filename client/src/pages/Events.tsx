import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, ShoppingBag, Ticket } from "lucide-react";
import { Link } from "wouter";

export default function Events() {
  const { data: events, isLoading } = trpc.events.list.useQuery({ activeOnly: true });

  const upcomingEvents = events?.filter((event) => new Date(event.eventDate) >= new Date());
  const pastEvents = events?.filter((event) => new Date(event.eventDate) < new Date());

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

      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Exclusive Events</h1>
          <p className="text-xl text-gray-300">Experience unforgettable moments with Lions Vogue</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/event/${event.slug}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
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
                          {event.availableTickets === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">SOLD OUT</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.eventDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">{event.name}</h3>
                          <div className="flex items-start gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            <span className="text-sm line-clamp-2">{event.venue}</span>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                ${(event.ticketPrice / 100).toFixed(2)}
                              </span>
                              <p className="text-xs text-gray-500">per ticket</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Ticket className="w-4 h-4" />
                                <span className="font-semibold">{event.availableTickets}</span>
                              </div>
                              <p className="text-xs text-gray-500">tickets left</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
                    <p className="text-gray-600">Check back soon for new events</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Events */}
            {pastEvents && pastEvents.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden opacity-75">
                      <div className="relative aspect-video overflow-hidden bg-gray-300">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Past Event
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">{event.name}</h3>
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                          <span className="text-sm line-clamp-2">{event.venue}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
                <li>
                  <Link href="/cart">
                    <span className="hover:text-yellow-400 transition-colors cursor-pointer">Cart</span>
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


import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, Calendar, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { data: products } = trpc.products.list.useQuery({ activeOnly: false });
  const { data: events } = trpc.events.list.useQuery({ activeOnly: false });
  const { data: orders } = trpc.orders.list.useQuery();
  const { data: tickets } = trpc.tickets.list.useQuery();

  const stats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Events",
      value: events?.length || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Tickets",
      value: tickets?.length || 0,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Pending Orders",
      value: orders?.filter((o) => o.status === "pending").length || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Revenue",
      value: `$${((orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to Lions Vogue Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(order.totalAmount / 100).toFixed(2)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  ?.filter((e) => new Date(e.eventDate) >= new Date())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {event.availableTickets}/{event.totalTickets}
                        </p>
                        <p className="text-xs text-gray-500">tickets left</p>
                      </div>
                    </div>
                  ))}
                {(!events || events.filter((e) => new Date(e.eventDate) >= new Date()).length === 0) && (
                  <p className="text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


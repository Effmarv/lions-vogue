import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: events, isLoading } = trpc.events.list.useQuery({ activeOnly: false });

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully");
      utils.events.list.invalidate();
      setOpen(false);
      setEditingEvent(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully");
      utils.events.list.invalidate();
      setOpen(false);
      setEditingEvent(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully");
      utils.events.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      description: formData.get("description") as string,
      venue: formData.get("venue") as string,
      address: formData.get("address") as string,
      eventDate: new Date(formData.get("eventDate") as string),
      eventEndDate: formData.get("eventEndDate")
        ? new Date(formData.get("eventEndDate") as string)
        : undefined,
      imageUrl: formData.get("imageUrl") as string,
      ticketPrice: Math.round(parseFloat(formData.get("ticketPrice") as string) * 100),
      totalTickets: parseInt(formData.get("totalTickets") as string),
      availableTickets: parseInt(formData.get("availableTickets") as string),
      featured: formData.get("featured") === "true",
      active: formData.get("active") === "true",
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-2">Manage your event listings and tickets</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEvent(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingEvent?.name}
                    required
                    placeholder="e.g., Fashion Show 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingEvent?.description}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    name="venue"
                    defaultValue={editingEvent?.venue}
                    required
                    placeholder="e.g., Grand Hall"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingEvent?.address}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date & Time *</Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="datetime-local"
                      defaultValue={
                        editingEvent?.eventDate
                          ? new Date(editingEvent.eventDate).toISOString().slice(0, 16)
                          : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventEndDate">End Date & Time</Label>
                    <Input
                      id="eventEndDate"
                      name="eventEndDate"
                      type="datetime-local"
                      defaultValue={
                        editingEvent?.eventEndDate
                          ? new Date(editingEvent.eventEndDate).toISOString().slice(0, 16)
                          : ""
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl">Event Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={editingEvent?.imageUrl}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ticketPrice">Ticket Price ($) *</Label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      step="0.01"
                      defaultValue={editingEvent?.ticketPrice ? editingEvent.ticketPrice / 100 : ""}
                      required
                      placeholder="50.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalTickets">Total Tickets *</Label>
                    <Input
                      id="totalTickets"
                      name="totalTickets"
                      type="number"
                      defaultValue={editingEvent?.totalTickets ?? ""}
                      required
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="availableTickets">Available Tickets *</Label>
                    <Input
                      id="availableTickets"
                      name="availableTickets"
                      type="number"
                      defaultValue={editingEvent?.availableTickets ?? ""}
                      required
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      name="featured"
                      defaultChecked={editingEvent?.featured}
                      value="true"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Featured
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="active" name="active" defaultChecked={editingEvent?.active ?? true} value="true" />
                    <Label htmlFor="active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingEvent ? "Update" : "Create"} Event
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingEvent(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => {
              const isPast = new Date(event.eventDate) < new Date();
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center relative">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <CalendarIcon className="w-16 h-16 text-white" />
                    )}
                    {isPast && (
                      <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                        Past
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2">{event.name}</span>
                      <div className="flex gap-1">
                        {event.featured && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Featured</span>
                        )}
                        {!event.active && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{event.venue}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${(event.ticketPrice / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {event.availableTickets}/{event.totalTickets} tickets available
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEvent(event);
                            setOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && (!events || events.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first event</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


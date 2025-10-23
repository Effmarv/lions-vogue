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
import { Plus, Edit, Trash2, FolderOpen, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: categories, isLoading } = trpc.categories.list.useQuery();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      utils.categories.list.invalidate();
      setOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      utils.categories.list.invalidate();
      setOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reorderMutation = trpc.categories.reorder.useMutation({
    onSuccess: () => {
      toast.success("Category order updated");
      utils.categories.list.invalidate();
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
      imageUrl: formData.get("imageUrl") as string,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category? This will not delete products in this category.")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleMoveUp = (id: number, currentOrder: number) => {
    if (currentOrder > 0) {
      reorderMutation.mutate({ id, newOrder: currentOrder - 1 });
    }
  };

  const handleMoveDown = (id: number, currentOrder: number, maxOrder: number) => {
    if (currentOrder < maxOrder) {
      reorderMutation.mutate({ id, newOrder: currentOrder + 1 });
    }
  };

  const sortedCategories = categories?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const maxOrder = (sortedCategories?.length || 1) - 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Organize your products into categories</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name}
                    required
                    placeholder="e.g., Men's Wear, Women's Wear"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCategory?.description}
                    placeholder="Brief description of this category..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Category Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={editingCategory?.imageUrl}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Optional: Add an image to represent this category</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingCategory(null);
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
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedCategories && sortedCategories.length > 0 ? (
                <div className="space-y-2">
                  {sortedCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveUp(category.id, category.displayOrder || 0)}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveDown(category.id, category.displayOrder || 0, maxOrder)}
                          disabled={index === sortedCategories.length - 1 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <GripVertical className="w-5 h-5 text-gray-400" />

                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded">
                          Order: {(category.displayOrder || 0) + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first category</p>
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


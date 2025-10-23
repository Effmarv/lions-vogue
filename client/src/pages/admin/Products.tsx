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
import { Plus, Edit, Trash2, Image as ImageIcon, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.list.useQuery({ activeOnly: false });
  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      utils.products.list.invalidate();
      setOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.products.list.invalidate();
      setOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      utils.products.list.invalidate();
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
      price: Math.round(parseFloat(formData.get("price") as string) * 100),
      compareAtPrice: formData.get("compareAtPrice")
        ? Math.round(parseFloat(formData.get("compareAtPrice") as string) * 100)
        : undefined,
      categoryId: formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : undefined,
      images: formData.get("images") as string,
      sizes: formData.get("sizes") as string,
      colors: formData.get("colors") as string,
      stock: parseInt(formData.get("stock") as string),
      featured: formData.get("featured") === "true",
      active: formData.get("active") === "true",
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your clothing products</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                    placeholder="e.g., Classic T-Shirt"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct?.description}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price ? editingProduct.price / 100 : ""}
                      required
                      placeholder="29.99"
                    />
                  </div>
                  <div>
                    <Label htmlFor="compareAtPrice">Compare At Price ($)</Label>
                    <Input
                      id="compareAtPrice"
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.compareAtPrice ? editingProduct.compareAtPrice / 100 : ""}
                      placeholder="39.99"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select name="categoryId" defaultValue={editingProduct?.categoryId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="images">Image URLs (JSON array)</Label>
                  <Textarea
                    id="images"
                    name="images"
                    defaultValue={editingProduct?.images}
                    placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sizes">Sizes (JSON array)</Label>
                    <Input
                      id="sizes"
                      name="sizes"
                      defaultValue={editingProduct?.sizes}
                      placeholder='["S", "M", "L", "XL"]'
                    />
                  </div>
                  <div>
                    <Label htmlFor="colors">Colors (JSON array)</Label>
                    <Input
                      id="colors"
                      name="colors"
                      defaultValue={editingProduct?.colors}
                      placeholder='["Black", "White", "Blue"]'
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock ?? 0}
                    required
                    placeholder="100"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      name="featured"
                      defaultChecked={editingProduct?.featured}
                      value="true"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Featured
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="active" name="active" defaultChecked={editingProduct?.active ?? true} value="true" />
                    <Label htmlFor="active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProduct ? "Update" : "Create"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingProduct(null);
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
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.images ? (
                    <img
                      src={JSON.parse(product.images)[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1">{product.name}</span>
                    <div className="flex gap-1">
                      {product.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Featured</span>
                      )}
                      {!product.active && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">${(product.price / 100).toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${(product.compareAtPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product);
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
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first product</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { data: products, isLoading } = trpc.products.list.useQuery({ activeOnly: true });
  const { data: categories } = trpc.categories.list.useQuery();

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <span className="text-yellow-400 font-semibold cursor-pointer">Shop</span>
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

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Shop Collection</h1>
          <p className="text-xl text-gray-600">Discover our premium clothing selection</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Search</h3>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <h3 className="font-bold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === null
                        ? "bg-yellow-500 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Products
                  </div>
                  {categories?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory === category.id
                          ? "bg-yellow-500 text-white font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <p className="text-gray-500 text-sm">No categories available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading products...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {filteredProducts?.length || 0} {filteredProducts?.length === 1 ? "product" : "products"} found
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts?.map((product) => {
                    const images = product.images ? JSON.parse(product.images) : [];
                    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
                    const discountPercent = hasDiscount
                      ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
                      : 0;

                    return (
                      <Link key={product.id} href={`/product/${product.slug}`}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
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
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ${(product.price / 100).toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${(product.compareAtPrice! / 100).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {(!filteredProducts || filteredProducts.length === 0) && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery ? "Try adjusting your search" : "Check back soon for new arrivals"}
                      </p>
                      {searchQuery && (
                        <Button onClick={() => setSearchQuery("")} variant="outline">
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
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


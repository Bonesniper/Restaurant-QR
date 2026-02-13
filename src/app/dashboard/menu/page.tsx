"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  categoryId: string;
};

export default function DashboardMenuPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", categoryId: "" });

  const fetchRestaurant = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) setRestaurantId(data[0].id);
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/categories`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  useEffect(() => {
    if (!restaurantId) return;
    fetchCategories().finally(() => setLoading(false));
  }, [restaurantId, fetchCategories]);

  const createCategory = async () => {
    if (!restaurantId || !newCategoryName.trim()) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (res.ok) {
      setNewCategoryName("");
      await fetchCategories();
    }
  };

  const updateCategory = async (categoryId: string, name: string) => {
    const res = await fetch(`/api/restaurants/${restaurantId}/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setEditingCategory(null);
      await fetchCategories();
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/categories/${categoryId}`, {
      method: "DELETE",
    });
    if (res.ok) await fetchCategories();
  };

  const createItem = async () => {
    if (!restaurantId || !newItem.name.trim() || !newItem.price || !newItem.categoryId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name.trim(),
        description: newItem.description.trim() || undefined,
        price: parseFloat(newItem.price),
        categoryId: newItem.categoryId,
      }),
    });
    if (res.ok) {
      setNewItem({ name: "", description: "", price: "", categoryId: "" });
      await fetchCategories();
    }
  };

  const updateItem = async (
    itemId: string,
    updates: { name?: string; description?: string; price?: number; available?: boolean }
  ) => {
    const res = await fetch(`/api/restaurants/${restaurantId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setEditingItem(null);
      await fetchCategories();
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/items/${itemId}`, {
      method: "DELETE",
    });
    if (res.ok) await fetchCategories();
  };

  const uploadImage = async (itemId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!data?.url) return;
    const patchRes = await fetch(`/api/restaurants/${restaurantId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: data.url }),
    });
    if (patchRes.ok) await fetchCategories();
  };

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">No restaurant. Run seed.</p>
        <Link href="/dashboard" className="ml-4 text-amber-600">Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-amber-600 font-medium">← Dashboard</Link>
        <h1 className="text-xl font-bold text-gray-800">Menu management</h1>
        <div className="w-20" />
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-8">
        <section className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-bold mb-4">Add category</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-4 py-2 rounded-lg border"
            />
            <button
              type="button"
              onClick={createCategory}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              Add
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-bold mb-4">Add item</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem((p) => ({ ...p, categoryId: e.target.value }))}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
              placeholder="Item name"
              className="px-4 py-2 rounded-lg border"
            />
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              className="px-4 py-2 rounded-lg border sm:col-span-2"
            />
            <input
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
              placeholder="Price"
              className="px-4 py-2 rounded-lg border"
            />
            <button
              type="button"
              onClick={createItem}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              Add item
            </button>
          </div>
        </section>

        {categories.map((cat) => (
          <section key={cat.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
              {editingCategory === cat.id ? (
                <input
                  type="text"
                  defaultValue={cat.name}
                  onBlur={(e) => updateCategory(cat.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateCategory(cat.id, (e.target as HTMLInputElement).value);
                  }}
                  autoFocus
                  className="px-3 py-1 rounded border"
                />
              ) : (
                <h2 className="text-lg font-bold">{cat.name}</h2>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(editingCategory === cat.id ? null : cat.id)}
                  className="text-sm text-amber-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <ul className="divide-y">
              {cat.items.map((item) => (
                <li key={item.id} className="p-4 flex items-center gap-4 flex-wrap">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl.startsWith("/") ? item.imageUrl : item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={(e) => updateItem(item.id, { available: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                  <div className="flex gap-2">
                    <label className="text-sm text-amber-600 cursor-pointer hover:underline">
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadImage(item.id, f);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

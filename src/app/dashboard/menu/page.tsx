"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Category = { id: string; name: string; sortOrder: number; items: MenuItem[] };
type MenuItem = {
  id: string; name: string; description: string | null;
  price: string; imageUrl: string | null; available: boolean; categoryId: string;
};
type EditValues = { name: string; description: string; price: string };

export default function DashboardMenuPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", categoryId: "" });

  const fetchRestaurant = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) setRestaurantId(data[0].id);
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/categories`);
    if (res.ok) setCategories(await res.json());
  }, [restaurantId]);

  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);
  useEffect(() => {
    if (!restaurantId) return;
    fetchCategories().finally(() => setLoading(false));
  }, [restaurantId, fetchCategories]);

  const createCategory = async () => {
    if (!restaurantId || !newCat.trim()) return;
    await fetch(`/api/restaurants/${restaurantId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat.trim() }),
    });
    setNewCat("");
    await fetchCategories();
  };

  const updateCategory = async (id: string, name: string) => {
    await fetch(`/api/restaurants/${restaurantId}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditingCategory(null);
    await fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    await fetch(`/api/restaurants/${restaurantId}/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  const createItem = async () => {
    if (!restaurantId || !newItem.name.trim() || !newItem.price || !newItem.categoryId) return;
    await fetch(`/api/restaurants/${restaurantId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name.trim(),
        description: newItem.description.trim() || undefined,
        price: parseFloat(newItem.price),
        categoryId: newItem.categoryId,
      }),
    });
    setNewItem({ name: "", description: "", price: "", categoryId: "" });
    await fetchCategories();
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditValues({ name: item.name, description: item.description ?? "", price: item.price });
  };

  const saveEdit = async (id: string) => {
    if (!editValues) return;
    const price = parseFloat(editValues.price);
    if (!editValues.name.trim() || isNaN(price)) return;
    setSaving(true);
    await fetch(`/api/restaurants/${restaurantId}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValues.name.trim(), description: editValues.description.trim() || null, price }),
    });
    setSaving(false);
    setEditingItem(null);
    setEditValues(null);
    await fetchCategories();
  };

  const toggleAvail = async (item: MenuItem) => {
    await fetch(`/api/restaurants/${restaurantId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    await fetchCategories();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/restaurants/${restaurantId}/items/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  const uploadImage = async (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!data?.url) return;
    await fetch(`/api/restaurants/${restaurantId}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: data.url }),
    });
    await fetchCategories();
  };

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center gap-3 p-4">
        <p className="text-stone-500 text-sm">No restaurant found. Run seed.</p>
        <Link href="/dashboard" className="text-orange-500 text-sm font-medium">← Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">Menu</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Add category */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">New category</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCategory()}
              placeholder="e.g. Starters, Mains, Drinks"
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
            />
            <button
              type="button"
              onClick={createCategory}
              disabled={!newCat.trim()}
              className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Add item */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">New item</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem((p) => ({ ...p, categoryId: e.target.value }))}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors text-stone-700"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
              placeholder="Item name"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors"
            />
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors sm:col-span-2"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={newItem.price}
              onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
              placeholder="Price (e.g. 9.99)"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors"
            />
            <button
              type="button"
              onClick={createItem}
              disabled={!newItem.name.trim() || !newItem.price || !newItem.categoryId}
              className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              Add item
            </button>
          </div>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-white rounded-2xl border border-stone-100 animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-sm">
            No categories yet. Add one above.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
              {/* Category header */}
              <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-stone-50 bg-stone-50/50">
                {editingCategory === cat.id ? (
                  <input
                    type="text"
                    defaultValue={cat.name}
                    autoFocus
                    onBlur={(e) => updateCategory(cat.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateCategory(cat.id, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") setEditingCategory(null);
                    }}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg border border-orange-400 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-stone-900">{cat.name}</span>
                    <span className="text-xs text-stone-400">{cat.items.length} items</span>
                  </div>
                )}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(editingCategory === cat.id ? null : cat.id)}
                    className="text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors"
                  >
                    {editingCategory === cat.id ? "Cancel" : "Rename"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Items */}
              {cat.items.length === 0 && (
                <p className="px-4 py-5 text-xs text-stone-400 text-center">
                  No items in this category yet.
                </p>
              )}
              <ul className="divide-y divide-stone-50">
                {cat.items.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {/* Image / upload */}
                      <label className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer group">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-lg">+</div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-[10px] font-semibold">Photo</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(item.id, f); }} />
                      </label>

                      {/* Edit form or display */}
                      {editingItem === item.id && editValues ? (
                        <div className="flex-1 space-y-2">
                          <input
                            value={editValues.name}
                            onChange={(e) => setEditValues((v) => v ? { ...v, name: e.target.value } : v)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors"
                            placeholder="Name"
                          />
                          <input
                            value={editValues.description}
                            onChange={(e) => setEditValues((v) => v ? { ...v, description: e.target.value } : v)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors"
                            placeholder="Description (optional)"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.price}
                              onChange={(e) => setEditValues((v) => v ? { ...v, price: e.target.value } : v)}
                              className="w-28 px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-orange-400 transition-colors"
                              placeholder="Price"
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              disabled={saving}
                              className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                            >
                              {saving ? "…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingItem(null); setEditValues(null); }}
                              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                          <p className="text-xs font-bold text-orange-500 mt-1">
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {editingItem !== item.id && (
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {/* Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleAvail(item)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                              item.available
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-green-500" : "bg-stone-300"}`} />
                            {item.available ? "On" : "Off"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

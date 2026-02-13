export type TableWithRestaurant = {
  id: string;
  label: string;
  restaurantId: string;
  restaurant: { id: string; name: string; slug: string; logoUrl: string | null };
};

export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  categoryId: string;
};

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED";
export type PaymentType = "ONLINE" | "COUNTER";

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  menuItem: { name: string; imageUrl?: string | null };
};

export type Order = {
  id: string;
  tableId: string;
  status: OrderStatus;
  paymentType: PaymentType | null;
  createdAt: string;
  items: OrderItem[];
  payment?: { status: string; type: PaymentType; amount?: string } | null;
};

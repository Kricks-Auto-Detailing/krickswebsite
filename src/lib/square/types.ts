import type { BookingPayload } from "@/lib/booking";
import type { Service } from "@/lib/services";

export type SquareMoney = {
  amount?: number;
  currency?: string;
};

export type SquareCatalogObject = {
  id: string;
  type: string;
  version?: number;
  updated_at?: string;
  is_deleted?: boolean;
  item_data?: {
    name?: string;
    description?: string;
    category_id?: string;
    categories?: Array<{ id?: string; ordinal?: number }>;
    variations?: SquareCatalogObject[];
    product_type?: string;
  };
  item_variation_data?: {
    name?: string;
    item_id?: string;
    ordinal?: number;
    price_money?: SquareMoney;
    service_duration?: number;
    available_for_booking?: boolean;
  };
  category_data?: {
    name?: string;
  };
};

export type SquareService = Service & {
  source: "square" | "fallback";
  squareItemId?: string;
  squareVariationId?: string;
  squareVersion?: number;
  squareCategoryName?: string;
};

export type SquareAddOn = {
  id: string;
  label: string;
  price: string;
  source: "square" | "fallback";
  squareItemId?: string;
  squareVariationId?: string;
};

export type SquareCatalogResult = {
  services: SquareService[];
  addOns: SquareAddOn[];
  source: "square" | "fallback";
};

export type SquareCustomer = {
  id: string;
  version?: number;
  given_name?: string;
  family_name?: string;
  email_address?: string;
  phone_number?: string;
  address?: {
    address_line_1?: string;
    locality?: string;
  };
  note?: string;
};

export type SquareBookingContext = {
  payload: BookingPayload;
  catalog: SquareCatalogResult;
  selectedService?: SquareService;
  selectedAddOns: SquareAddOn[];
  customer: SquareCustomer;
};

export type BookingHistoryEntry = {
  date: string;
  service: string;
  addOns: string[];
  appointment: string;
  vehicle: string;
  address: string;
  notes: string;
};

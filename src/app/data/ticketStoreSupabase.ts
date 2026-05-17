import { TicketPrice } from "../types";
import { supabase } from "../lib/supabaseClient";

const TABLE_NAME = "ticket_prices";

/*
  =====================================================
  SQL لإنشاء الجدول في Supabase (شغّل مرة واحدة):
  =====================================================

  create table ticket_prices (
    id uuid default gen_random_uuid() primary key,
    destination text not null default '',
    departure text not null default '',
    return_date text not null default '',
    adult_price text not null default '',
    child_price text not null default '',
    created_at timestamptz default now()
  );

  alter table ticket_prices enable row level security;

  create policy "allow_all" on ticket_prices
    for all using (true) with check (true);

  =====================================================
*/

// تحويل سجل Supabase إلى TicketPrice
function mapRowToTicket(row: any): TicketPrice {
  return {
    id: String(row.id),
    destination: row.destination ?? "",
    departure: row.departure ?? "",
    return: row.return_date ?? "",
    adultPrice: row.adult_price ?? "",
    childPrice: row.child_price ?? "",
  };
}

// تحويل TicketPrice إلى payload جاهز لـ Supabase
function mapTicketToPayload(ticket: Omit<TicketPrice, "id">) {
  return {
    destination: ticket.destination,
    departure: ticket.departure,
    return_date: ticket.return,
    adult_price: String(ticket.adultPrice),
    child_price: String(ticket.childPrice),
  };
}

export const ticketStoreSupabase = {
  // جلب جميع التذاكر
  getAll: async (): Promise<TicketPrice[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("خطأ في جلب التذاكر:", error.message);
      throw new Error(error.message);
    }

    return (data || []).map(mapRowToTicket);
  },

  // إضافة تذكرة جديدة (مباشرة عبر العميل)
  add: async (ticket: Omit<TicketPrice, "id">): Promise<TicketPrice | null> => {
    const payload = mapTicketToPayload(ticket);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("خطأ في إضافة التذكرة:", error.message);
      throw new Error(error.message);
    }

    return mapRowToTicket(data);
  },

  // تحديث تذكرة (مباشرة عبر العميل)
  update: async (id: string, ticket: Partial<TicketPrice>): Promise<boolean> => {
    const payload: Record<string, any> = {};
    if (ticket.destination !== undefined) payload.destination = ticket.destination;
    if (ticket.departure !== undefined) payload.departure = ticket.departure;
    if (ticket.return !== undefined) payload.return_date = ticket.return;
    if (ticket.adultPrice !== undefined) payload.adult_price = String(ticket.adultPrice);
    if (ticket.childPrice !== undefined) payload.child_price = String(ticket.childPrice);

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error("خطأ في تحديث التذكرة:", error.message);
      throw new Error(error.message);
    }

    return true;
  },

  // حذف تذكرة (مباشرة عبر العميل)
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error("خطأ في حذف التذكرة:", error.message);
      throw new Error(error.message);
    }

    return true;
  },
};

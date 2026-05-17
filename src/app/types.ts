export interface TicketPrice {
  id: string;
  destination: string;
  departure: string;
  return: string;
  adultPrice: string | number;
  childPrice: string | number;
}

export type UserRole = 'public' | 'callcenter' | 'admin';
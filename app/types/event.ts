// app/types/event.ts
export type EventItem = {
  id: string;
  caption: string;
  description?: string | null;
  imageUrl?: string | null;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

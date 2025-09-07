// /app/types/news.ts
export type News = {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  tag?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isActive: boolean;
  publishedAt: string; // ISO
  createdAt: string;
  updatedAt: string;
};

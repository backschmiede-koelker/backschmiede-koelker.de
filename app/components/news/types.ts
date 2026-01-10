// app/components/news/types.ts
export type ApiNews = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  tag?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  publishedAt: string;
};

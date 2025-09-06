// /app/components/instagram-embed.tsx
'use client';
import Script from 'next/script';

type Props = { url: string };
export default function InstagramEmbed({ url }: Props) {
  return (
    <div>
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" />
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
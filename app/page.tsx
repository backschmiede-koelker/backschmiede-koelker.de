'use client';
import { useState } from "react";
import Image from "next/image";
import NewsBlock from "./components/news-block";

type NewsData = {
  title: string;
  content: string;
  imageUrl: string;
  date: Date;
};

export default function Home() {
  const [news] = useState<NewsData[]>([
    {
      title: "Neues Frühstücksangebot",
      content: "Wir haben ab sofort ein erweitertes Frühstücksmenü mit frischen Brötchen und hausgemachter Marmelade.",
      imageUrl: "/Logo1.jpg",
      date: new Date("2025-07-20"),
    },
    {
      title: "Sommeraktion im Juli",
      content: "Kuchenstücke zum halben Preis an jedem Sonntag im Juli!",
      imageUrl: "/Logo2.jpg",
      date: new Date("2025-07-10"),
    },
  ]);

  return (
    <div className="space-y-16">
      <section className="relative h-[70vh] w-full">
        <Image src="/Cafe.jpg" alt="Cafe" fill className="object-cover" />
        <div className="absolute inset-0 bg-green-300/80 dark:bg-green-900/80 p-8 flex flex-col justify-center max-w-xl ml-auto animate-slide-in">
          <div className="flex items-center gap-4 mb-4">
            <Image src="/Logo3-2.png" alt="Logo" width={80} height={80} />
            <h1 className="text-2xl font-bold">Backschmiede Kölker</h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Öffnungszeiten</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-bold">Mettingen</h3>
                <ul>
                  <li>Mo. 7:00 - 12:30 Uhr</li>
                  <li>Di. - Fr. 7:00 - 12:30, 14:30 - 18:00</li>
                  <li>Sa. 7:00 - 12:30</li>
                  <li>So. 8:00 - 11:00</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Recke</h3>
                <ul>
                  <li>Di. - Sa. 6:00 - 18:00</li>
                  <li>So. 7:00 - 17:00</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Aktuelles</h2>
        <div className="space-y-8">
          {news.map((data, index) => (
            <NewsBlock key={index} {...data} imageLeft={index % 2 === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}

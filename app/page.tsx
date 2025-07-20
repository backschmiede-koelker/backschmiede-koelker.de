/*'use client';
import { useState } from "react";
import NewsBlock from "./components/news-block";
import Image from "next/image";

type NewsData = {
  title: string
  content: string
  imageUrl: string
  date: Date
}

//function getNews(): NewsData[] {
  // Hier werden später die Daten für Aktuelle Events etc geladen
//  const data: NewsData[] = []

//  data.sort((a,b) => b.date.getTime() - a.date.getTime())
  
//  return data;
//}

export default function Home() {

  const [news] = useState<NewsData[]>([])

  return (
    <>
    <div className={"homepage-logo"}>
      <Image
        src="/Cafe.jpg"
        fill={true}
        alt="Cafe"
      />
      <div className="banner">
        <p className="banner-header">
          <Image
          src="/Logo3-2.png"
          width={100}
          height={400}
          alt="Sidebar Logo"
        />
        <span>Backschmiede Koelker</span>
        </p>
        <div className="opening">
          <p>Öffnungszeiten</p>
          <div style={{marginLeft: '16px', display: 'flex'}}>
            <div>
              <p style={{fontSize: '1.5rem'}}>Mettingen</p>
              <ul>
                <li>Mo. 7:00 - 12:30 Uhr</li>
                <li>Di. - Fr. 7:00 - 12:30 Uhr <br/> 14:30 - 18:00 Uhr</li>
                <li>Sa. 7:00 - 12:30 Uhr</li>
                <li>So. 8:00 - 11:00 Uhr</li>
              </ul>
            </div>
            <div>
              <p style={{fontSize: '1.5rem'}}>Recke</p>
              <ul>
                <li>Di. - Sa. 6:00 - 18:00 Uhr</li>
                <li>So. 7:00 - 17:00 Uhr</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="news">
      {news.map((data, index) => <NewsBlock key={index} {...data} imageLeft={index % 2 === 0}/>)}
    </div>
    </>
  );
}*/

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1f1f1f',
        color: '#f2f2f2',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        🛠️ Webseite im Aufbau
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', color: '#ccc' }}>
        Diese Seite ist noch in Arbeit. Wir freuen uns, dich bald hier begrüßen zu dürfen!
      </p>
    </main>
  );
}

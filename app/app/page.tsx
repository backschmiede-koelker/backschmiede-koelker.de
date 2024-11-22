'use client'
import { Link, Snippet, Code, Image } from "@nextui-org/react";

export default function Home() {
  return (
    <section className="h-full w-full bg-cover flex justify-center items-center" style={{backgroundImage: 'url("https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?cs=srgb&dl=pexels-igor-starkov-233202-1307698.jpg&fm=jpg")'}}>
      <div className="bg-white rounded flex items-center flex-col" style={{height: '80vh', width: '30vw'}}>
        <div style={{width: '70%', height: '30%'}}>Logo</div>
        <div>
          <p className="font-semibold text-xl text-center">Öffnungszeiten</p>
          <ul className="text-center">
            <li>
              <p>Montag - Freitag</p>
              <p>07:00 - 12:00 Uhr</p>
              <p>14:00 - 18:00 Uhr</p>
            </li>
            <li>
              <p>Samstag</p>
              <p>07:00 - 14:00</p>
            </li>
            <li>
              <p>Sonntag</p>
              <p>Geschlossen</p>
            </li>
          </ul>
        </div>
        <div>Kontakt</div>
      </div>
    </section>
  );
}

'use client'
import { Link, Snippet, Code, Image } from "@nextui-org/react";

export default function Home() {
  return (
    <section className="h-full w-full bg-cover" style={{backgroundImage: 'url()'}}>
      <Image removeWrapper className="w-full" src="https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?cs=srgb&dl=pexels-igor-starkov-233202-1307698.jpg&fm=jpg"/>
    </section>
  );
}

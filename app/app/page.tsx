'use client';
import { useEffect, useState } from "react";
import NewsBlock from "./components/news-block";


type NewsData = {
  title: string
  content: string
  imageUrl: string
  date: Date
}

function getNews(): NewsData[] {
  const data: NewsData[] = [
    {
      title: 'Test 4',
      content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et',        imageUrl: 'https://dfrnt.coffee/cdn/shop/articles/cafe-con-miel-y-canela-735112.png?crop=center&height=2048&v=1733918361&width=2048',
      date: new Date('2023-05-19')
    },
    {
      title: 'Test 2',
      content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et',
      imageUrl: 'https://dfrnt.coffee/cdn/shop/articles/cafe-con-miel-y-canela-735112.png?crop=center&height=2048&v=1733918361&width=2048',
      date: new Date('2024-11-12')
    },
    {
      title: 'Test 1',
      content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et',        imageUrl: 'https://dfrnt.coffee/cdn/shop/articles/cafe-con-miel-y-canela-735112.png?crop=center&height=2048&v=1733918361&width=2048',
      date: new Date('2024-12-11')
    },
    {
      title: 'Test 3',
      content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et',        imageUrl: 'https://dfrnt.coffee/cdn/shop/articles/cafe-con-miel-y-canela-735112.png?crop=center&height=2048&v=1733918361&width=2048',
      date: new Date('2023-12-11')
    },
  ]

  data.sort((a,b) => b.date.getTime() - a.date.getTime())
  
  return data;
}

export default function Home() {

  const [news, setNews] = useState<NewsData[]>([])

  useEffect(() => {
    setNews(getNews)
  },[])

  return (
    <>
    <div className={"homepage-logo"}>
      <div className="banner">
        <p className="banner-header">Backschmiede Koelker</p>
      </div>
    </div>
    <div className="news">
      {news.map((data, index) => <NewsBlock key={index} {...data} imageLeft={index % 2 === 0}/>)}
    </div>
    </>
  );
}

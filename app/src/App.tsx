import { useState } from "react"

enum ContentType {
  CALENDAR,
  ARTICLES,
  ABOUT_US
}

function App() {

  const [selectedContent, setSelectedContent] = useState<ContentType|null>(null)

  return (
    <>
      <header className="header" onClick={() => setSelectedContent(null)}>
        Backschmiede Kölker
      </header>
      <nav className="navigation">
        <ul>
          <li onClick={() => setSelectedContent(ContentType.ARTICLES)}>
            Sortiment
          </li>
          <li onClick={() => setSelectedContent(ContentType.CALENDAR)}>
            Ereignisse
          </li>
        </ul>
      </nav>
      <main className="content" style={{height: selectedContent !== null ? 'fit-content' : 0}}>

      </main>
      <footer className="footer">
        <span className="openings">
          <ul>
            <li>Montag bis Freitag 7:00 - 12:00 | 14:00 - 18:00</li>
            <li>Samstag 7:00 - 12:00</li>
            <li>Sonntag Geschlossen</li>
          </ul>
        </span>
        <span className="contacta">
          <ul>
            <li><a>Standort: 454335 Recke, Straße 32</a></li>
            <li><a>Instagram: @BackschmiedeKölker</a></li>
            <li><a>Mail: contact@backschmiede-koelker.de</a></li>
            <li><a>Tel.: 3465234556345</a></li>
          </ul>
        </span>
      </footer>
    </>
  )
}

export default App

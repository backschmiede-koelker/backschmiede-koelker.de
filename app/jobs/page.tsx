export default function Page() {
  const mail = process.env.MAIL_TO || 'info@deine-domain.de';
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Stellenangebote</h1>
      <div className="space-y-4">
        <div className="rounded-xl p-4 bg-white dark:bg-zinc-800 shadow">
          <h3 className="font-semibold">Bäckereifachverkäufer/in (m/w/d) – Teilzeit</h3>
          <p className="text-sm opacity-80">Standorte: Mettingen & Recke · ab sofort</p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>Kundenberatung, Thekenverkauf, Kasse</li>
            <li>Warenpräsentation & Hygiene</li>
          </ul>
        </div>
        <div className="rounded-xl p-4 bg-white dark:bg-zinc-800 shadow">
          <h3 className="font-semibold">Bäcker/in (m/w/d) – Vollzeit</h3>
          <p className="text-sm opacity-80">Backstube Mettingen · ab Q4</p>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-green-600/10 border border-green-600/20">
        <h2 className="text-xl font-bold">Bewerben</h2>
        <p className="text-sm opacity-80">Sende Lebenslauf & kurze Motivation an <a className="underline" href={`mailto:${mail}`}>{mail}</a>.</p>
        <p className="text-xs opacity-60 mt-1">Optional: Richte `SMTP_*` Variablen ein und ergänze eine Server Action/Route zum Hochladen/Versenden.</p>
      </div>
    </div>
  );
}
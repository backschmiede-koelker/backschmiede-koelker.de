export default function OwnerCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow grid md:grid-cols-3">
      <img src="/owner/josua_ofen.jpg" alt="Inhaber Josua" className="w-full h-64 object-cover md:h-full" />
      <div className="md:col-span-2 p-6">
        <h2 className="text-2xl font-bold mb-1">Josua Kölker</h2>
        <p className="text-sm opacity-80 mb-3">Inhaber & Bäckermeister</p>
        <p className="leading-7">Seit Kindheit zwischen Mehl und Sauerteig: Josua liebt ehrliche Handwerkskunst, lange Teigführungen und regionale Zutaten. In der Backschmiede Kölker vereint er Tradition mit moderner Backkultur – vom knusprigen Bauernbrot bis zum saftigen Dinkelklassiker.</p>
      </div>
    </div>
  );
}
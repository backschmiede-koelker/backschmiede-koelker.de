import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ul className="list-disc pl-5 space-y-1">
        <li><Link className="underline" href="/admin/products">Produkte</Link></li>
        <li><Link className="underline" href="/admin/offers">Angebote</Link></li>
      </ul>
    </main>
  );
}

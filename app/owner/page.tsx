// /app/owner/page.tsx
import OwnerCard from '../components/owner-card';

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inhaber</h1>
      <OwnerCard />
    </div>
  );
}
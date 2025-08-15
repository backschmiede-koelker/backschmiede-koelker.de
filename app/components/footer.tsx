import AddressLink from "./address-link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-center p-4 mt-8 border-t border-gray-200 dark:border-zinc-700">
      <p className="text-sm font-medium">Besuchen Sie uns vor Ort</p>
      <AddressLink />
      <p className="text-xs mt-2 opacity-60">
        &copy; {new Date().getFullYear()} Backschmiede Kölker
      </p>
    </footer>
  );
}
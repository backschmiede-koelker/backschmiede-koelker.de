import Image from "next/image";

interface NewsBlockProps {
  title: string;
  content: string;
  imageUrl: string;
  imageLeft: boolean;
  date: Date;
}

export default function NewsBlock({ title, content, imageUrl, imageLeft, date }: NewsBlockProps) {
  return (
    <div className={`flex flex-col md:flex-row ${imageLeft ? '' : 'md:flex-row-reverse'} bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xl rounded-xl overflow-hidden animate-fade-in`}>
      <Image src={imageUrl} alt={title} width={300} height={200} className="object-cover w-full md:w-[300px] h-auto" />
      <div className="p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{content}</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date.toLocaleDateString()}</p>
      </div>
    </div>
  );
}
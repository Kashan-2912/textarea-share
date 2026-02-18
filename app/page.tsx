import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <textarea name="shared-text" id="shared-textarea" className="w-full h-96 p-4 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
    </div>
  );
}

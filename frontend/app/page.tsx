import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center h-screen gap-6">

      <h1 className="text-4xl font-bold">
        Attendance Manager
      </h1>

      <Link
        href="/dashboard"
        className="bg-blue-600 text-white px-5 py-3 rounded-lg"
      >
        ダッシュボードへ
      </Link>

    </main>
  );
}
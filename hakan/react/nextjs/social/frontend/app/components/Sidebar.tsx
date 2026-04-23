import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-2">
        <Link href="/" className="block p-3 hover:bg-blue-100 rounded-lg transition">Home</Link>
        <Link href="/groups" className="block p-3 hover:bg-blue-100 rounded-lg transition">Groups</Link>
        <Link href="/pages" className="block p-3 hover:bg-blue-100 rounded-lg transition">Pages</Link>
        <Link href="/users" className="block p-3 hover:bg-blue-100 rounded-lg transition">Users</Link>
        <Link href="/settings" className="block p-3 hover:bg-blue-100 rounded-lg transition">Settings</Link>
      </div>
    </aside>
  );
}
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-700">Système MES</h2>
      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-sm">Connecté : {user?.username}</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="user"
          className="w-9 h-9 rounded-full border"
        />
      </div>
    </header>
  );
}

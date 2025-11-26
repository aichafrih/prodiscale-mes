import { Cpu, CalendarCheck, Wrench, Layers } from "lucide-react";
import Stat from "../components/Stat";

export default function Dashboard() {
  const stats = [
    { title: "Processus actifs", value: 8, icon: <Layers size={20} />, color: "bg-blue-500" },
    { title: "Ressources dispo", value: 12, icon: <Cpu size={20} />, color: "bg-green-500" },
    { title: "Tâches planifiées", value: 5, icon: <CalendarCheck size={20} />, color: "bg-cyan-500" },
    { title: "En maintenance", value: 2, icon: <Wrench size={20} />, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-700 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Stat key={i} {...s} />
        ))}
      </div>
    </div>
  );
}

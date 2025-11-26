import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlanificationPage() {
  const [taches, setTaches] = useState([
    { id: 1, nom: "Production Lot A", date: "2025-11-15", priorite: "Haute" },
    { id: 2, nom: "Entretien machine B", date: "2025-11-17", priorite: "Moyenne" },
  ]);

  const ajouterTache = () => {
    const nom = prompt("Nom de la tâche :");
    const date = prompt("Date de planification (AAAA-MM-JJ) :");
    if (nom && date)
      setTaches([...taches, { id: Date.now(), nom, date, priorite: "Basse" }]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-700">Planification</h1>
        <Button onClick={ajouterTache} className="bg-blue-600 hover:bg-blue-700 text-white">
          + Nouvelle tâche
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {taches.map((t) => (
          <Card key={t.id} className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-blue-600">{t.nom}</h2>
              <p className="text-gray-500">Date : {t.date}</p>
              <p className="text-gray-500">Priorité : {t.priorite}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

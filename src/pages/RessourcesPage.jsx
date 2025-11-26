import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RessourcesPage() {
  const [ressources, setRessources] = useState([
    { id: 1, nom: "Machine A1", type: "Robot industriel", dispo: "Disponible" },
    { id: 2, nom: "Employé 24", type: "Technicien", dispo: "Occupé" },
    { id: 3, nom: "Machine B2", type: "Presse hydraulique", dispo: "En maintenance" },
  ]);

  const toggleDispo = (id) => {
    setRessources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              dispo: r.dispo === "Disponible" ? "Occupé" : "Disponible",
            }
          : r
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-700 mb-6">Ressources</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {ressources.map((r) => (
          <Card key={r.id} className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-blue-600">{r.nom}</h2>
              <p className="text-gray-500">{r.type}</p>
              <p
                className={`font-medium mt-2 ${
                  r.dispo === "Disponible" ? "text-green-600" : "text-red-600"
                }`}
              >
                {r.dispo}
              </p>
              <Button
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white w-full"
                onClick={() => toggleDispo(r.id)}
              >
                Changer statut
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

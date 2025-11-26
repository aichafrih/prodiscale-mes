import { Card, CardContent } from "@/components/ui/card";

export default function Stat({ title, value, icon, color }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition bg-white rounded-2xl">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-700">{value}</h3>
        </div>
        <div
          className={`p-3 rounded-full text-white ${color} flex items-center justify-center`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle, 
  Package, 
  Users, 
  Settings,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Chargement des statistiques...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Erreur de chargement des statistiques</div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Processus Totaux */}
        <StatCard
          title="Processus Totaux"
          value={stats.processus.total}
          icon={<Activity className="text-white" size={24} />}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={stats.processus.pourcentageActifs}
          trendUp={true}
        />

        {/* Étapes en cours */}
        <StatCard
          title="Étapes en cours"
          value={stats.etapes.enCours}
          icon={<Settings className="text-white" size={24} />}
          bgColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
          trend={15}
          trendUp={true}
        />

        {/* Taux de complétion */}
        <StatCard
          title="Taux de complétion"
          value={`${stats.etapes.tauxCompletion}%`}
          icon={<CheckCircle className="text-white" size={24} />}
          bgColor="bg-gradient-to-br from-green-500 to-green-600"
          trend={stats.etapes.tauxCompletion > 50 ? 12 : -5}
          trendUp={stats.etapes.tauxCompletion > 50}
        />

        {/* Ressources actives */}
        <StatCard
          title="Opérateurs actifs"
          value={stats.ressources.operateurs.actifs}
          icon={<Users className="text-white" size={24} />}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={8}
          trendUp={true}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique en barres - Évolution des processus */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Évolution des processus</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Actif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Brouillon</span>
              </div>
            </div>
          </div>
          
         <ResponsiveContainer width="100%" height={300}>
  <BarChart data={stats.graphiques.processusParJour}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
    <XAxis 
      dataKey="_id.jour" 
      tickFormatter={(value, index) => {
        const data = stats.graphiques.processusParJour[index];
        if (data) {
          return `${value}/${data._id.mois}`;
        }
        return value;
      }}
    />
    <YAxis />
    <Tooltip 
      labelFormatter={(value, payload) => {
        if (payload && payload[0]) {
          const data = payload[0].payload;
          const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                       'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
          return `${data._id.jour} ${mois[data._id.mois - 1]} ${data._id.annee}`;
        }
        return value;
      }}
    />
    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
        </div>

        {/* Graphique circulaire - Répartition */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition des processus</h2>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.graphiques.repartitionStatut}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
              >
                {stats.graphiques.repartitionStatut.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {stats.graphiques.repartitionStatut.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.statut}</span>
                </div>
                <span className="font-semibold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activités récentes et ressources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {stats.activitesRecentes.map((activite, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-500" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">{activite.nom}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activite.dateModification).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  activite.statut === 'actif' ? 'bg-green-100 text-green-700' :
                  activite.statut === 'brouillon' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {activite.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* État des ressources */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">État des ressources</h2>
          <div className="space-y-4">
            {/* Matériaux */}
            <ResourceItem
              icon={<Package className="text-orange-500" size={20} />}
              title="Matériaux"
              total={stats.ressources.materiaux.total}
              alert={stats.ressources.materiaux.stockFaible}
              alertText="Stock faible"
            />

            {/* Équipements */}
            <ResourceItem
              icon={<Settings className="text-blue-500" size={20} />}
              title="Équipements"
              total={stats.ressources.equipements.total}
              alert={stats.ressources.equipements.enPanne}
              alertText="En panne"
            />

            {/* Opérateurs */}
            <ResourceItem
              icon={<Users className="text-purple-500" size={20} />}
              title="Opérateurs"
              total={stats.ressources.operateurs.total}
              active={stats.ressources.operateurs.actifs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant carte statistique
function StatCard({ title, value, icon, bgColor, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trendUp ? (
              <TrendingUp className="text-green-500" size={16} />
            ) : (
              <TrendingDown className="text-red-500" size={16} />
            )}
            <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant item de ressource
function ResourceItem({ icon, title, total, alert, alertText, active }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-sm text-gray-500">Total: {total}</p>
        </div>
      </div>
      {alert > 0 && (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{alert} {alertText}</span>
        </div>
      )}
      {active !== undefined && (
        <span className="text-sm font-medium text-green-600">{active} actifs</span>
      )}
    </div>
  );
}
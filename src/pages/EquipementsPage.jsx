import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EquipementsPage() {
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    type: '',
    localisation: '',
    specifications: '',
    statut: 'disponible'
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/equipements';

  // Récupérer tous les équipements
  useEffect(() => {
    fetchEquipements();
  }, []);

  const fetchEquipements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipements(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des équipements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Modifier
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEquipements(equipements.map(e => e._id === editingId ? { ...e, ...formData } : e));
      } else {
        // Créer
        const res = await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEquipements([res.data, ...equipements]);
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cet équipement sera supprimé définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEquipements(equipements.filter(e => e._id !== id));
          Swal.fire('Supprimé !', 'L\'équipement a été supprimé.', 'success');
        } catch (err) {
          setError('Erreur lors de la suppression');
          Swal.fire('Erreur !', 'Impossible de supprimer l\'équipement.', 'error');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (equipement) => {
    setFormData({
      reference: equipement.reference,
      nom: equipement.nom,
      type: equipement.type,
      localisation: equipement.localisation,
      specifications: equipement.specifications,
      statut: equipement.statut
    });
    setEditingId(equipement._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      reference: '',
      nom: '',
      type: '',
      localisation: '',
      specifications: '',
      statut: 'disponible'
    });
    setEditingId(null);
    setError('');
  };

  const getStatutColor = (statut) => {
    const colors = {
      disponible: 'bg-green-100 text-green-800',
      en_utilisation: 'bg-blue-100 text-blue-800',
      en_maintenance: 'bg-yellow-100 text-yellow-800',
      hors_service: 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Équipements</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Ajouter
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && !equipements.length ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : equipements.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Aucun équipement trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipements.map((equipement) => (
            <div key={equipement._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{equipement.nom}</h3>
                  <p className="text-sm text-gray-500">Ref: {equipement.reference}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(equipement.statut)}`}>
                  {equipement.statut}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{equipement.specifications}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div><strong>Type:</strong> {equipement.type}</div>
                <div><strong>Localisation:</strong> {equipement.localisation}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(equipement)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(equipement._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Modifier Équipement' : 'Ajouter Équipement'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Type *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Localisation *</label>
                <input
                  type="text"
                  value={formData.localisation}
                  onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Spécifications</label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_utilisation">En utilisation</option>
                  <option value="en_maintenance">En maintenance</option>
                  <option value="hors_service">Hors service</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
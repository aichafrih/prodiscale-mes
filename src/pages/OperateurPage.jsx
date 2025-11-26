import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Users } from 'lucide-react';
import Swal from 'sweetalert2';

export default function OperateursPage() {
  const [operateurs, setOperateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [competenceInput, setCompetenceInput] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    email: '',
    telephone: '',
    competences: [],
    statut: 'actif'
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/operateurs';

  useEffect(() => {
    fetchOperateurs();
  }, []);

  const fetchOperateurs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOperateurs(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des opérateurs');
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
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOperateurs(operateurs.map(o => o._id === editingId ? { ...o, ...formData } : o));
        Swal.fire('Succès !', 'Opérateur modifié.', 'success');
      } else {
        const res = await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOperateurs([res.data, ...operateurs]);
        Swal.fire('Succès !', 'Opérateur créé.', 'success');
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      Swal.fire('Erreur !', err.response?.data?.message || 'Erreur serveur', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cet opérateur sera supprimé définitivement',
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
          setOperateurs(operateurs.filter(o => o._id !== id));
          Swal.fire('Supprimé !', 'L\'opérateur a été supprimé.', 'success');
        } catch (err) {
          Swal.fire('Erreur !', 'Impossible de supprimer l\'opérateur.', 'error');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (operateur) => {
    setFormData({
      nom: operateur.nom,
      prenom: operateur.prenom,
      matricule: operateur.matricule,
      email: operateur.email,
      telephone: operateur.telephone,
      competences: operateur.competences || [],
      statut: operateur.statut
    });
    setEditingId(operateur._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      matricule: '',
      email: '',
      telephone: '',
      competences: [],
      statut: 'actif'
    });
    setCompetenceInput('');
    setEditingId(null);
    setError('');
  };

  const addCompetence = () => {
    if (competenceInput.trim() && !formData.competences.includes(competenceInput)) {
      setFormData({
        ...formData,
        competences: [...formData.competences, competenceInput]
      });
      setCompetenceInput('');
    }
  };

  const removeCompetence = (competence) => {
    setFormData({
      ...formData,
      competences: formData.competences.filter(c => c !== competence)
    });
  };

  const getStatutColor = (statut) => {
    const colors = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      en_formation: 'bg-blue-100 text-blue-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Opérateurs</h1>
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

      {loading && !operateurs.length ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : operateurs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Aucun opérateur trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operateurs.map((operateur) => (
            <div key={operateur._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {operateur.prenom} {operateur.nom}
                  </h3>
                  <p className="text-sm text-gray-500">Mat: {operateur.matricule}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(operateur.statut)}`}>
                  {operateur.statut}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p><strong>Email:</strong> {operateur.email}</p>
                <p><strong>Tél:</strong> {operateur.telephone || '-'}</p>
              </div>

              {operateur.competences && operateur.competences.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Compétences:</p>
                  <div className="flex flex-wrap gap-2">
                    {operateur.competences.map((comp, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(operateur)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(operateur._id)}
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
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Modifier Opérateur' : 'Ajouter Opérateur'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Matricule *</label>
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Statut *</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="en_formation">En formation</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Compétences</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={competenceInput}
                    onChange={(e) => setCompetenceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
                    placeholder="Ajouter une compétence"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addCompetence}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    +
                  </button>
                </div>
                {formData.competences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.competences.map((comp, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded flex items-center gap-2"
                      >
                        {comp}
                        <button
                          type="button"
                          onClick={() => removeCompetence(comp)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
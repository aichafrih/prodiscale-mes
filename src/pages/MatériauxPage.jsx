import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MatériauxPage() {
  const [materiaux, setMateriaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    quantiteStock: 0,
    unite: 'piece',
    seuilMinimum: 0,
    prixUnitaire: 0,
    fournisseur: {
      nom: '',
      contact: '',
      telephone: '',
      email: ''
    }
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/materiaux';

  useEffect(() => {
    fetchMateriaux();
  }, []);

  const fetchMateriaux = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMateriaux(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des matériaux');
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
        setMateriaux(materiaux.map(m => m._id === editingId ? { ...m, ...formData } : m));
      } else {
        const res = await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMateriaux([res.data, ...materiaux]);
      }
      resetForm();
      setShowModal(false);
      Swal.fire('Succès !', editingId ? 'Matériau modifié.' : 'Matériau créé.', 'success');
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
      text: 'Ce matériau sera supprimé définitivement',
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
          setMateriaux(materiaux.filter(m => m._id !== id));
          Swal.fire('Supprimé !', 'Le matériau a été supprimé.', 'success');
        } catch (err) {
          Swal.fire('Erreur !', 'Impossible de supprimer le matériau.', 'error');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (materiau) => {
    setFormData({
      nom: materiau.nom,
      reference: materiau.reference,
      quantiteStock: materiau.quantiteStock,
      unite: materiau.unite,
      seuilMinimum: materiau.seuilMinimum,
      prixUnitaire: materiau.prixUnitaire,
      fournisseur: materiau.fournisseur || { nom: '', contact: '', telephone: '', email: '' }
    });
    setEditingId(materiau._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      quantiteStock: 0,
      unite: 'piece',
      seuilMinimum: 0,
      prixUnitaire: 0,
      fournisseur: { nom: '', contact: '', telephone: '', email: '' }
    });
    setEditingId(null);
    setError('');
  };

  const isStockFaible = (materiau) => materiau.quantiteStock < materiau.seuilMinimum;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Matériaux</h1>
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

      {loading && !materiaux.length ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : materiaux.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Aucun matériau trouvé</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Nom</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Référence</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Fournisseur</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Prix</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materiaux.map((materiau) => (
                <tr key={materiau._id} className={`border-t ${isStockFaible(materiau) ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 text-gray-800 font-semibold">{materiau.nom}</td>
                  <td className="px-6 py-4 text-gray-600">{materiau.reference}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isStockFaible(materiau) && <AlertCircle size={16} className="text-red-600" />}
                      <span className={isStockFaible(materiau) ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {materiau.quantiteStock} {materiau.unite}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{materiau.fournisseur?.nom || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{materiau.prixUnitaire} DT</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(materiau)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(materiau._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Modifier Matériau' : 'Ajouter Matériau'}
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-gray-700 font-semibold mb-2">Référence *</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Quantité en Stock *</label>
                  <input
                    type="number"
                    value={formData.quantiteStock}
                    onChange={(e) => setFormData({ ...formData, quantiteStock: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Unité *</label>
                  <select
                    value={formData.unite}
                    onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                    <option value="piece">pièce</option>
                    <option value="metre">mètre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Seuil Minimum *</label>
                  <input
                    type="number"
                    value={formData.seuilMinimum}
                    onChange={(e) => setFormData({ ...formData, seuilMinimum: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Prix Unitaire</label>
                  <input
                    type="number"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData({ ...formData, prixUnitaire: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fournisseur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du fournisseur"
                    value={formData.fournisseur.nom}
                    onChange={(e) => setFormData({
                      ...formData,
                      fournisseur: { ...formData.fournisseur, nom: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact"
                    value={formData.fournisseur.contact}
                    onChange={(e) => setFormData({
                      ...formData,
                      fournisseur: { ...formData.fournisseur, contact: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={formData.fournisseur.telephone}
                    onChange={(e) => setFormData({
                      ...formData,
                      fournisseur: { ...formData.fournisseur, telephone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.fournisseur.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      fournisseur: { ...formData.fournisseur, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
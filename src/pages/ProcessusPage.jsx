import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProcessusPage() {
  const [processus, setProcessus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [etapes, setEtapes] = useState([]);
  const [materiaux, setMateriaux] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [operateurs, setOperateurs] = useState([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    description: '',
    statut: 'brouillon',
    etapes: [],
    materiaux: []
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/processus';

  useEffect(() => {
    fetchProcessus();
    fetchDependencies();
  }, []);

  const fetchProcessus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProcessus(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des processus');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [eqRes, opRes, matRes] = await Promise.all([
        axios.get('http://localhost:5000/api/equipements', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/operateurs', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/materiaux', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setEquipements(eqRes.data);
      setOperateurs(opRes.data);
      setMateriaux(matRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des dépendances', err);
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
        setProcessus(processus.map(p => p._id === editingId ? { ...p, ...formData } : p));
        Swal.fire('Succès !', 'Processus modifié.', 'success');
      } else {
        const res = await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProcessus([res.data, ...processus]);
        Swal.fire('Succès !', 'Processus créé.', 'success');
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      Swal.fire('Erreur !', err.response?.data?.message || 'Erreur serveur', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce processus sera supprimé définitivement',
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
          setProcessus(processus.filter(p => p._id !== id));
          Swal.fire('Supprimé !', 'Le processus a été supprimé.', 'success');
        } catch (err) {
          Swal.fire('Erreur !', 'Impossible de supprimer le processus.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (p) => {
    setFormData({
      nom: p.nom,
      reference: p.reference,
      description: p.description,
      statut: p.statut,
      etapes: p.etapes || [],
      materiaux: p.materiaux || []
    });
    setEditingId(p._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      description: '',
      statut: 'brouillon',
      etapes: [],
      materiaux: []
    });
    setEditingId(null);
    setError('');
    setEtapes([]);
  };

  const addEtape = () => {
    const newEtape = {
      numero: (formData.etapes?.length || 0) + 1,
      nom: '',
      description: '',
      dureeEstimee: 0,
      equipements: [],
      operateurs: []
    };
    setFormData({
      ...formData,
      etapes: [...(formData.etapes || []), newEtape]
    });
  };

  const removeEtape = (index) => {
    setFormData({
      ...formData,
      etapes: formData.etapes.filter((_, i) => i !== index)
    });
  };

  const updateEtape = (index, field, value) => {
    const updatedEtapes = [...formData.etapes];
    updatedEtapes[index] = { ...updatedEtapes[index], [field]: value };
    setFormData({ ...formData, etapes: updatedEtapes });
  };

  const addMateriau = () => {
    setFormData({
      ...formData,
      materiaux: [...(formData.materiaux || []), { materiau: '', quantiteNecessaire: 0 }]
    });
  };

  const removeMateriau = (index) => {
    setFormData({
      ...formData,
      materiaux: formData.materiaux.filter((_, i) => i !== index)
    });
  };

  const updateMateriau = (index, field, value) => {
    const updatedMateriaux = [...formData.materiaux];
    updatedMateriaux[index] = { ...updatedMateriaux[index], [field]: value };
    setFormData({ ...formData, materiaux: updatedMateriaux });
  };

  const getStatutColor = (statut) => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-800',
      actif: 'bg-green-100 text-green-800',
      archive: 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Processus</h1>
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

      {loading && !processus.length ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : processus.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Aucun processus trouvé</div>
      ) : (
        <div className="space-y-4">
          {processus.map((p) => (
            <div key={p._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <div
                className="p-6 cursor-pointer flex justify-between items-start"
                onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{p.nom}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(p.statut)}`}>
                      {p.statut}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Ref: {p.reference}</p>
                  <p className="text-sm text-gray-500">{p.etapes?.length || 0} étapes</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p._id);
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedId === p._id ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>

              {expandedId === p._id && (
                <div className="border-t p-6 bg-gray-50">
                  {p.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600">{p.description}</p>
                    </div>
                  )}

                  {p.etapes && p.etapes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Étapes</h3>
                      <div className="space-y-3">
                        {p.etapes.map((etape, idx) => (
                          <div key={idx} className="bg-white p-4 rounded border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Étape {etape.numero}: {etape.nom}
                                </p>
                                {etape.description && (
                                  <p className="text-sm text-gray-600">{etape.description}</p>
                                )}
                              </div>
                              {etape.dureeEstimee && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {etape.dureeEstimee} min
                                </span>
                              )}
                            </div>
                            {(etape.equipements?.length > 0 || etape.operateurs?.length > 0) && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {etape.equipements?.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-gray-700">Équipements:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {etape.equipements.map((eq, i) => (
                                        <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                          {typeof eq === 'string' ? eq : eq.nom}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {etape.operateurs?.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-gray-700">Opérateurs:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {etape.operateurs.map((op, i) => (
                                        <span key={i} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                          {typeof op === 'string' ? op : `${op.prenom} ${op.nom}`}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.materiaux && p.materiaux.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Matériaux</h3>
                      <div className="space-y-2">
                        {p.materiaux.map((mat, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between">
                            <span className="text-gray-700">
                              {typeof mat.materiau === 'string' ? mat.materiau : mat.materiau?.nom}
                            </span>
                            <span className="text-gray-600">
                              {mat.quantiteNecessaire} {typeof mat.materiau === 'string' ? '' : mat.materiau?.unite}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Modifier Processus' : 'Ajouter Processus'}
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
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <option value="brouillon">Brouillon</option>
                  <option value="actif">Actif</option>
                  <option value="archive">Archive</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Étapes</h3>
                  <button
                    type="button"
                    onClick={addEtape}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    + Ajouter étape
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {formData.etapes.map((etape, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          type="number"
                          placeholder="Numéro"
                          value={etape.numero}
                          onChange={(e) => updateEtape(idx, 'numero', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={etape.nom}
                          onChange={(e) => updateEtape(idx, 'nom', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Durée (min)"
                          value={etape.dureeEstimee}
                          onChange={(e) => updateEtape(idx, 'dureeEstimee', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEtape(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Matériaux</h3>
                  <button
                    type="button"
                    onClick={addMateriau}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    + Ajouter matériau
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.materiaux.map((mat, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2">
                      <select
                        value={mat.materiau}
                        onChange={(e) => updateMateriau(idx, 'materiau', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Sélectionner matériau</option>
                        {materiaux.map((m) => (
                          <option key={m._id} value={m._id}>{m.nom}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantité"
                        value={mat.quantiteNecessaire}
                        onChange={(e) => updateMateriau(idx, 'quantiteNecessaire', parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeMateriau(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        X
                      </button>
                    </div>
                  ))}
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
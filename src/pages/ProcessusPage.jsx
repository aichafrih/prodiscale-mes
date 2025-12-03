import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Edit2, X, ChevronRight, ChevronDown, ChevronUp, 
  Save, ArrowLeft, ArrowRight, Users, Wrench, Package, Layers, Calendar 
} from 'lucide-react';

import Swal from 'sweetalert2';

export default function ProcessusPage() {
  const [processus, setProcessus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEtapesModal, setShowEtapesModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    statut: 'brouillon'
  });

  const [etapesTemp, setEtapesTemp] = useState([]);
  const [currentProcessusId, setCurrentProcessusId] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/processus';

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir la date min (aujourd'hui)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchProcessus();
  }, []);

  const fetchProcessus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProcessus(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Erreur', 'Impossible de charger les processus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProcessus = async (e) => {
    e.preventDefault();
    
    // Validation des dates
    if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      Swal.fire('Erreur', 'La date de fin doit être postérieure à la date de début', 'warning');
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Succès !', 'Processus modifié.', 'success');
        fetchProcessus();
        setShowModal(false);
        resetForm();
      } else {
        const res = await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentProcessusId(res.data._id);
        Swal.fire('Succès !', 'Processus créé. Ajoutez maintenant les étapes.', 'success');
        setModalStep(2);
      }
    } catch (err) {
      Swal.fire('Erreur !', err.response?.data?.message || 'Erreur serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEtapes = (processusId) => {
    setCurrentProcessusId(processusId);
    setEtapesTemp([]);
    setShowEtapesModal(true);
  };

  const handleSubmitEtapes = async () => {
    if (etapesTemp.length === 0) {
      Swal.fire('Attention', 'Ajoutez au moins une étape', 'warning');
      return;
    }

    setLoading(true);
    try {
      for (const etape of etapesTemp) {
        await axios.post(`${API_URL}/${currentProcessusId}/etapes`, etape, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      Swal.fire('Succès !', 'Étapes ajoutées avec succès !', 'success');
      fetchProcessus();
      
      if (showEtapesModal) {
        setShowEtapesModal(false);
      } else {
        setShowModal(false);
      }
      
      resetForm();
    } catch (err) {
      Swal.fire('Erreur !', 'Impossible d\'ajouter les étapes', 'error');
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
        try {
          await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProcessus(processus.filter(p => p._id !== id));
          Swal.fire('Supprimé !', 'Le processus a été supprimé.', 'success');
        } catch (err) {
          Swal.fire('Erreur !', 'Impossible de supprimer le processus.', 'error');
        }
      }
    });
  };

  const handleEdit = (p) => {
    setFormData({
      nom: p.nom,
      reference: p.reference,
      description: p.description,
      dateDebut: p.dateDebut ? p.dateDebut.split('T')[0] : '',
      dateFin: p.dateFin ? p.dateFin.split('T')[0] : '',
      statut: p.statut
    });
    setEditingId(p._id);
    setModalStep(1);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      statut: 'brouillon'
    });
    setEtapesTemp([]);
    setEditingId(null);
    setCurrentProcessusId(null);
    setModalStep(1);
  };

  const addEtapeTemp = () => {
    setEtapesTemp([...etapesTemp, {
      numero: etapesTemp.length + 1,
      nom: '',
      description: '',
      dureeEstimee: 0
    }]);
  };

  const removeEtapeTemp = (index) => {
    setEtapesTemp(etapesTemp.filter((_, i) => i !== index));
  };

  const updateEtapeTemp = (index, field, value) => {
    const updated = [...etapesTemp];
    updated[index] = { ...updated[index], [field]: value };
    setEtapesTemp(updated);
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Processus</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos processus de fabrication</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          <Plus size={20} />
          Nouveau Processus
        </button>
      </div>

      {loading && !processus.length ? (
        <div className="text-center text-gray-500 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Chargement...</p>
        </div>
      ) : processus.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Layers size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Aucun processus trouvé</p>
          <p className="text-gray-400 text-sm mt-2">Commencez par créer votre premier processus</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {processus.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all">
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-gray-800">{p.nom}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(p.statut)}`}>
                        {p.statut.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        Ref: {p.reference}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={16} />
                        {p.etapes?.length || 0} étape(s)
                      </span>
                      <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-blue-800 font-medium">
                          {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
                        </span>
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-gray-600 mt-3 text-sm">{p.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEtapes(p._id);
                      }}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                      title="Ajouter des étapes"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p._id);
                      }}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="text-gray-500 p-2">
                      {expandedId === p._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === p._id && p.etapes && p.etapes.length > 0 && (
                <div className="border-t bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Layers size={18} />
                    Étapes du processus
                  </h3>
                  <div className="space-y-3">
                    {p.etapes.map((etape, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              {etape.numero}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-800">{etape.nom}</p>
                              {etape.description && (
                                <p className="text-sm text-gray-600 mt-1">{etape.description}</p>
                              )}
                            </div>
                          </div>
                          {etape.dureeEstimee > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                              {etape.dureeEstimee} min
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {etape.equipements?.length || 0} équipement(s)
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {etape.operateurs?.length || 0} opérateur(s)
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {etape.materiaux?.length || 0} matériau(x)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Multi-étapes (Création) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Modifier Processus' : 'Nouveau Processus'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {modalStep === 1 ? 'Étape 1: Informations de base' : 'Étape 2: Ajouter les étapes'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
              
              {!editingId && (
                <div className="flex gap-2 mt-4">
                  <div className={`flex-1 h-1 rounded ${modalStep >= 1 ? 'bg-white' : 'bg-blue-400'}`}></div>
                  <div className={`flex-1 h-1 rounded ${modalStep >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalStep === 1 ? (
                <form onSubmit={handleSubmitProcessus} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nom du processus *
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Fabrication pièce A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Référence *
                      </label>
                      <input
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: PROC-001"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Calendar size={18} className="text-blue-600" />
                        Date de début *
                      </label>
                      <input
                        type="date"
                        value={formData.dateDebut}
                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                        min={getTodayDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Calendar size={18} className="text-blue-600" />
                        Date de fin *
                      </label>
                      <input
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                        min={formData.dateDebut || getTodayDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Décrivez le processus..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="actif">Actif</option>
                      <option value="archive">Archive</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-blue-400 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Enregistrement...' : editingId ? 'Enregistrer' : 'Suivant'}
                      {!editingId && <ArrowRight size={18} />}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Étapes du processus</h3>
                    <button
                      type="button"
                      onClick={addEtapeTemp}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      <Plus size={18} />
                      Ajouter une étape
                    </button>
                  </div>

                  {etapesTemp.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">Aucune étape ajoutée</p>
                      <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter une étape" pour commencer</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {etapesTemp.map((etape, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </span>
                            <h4 className="font-semibold text-gray-700">Étape {idx + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeEtapeTemp(idx)}
                              className="ml-auto bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="number"
                              placeholder="N°"
                              value={etape.numero}
                              onChange={(e) => updateEtapeTemp(idx, 'numero', parseInt(e.target.value))}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Nom de l'étape *"
                              value={etape.nom}
                              onChange={(e) => updateEtapeTemp(idx, 'nom', e.target.value)}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <textarea
                            placeholder="Description (optionnelle)"
                            value={etape.description}
                            onChange={(e) => updateEtapeTemp(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                          />
                          <input
                            type="number"
                            placeholder="Durée estimée (minutes)"
                            value={etape.dureeEstimee}
                            onChange={(e) => updateEtapeTemp(idx, 'dureeEstimee', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitEtapes}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-blue-400 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Enregistrement...' : 'Terminer'}
                      <Save size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter des étapes à un processus existant */}
      {showEtapesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Ajouter des Étapes</h2>
                  <p className="text-green-100 text-sm mt-1">Ajoutez de nouvelles étapes à ce processus</p>
                </div>
                <button
                  onClick={() => setShowEtapesModal(false)}
                  className="text-white hover:bg-green-800 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Nouvelles étapes</h3>
                  <button
                    type="button"
                    onClick={addEtapeTemp}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus size={18} />
                    Ajouter une étape
                  </button>
                </div>

                {etapesTemp.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Aucune étape ajoutée</p>
                    <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter une étape" pour avoir nouvelle étape</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {etapesTemp.map((etape, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-gray-700">Étape {idx + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeEtapeTemp(idx)}
                            className="ml-auto bg-red-500 text-white p-1 rounded hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="number"
                            placeholder="N°"
                            value={etape.numero}
                            onChange={(e) => updateEtapeTemp(idx, 'numero', parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            placeholder="Nom de l'étape *"
                            value={etape.nom}
                            onChange={(e) => updateEtapeTemp(idx, 'nom', e.target.value)}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Description (optionnelle)"
                          value={etape.description}
                          onChange={(e) => updateEtapeTemp(idx, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="2"
                        />
                        <input
                          type="number"
                          placeholder="Durée estimée (minutes)"
                          value={etape.dureeEstimee}
                          onChange={(e) => updateEtapeTemp(idx, 'dureeEstimee', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEtapesModal(false)}
                    className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitEtapes}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-green-400 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Enregistrement...' : 'Ajouter les étapes'}
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Package, Users, Wrench, Edit2, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EtapeDetailPage() {
  const { processusId, etapeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState(null);
  const [etape, setEtape] = useState(null);
  
  // Ressources disponibles
  const [materiauxDispo, setMateriauxDispo] = useState([]);
  const [operateursDispo, setOperateursDispo] = useState([]);
  const [equipementsDispo, setEquipementsDispo] = useState([]);
  
  // Modals
  const [showMateriauModal, setShowMateriauModal] = useState(false);
  const [showOperateurModal, setShowOperateurModal] = useState(false);
  const [showEquipementModal, setShowEquipementModal] = useState(false);
  const [editingEtape, setEditingEtape] = useState(false);
  
  // Forms
  const [selectedMateriau, setSelectedMateriau] = useState('');
  const [quantite, setQuantite] = useState(0);
  const [selectedOperateurs, setSelectedOperateurs] = useState([]);
  const [selectedEquipements, setSelectedEquipements] = useState([]);
  
  const [etapeForm, setEtapeForm] = useState({
    nom: '',
    description: '',
    dureeEstimee: 0,
    numero: 1
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api/processus';

  useEffect(() => {
    fetchData();
    fetchRessources();
  }, [processusId, etapeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${processusId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProcessus(res.data);
      const currentEtape = res.data.etapes.find(e => e._id === etapeId);
      setEtape(currentEtape);
      setEtapeForm({
        nom: currentEtape?.nom || '',
        description: currentEtape?.description || '',
        dureeEstimee: currentEtape?.dureeEstimee || 0,
        numero: currentEtape?.numero || 1
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Erreur', 'Impossible de charger les données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRessources = async () => {
    try {
      const [matRes, opRes, eqRes] = await Promise.all([
        axios.get('http://localhost:5000/api/materiaux', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/operateurs', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/equipements', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setMateriauxDispo(matRes.data);
      
      // Filtrer uniquement les opérateurs actifs
      const operateursActifs = opRes.data.filter(op => op.statut === 'actif');
      setOperateursDispo(operateursActifs);
      
      // Filtrer uniquement les équipements disponibles
      const equipementsDisponibles = eqRes.data.filter(eq => eq.statut === 'disponible');
      setEquipementsDispo(equipementsDisponibles);
      
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
    }
  };

  // === GESTION DES MATÉRIAUX ===
  const handleAddMateriau = async () => {
    //  Debug
    console.log('processusId:', processusId);
    console.log('etapeId:', etapeId);
    console.log('selectedMateriau:', selectedMateriau);
    console.log('quantite:', quantite);

    if (!selectedMateriau || !quantite || quantite <= 0) {
      Swal.fire('Attention', 'Sélectionnez un matériau et une quantité valide', 'warning');
      return;
    }

    //  VÉRIFICATION DU STOCK DISPONIBLE
    const materiauSelectionne = materiauxDispo.find(m => m._id === selectedMateriau);
    
    if (!materiauSelectionne) {
      Swal.fire('Erreur', 'Matériau introuvable', 'error');
      return;
    }

    const stockDisponible = materiauSelectionne.quantiteStock || 0;
    const quantiteDemandee = parseFloat(quantite);

    if (quantiteDemandee > stockDisponible) {
      Swal.fire({
        icon: 'error',
        title: 'Stock insuffisant',
        text: `Stock disponible : ${stockDisponible} ${materiauSelectionne.unite}. Quantité demandée : ${quantiteDemandee} ${materiauSelectionne.unite}`,
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/${processusId}/etapes/${etapeId}/materiaux`;
      console.log('🔗 URL complète:', url);

      const response = await axios.post(
        url,
        { 
          materiauId: selectedMateriau, 
          quantiteNecessaire: quantiteDemandee
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(' Réponse:', response.data);
      Swal.fire('Succès', 'Matériau ajouté', 'success');
      fetchData();
      setShowMateriauModal(false);
      setSelectedMateriau('');
      setQuantite(0);
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('URL tentée:', `${API_URL}/${processusId}/etapes/${etapeId}/materiaux`);
      Swal.fire('Erreur', err.response?.data?.message || 'Impossible d\'ajouter le matériau', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMateriau = async (materiauId) => {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${API_URL}/${processusId}/etapes/${etapeId}/materiaux/${materiauId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire('Supprimé', 'Matériau retiré', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Erreur', 'Impossible de supprimer', 'error');
        }
      }
    });
  };

  // === GESTION DES OPÉRATEURS ===
  const handleAddOperateurs = async () => {
    if (selectedOperateurs.length === 0) {
      Swal.fire('Attention', 'Sélectionnez au moins un opérateur', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/${processusId}/etapes/${etapeId}/operateurs`,
        { operateurs: selectedOperateurs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Succès', 'Opérateur(s) ajouté(s)', 'success');
      fetchData();
      setShowOperateurModal(false);
      setSelectedOperateurs([]);
    } catch (err) {
      Swal.fire('Erreur', 'Impossible d\'ajouter les opérateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOperateur = async (operateurId) => {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${API_URL}/${processusId}/etapes/${etapeId}/operateurs/${operateurId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire('Supprimé', 'Opérateur retiré', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Erreur', 'Impossible de supprimer', 'error');
        }
      }
    });
  };

  // === GESTION DES ÉQUIPEMENTS ===
  const handleAddEquipements = async () => {
    if (selectedEquipements.length === 0) {
      Swal.fire('Attention', 'Sélectionnez au moins un équipement', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/${processusId}/etapes/${etapeId}/equipements`,
        { equipements: selectedEquipements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Succès', 'Équipement(s) ajouté(s)', 'success');
      fetchData();
      setShowEquipementModal(false);
      setSelectedEquipements([]);
    } catch (err) {
      Swal.fire('Erreur', 'Impossible d\'ajouter les équipements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEquipement = async (equipementId) => {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${API_URL}/${processusId}/etapes/${etapeId}/equipements/${equipementId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire('Supprimé', 'Équipement retiré', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Erreur', 'Impossible de supprimer', 'error');
        }
      }
    });
  };

  // === MODIFIER L'ÉTAPE ===
  const handleUpdateEtape = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/${processusId}/etapes/${etapeId}`,
        etapeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Succès', 'Étape modifiée', 'success');
      fetchData();
      setEditingEtape(false);
    } catch (err) {
      Swal.fire('Erreur', 'Impossible de modifier l\'étape', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !etape) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!etape) {
    return (
      <div className="p-8">
        <p className="text-red-500">Étape introuvable</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/processus')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Retour aux processus
        </button>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editingEtape ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={etapeForm.numero}
                      onChange={(e) => setEtapeForm({ ...etapeForm, numero: parseInt(e.target.value) })}
                      className="px-3 py-2 border rounded-lg"
                      placeholder="N° étape"
                    />
                    <input
                      type="text"
                      value={etapeForm.nom}
                      onChange={(e) => setEtapeForm({ ...etapeForm, nom: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      placeholder="Nom de l'étape"
                    />
                  </div>
                  <textarea
                    value={etapeForm.description}
                    onChange={(e) => setEtapeForm({ ...etapeForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Description"
                    rows="2"
                  />
                  <input
                    type="number"
                    value={etapeForm.dureeEstimee}
                    onChange={(e) => setEtapeForm({ ...etapeForm, dureeEstimee: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Durée (min)"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {etape.numero}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800">{etape.nom}</h1>
                  </div>
                  {etape.description && (
                    <p className="text-gray-600 mt-2">{etape.description}</p>
                  )}
                  {etape.dureeEstimee > 0 && (
                    <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Durée: {etape.dureeEstimee} min
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              {editingEtape ? (
                <>
                  <button
                    onClick={() => setEditingEtape(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateEtape}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Enregistrer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingEtape(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Modifier l'étape
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Processus: <span className="font-semibold">{processus?.nom}</span>
          </div>
        </div>
      </div>

      {/* Ressources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MATÉRIAUX */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-orange-500" size={24} />
              Matériaux
            </h2>
            <button
              onClick={() => setShowMateriauModal(true)}
              className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {etape.materiaux && etape.materiaux.length > 0 ? (
            <div className="space-y-3">
              {etape.materiaux.map((mat) => (
                <div key={mat._id} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {mat.materiau?.nom || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantité: {mat.quantiteNecessaire} {mat.materiau?.unite}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMateriau(mat._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Aucun matériau</p>
          )}
        </div>

        {/* OPÉRATEURS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-purple-500" size={24} />
              Opérateurs
            </h2>
            <button
              onClick={() => setShowOperateurModal(true)}
              className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {etape.operateurs && etape.operateurs.length > 0 ? (
            <div className="space-y-3">
              {etape.operateurs.map((op) => (
                <div key={op._id || op} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {typeof op === 'object' ? `${op.prenom} ${op.nom}` : 'N/A'}
                      </p>
                      {typeof op === 'object' && op.matricule && (
                        <p className="text-xs text-gray-600">Mat: {op.matricule}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveOperateur(typeof op === 'object' ? op._id : op)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Aucun opérateur</p>
          )}
        </div>

        {/* ÉQUIPEMENTS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Wrench className="text-green-500" size={24} />
              Équipements
            </h2>
            <button
              onClick={() => setShowEquipementModal(true)}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {etape.equipements && etape.equipements.length > 0 ? (
            <div className="space-y-3">
              {etape.equipements.map((eq) => (
                <div key={eq._id || eq} className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {typeof eq === 'object' ? eq.nom : 'N/A'}
                      </p>
                      {typeof eq === 'object' && eq.reference && (
                        <p className="text-xs text-gray-600">Ref: {eq.reference}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveEquipement(typeof eq === 'object' ? eq._id : eq)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Aucun équipement</p>
          )}
        </div>
      </div>

      {/* MODALS */}
      
      {/* Modal Matériaux */}
      {showMateriauModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Ajouter un matériau</h3>
            <div className="space-y-4">
              <select
                value={selectedMateriau}
                onChange={(e) => setSelectedMateriau(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un matériau</option>
                {materiauxDispo.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nom} (Stock: {m.quantiteStock} {m.unite})
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={quantite}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantite(val === '' ? 0 : parseFloat(val));
                }}
                placeholder="Quantité nécessaire"
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMateriauModal(false);
                  setSelectedMateriau('');
                  setQuantite(0);
                }}
                className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMateriau}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Opérateurs */}
      {showOperateurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Ajouter des opérateurs</h3>
            {operateursDispo.length > 0 ? (
              <div className="space-y-2">
                {operateursDispo.map((op) => (
                  <label key={op._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOperateurs.includes(op._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOperateurs([...selectedOperateurs, op._id]);
                        } else {
                          setSelectedOperateurs(selectedOperateurs.filter(id => id !== op._id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{op.prenom} {op.nom}</span>
                    <span className="text-xs text-gray-500">({op.matricule})</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Actif
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">
                Aucun opérateur actif disponible pour le moment
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOperateurModal(false);
                  setSelectedOperateurs([]);
                }}
                className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddOperateurs}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                disabled={selectedOperateurs.length === 0}
              >
                Ajouter ({selectedOperateurs.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Équipements */}
      {showEquipementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Ajouter des équipements</h3>
            {equipementsDispo.length > 0 ? (
              <div className="space-y-2">
                {equipementsDispo.map((eq) => (
                  <label key={eq._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEquipements.includes(eq._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEquipements([...selectedEquipements, eq._id]);
                        } else {
                          setSelectedEquipements(selectedEquipements.filter(id => id !== eq._id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{eq.nom}</span>
                    <span className="text-xs text-gray-500">({eq.reference})</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Disponible
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">
                Aucun équipement disponible pour le moment
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEquipementModal(false);
                  setSelectedEquipements([]);
                }}
                className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEquipements}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                disabled={selectedEquipements.length === 0}
              >
                Ajouter ({selectedEquipements.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
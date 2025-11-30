// src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        motDePasse 
      });
      
      console.log('🔍 Réponse backend complète:', res.data);
      console.log('🔍 Token reçu:', res.data.token);

      // ✅ Stocker le token
      localStorage.setItem('token', res.data.token);
      
      // ✅ Envoyer le token à setUserData (qui va le décoder)
      setUserData(res.data.token);

      console.log('✅ setUserData appelé avec le token');
      console.log('✅ Connexion réussie - Navigation vers /');
      
      // Redirection vers le dashboard
      navigate('/');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur serveur, réessayez plus tard.');
      }
      console.error("❌ Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-3">
          Pas de compte ?{" "}
          <a href="/register" className="text-blue-600 underline">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
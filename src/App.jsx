import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://hackaton-nasa-backend.onrender.com/';

// Datos de fallback por si el backend no responde
const FALLBACK_DATA = {
  cities: [
    { id: 'lima', name: 'Lima', status: 'CRÍTICO', health_score: 35 },
    { id: 'huanuco', name: 'Huánuco', status: 'SALUDABLE', health_score: 82 },
    { id: 'cusco', name: 'Cusco', status: 'MODERADO', health_score: 58 },
    { id: 'arequipa', name: 'Arequipa', status: 'MODERADO', health_score: 62 }
  ],
  analysis: {
    lima: {
      name: "Lima Metropolitana",
      status: "CRÍTICO",
      blue_ratio: 0.68,
      orange_ratio: 0.32,
      health_score: 35,
      description: "Capital del Perú, mayor concentración urbana",
      image_url: "https://images.pexels.com/photos/29038651/pexels-photo-29038651.jpeg",
      history: [
        { year: 2020, blue_ratio: 0.56, orange_ratio: 0.44 },
        { year: 2021, blue_ratio: 0.60, orange_ratio: 0.40 },
        { year: 2022, blue_ratio: 0.64, orange_ratio: 0.36 },
        { year: 2023, blue_ratio: 0.68, orange_ratio: 0.32 }
      ],
      recommendations: [
        "Reemplazo urgente de LED azules en Lima",
        "Implementar horarios de apagado nocturno",
        "Auditoría lumínica cada 3 meses",
        "Campaña de concienciación ciudadana"
      ]
    }
    // ... agregar datos para las otras ciudades
  }
};

function App() {
  const [cities, setCities] = useState(FALLBACK_DATA.cities);
  const [selectedCity, setSelectedCity] = useState('lima');
  const [analysis, setAnalysis] = useState(FALLBACK_DATA.analysis.lima);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    fetchCities();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        setBackendOnline(true);
        console.log('✅ Backend conectado');
      } else {
        setBackendOnline(false);
        console.log('⚠️ Usando datos locales');
      }
    } catch (error) {
      setBackendOnline(false);
      console.log('❌ Backend offline, usando datos locales');
    }
  };

  const fetchCities = async () => {
    if (!backendOnline) {
      setCities(FALLBACK_DATA.cities);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/cities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      } else {
        setCities(FALLBACK_DATA.cities);
      }
    } catch (error) {
      setCities(FALLBACK_DATA.cities);
    }
  };

  const analyzeCity = async (cityId) => {
    setLoading(true);
    
    if (!backendOnline && FALLBACK_DATA.analysis[cityId]) {
      setAnalysis(FALLBACK_DATA.analysis[cityId]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/analyze/${cityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else if (FALLBACK_DATA.analysis[cityId]) {
        setAnalysis(FALLBACK_DATA.analysis[cityId]);
      }
    } catch (error) {
      if (FALLBACK_DATA.analysis[cityId]) {
        setAnalysis(FALLBACK_DATA.analysis[cityId]);
      }
    }
    
    setLoading(false);
  };

  // El resto de tu componente igual...
  const getStatusColor = (status) => {
    switch (status) {
      case 'SALUDABLE': return 'success';
      case 'MODERADO': return 'warning';
      case 'CRÍTICO': return 'danger';
      default: return 'secondary';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 70) return '#28a745';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="container py-4">
      {/* Indicador de estado del backend */}
      <div className={`alert ${backendOnline ? 'alert-success' : 'alert-warning'} text-center`}>
        {backendOnline ? '✅ Conectado al servidor NASA' : '⚠️ Modo demostración - Datos locales'}
      </div>

      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">🌍 Light Pollution Guardian</h1>
        <p className="lead">Monitoreo de contaminación lumínica - NASA Hackathon</p>
      </div>

      {/* Selector de Ciudad */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="row g-2">
            {cities.map(city => (
              <div key={city.id} className="col-md-3 col-6">
                <button
                  className={`btn w-100 ${selectedCity === city.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => {
                    setSelectedCity(city.id);
                    analyzeCity(city.id);
                  }}
                  disabled={loading}
                >
                  <div>
                    <strong>{city.name.split(' ')[0]}</strong>
                    <br />
                    <small className={`badge bg-${getStatusColor(city.status)}`}>
                      {city.status}
                    </small>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Resultados - Mismo código que antes */}
      {analysis && !loading && (
        <div className="row">
          <div className="col-lg-12">
            {/* ... tu código de visualización existente */}
            <div className="card shadow-sm mb-4">
              <div className="row g-0">
                <div className="col-md-5">
                  <img 
                    src={analysis.image_url} 
                    className="img-fluid rounded-start h-100"
                    alt={analysis.name}
                    style={{objectFit: 'cover', minHeight: '300px'}}
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg';
                    }}
                  />
                </div>
                <div className="col-md-7">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="card-title">{analysis.name}</h3>
                        <p className="text-muted">{analysis.description}</p>
                      </div>
                      <span className={`badge bg-${getStatusColor(analysis.status)} fs-6`}>
                        {analysis.status}
                      </span>
                    </div>

                    <div className="text-center my-4">
                      <div 
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundColor: getHealthColor(analysis.health_score),
                          border: '4px solid #333',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.8rem'
                        }}
                      >
                        {analysis.health_score}
                      </div>
                      <p className="mt-2">Puntaje de Salud</p>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <strong>🔵 LED Azul:</strong>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-primary" style={{width: `${analysis.blue_ratio * 100}%`}}>
                            {(analysis.blue_ratio * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <strong>🟠 Sodio Naranja:</strong>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-warning" style={{width: `${analysis.orange_ratio * 100}%`}}>
                            {(analysis.orange_ratio * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico y recomendaciones... */}
          </div>
        </div>
      )}

      <footer className="mt-5 text-center text-muted">
        <hr />
        <p>Light Pollution Guardian - NASA Space Apps Challenge 2024</p>
      </footer>
    </div>
  );
}

export default App;
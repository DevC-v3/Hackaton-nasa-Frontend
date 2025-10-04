import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://hackaton-nasa-backend.onrender.com';

function App() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

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
      });
      
      if (response.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (error) {
      setBackendOnline(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCities(data);
        if (data.length > 0) {
          setSelectedCity(data[0].id);
          analyzeCity(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const analyzeCity = async (cityId) => {
    if (!cityId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze/${cityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing city:', error);
    }
    setLoading(false);
  };

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
      {!backendOnline && (
        <div className="alert alert-warning text-center">
          ⚠️ Intentando conectar con el servidor...
        </div>
      )}

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
          <p className="mt-2">Obteniendo datos del satélite...</p>
        </div>
      )}

      {/* Resultados */}
      {analysis && !loading && (
        <div className="row">
          <div className="col-lg-12">
            
            {/* Tarjeta Principal */}
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
                        <p className="text-muted mb-0">
                          <strong>Región:</strong> {analysis.region} | 
                          <strong> Población:</strong> {analysis.population?.toLocaleString()}
                        </p>
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
                      <p className="mt-2">Puntaje de Salud Lumínica</p>
                      <small className="text-muted">0-100 (mayor es mejor)</small>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <strong>🔵 LED Azul (Contaminante):</strong>
                        <div className="progress mt-1" style={{height: '25px'}}>
                          <div className="progress-bar bg-primary" style={{width: `${analysis.blue_ratio * 100}%`}}>
                            {(analysis.blue_ratio * 100).toFixed(1)}%
                          </div>
                        </div>
                        <small className="text-muted">Mayor porcentaje = más contaminación</small>
                      </div>
                      <div className="col-md-6">
                        <strong>🟠 Sodio Naranja (Saludable):</strong>
                        <div className="progress mt-1" style={{height: '25px'}}>
                          <div className="progress-bar bg-warning" style={{width: `${analysis.orange_ratio * 100}%`}}>
                            {(analysis.orange_ratio * 100).toFixed(1)}%
                          </div>
                        </div>
                        <small className="text-muted">Mayor porcentaje = menos contaminación</small>
                      </div>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        📅 Actualizado: {analysis.last_updated} | 
                        🛰️ Fuente: {analysis.data_source}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Evolución */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">📈 Evolución de la Contaminación Lumínica (2020-2023)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.history}>
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="blue_ratio" name="LED Azul" fill="#8884d8" />
                    <Bar dataKey="orange_ratio" name="Sodio Naranja" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">💡 Plan de Acción para {analysis.name}</h5>
                <div className="row">
                  {analysis.recommendations?.map((recommendation, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-start">
                        <span className="badge bg-primary me-3 mt-1">{index + 1}</span>
                        <span>{recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {!analysis && !loading && cities.length === 0 && (
        <div className="text-center">
          <div className="alert alert-info">
            <h4>🌍 Bienvenido a Light Pollution Guardian</h4>
            <p className="mb-0">Cargando datos de monitoreo satelital...</p>
          </div>
        </div>
      )}

      <footer className="mt-5 text-center text-muted">
        <hr />
        <p className="small">
          <strong>Light Pollution Guardian</strong> - NASA Space Apps Challenge 2024 | 
          Monitoreo de contaminación lumínica en ciudades del Perú
        </p>
      </footer>
    </div>
  );
}

export default App;
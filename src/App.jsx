// frontend/src/App.jsx - CON MANEJO DE IMÁGENES
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Componente para imágenes con fallback
function CityImage({ city, imageUrl }) {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    // Fallback a placeholder genérico
    setImgSrc(`https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="position-relative">
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando imagen...</span>
          </div>
        </div>
      )}
      <img 
        src={imgSrc} 
        className="img-fluid rounded-start h-100"
        alt={`Vista de ${city.name}`}
        style={{ 
          objectFit: 'cover', 
          minHeight: '300px',
          width: '100%',
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

function App() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nasaStatus, setNasaStatus] = useState(null);

  useEffect(() => {
    fetchCities();
    checkNasaStatus();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/cities`);
      setCities(response.data);
      setSelectedCity('lima');
      analyzeCity('lima');
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const checkNasaStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/nasa-status`);
      setNasaStatus(response.data);
    } catch (error) {
      console.error('Error checking NASA status:', error);
    }
  };

  const analyzeCity = async (cityId) => {
    if (!cityId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/analyze/${cityId}`);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing city:', error);
      alert('Error al conectar con APIs NASA');
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
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">🌍 Light Pollution Guardian</h1>
        <p className="lead">Datos en tiempo real de satélites NASA</p>
        
        {nasaStatus && (
          <div className="alert alert-success py-2">
            <small>
              <strong>✅ CONECTADO A NASA</strong> | 
              🛰️ {nasaStatus.data_sources_operational?.length} APIs activas | 
              📡 {nasaStatus.active_events} eventos | 
              ☄️ {nasaStatus.asteroids_today} asteroides hoy
            </small>
          </div>
        )}
      </div>

      {/* Selector de Ciudad */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <label className="form-label h6">Ciudades del Perú monitoreadas por NASA:</label>
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
                    <br />
                    <small className="text-muted">
                      🛰️ {city.nasa_events_count} eventos
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
            <span className="visually-hidden">Conectando con NASA...</span>
          </div>
          <p className="mt-2">
            <strong>Obteniendo datos en tiempo real de satélites NASA...</strong>
          </p>
        </div>
      )}

      {/* Resultados con Datos Reales */}
      {analysis && !loading && (
        <div className="row">
          <div className="col-lg-12">
            
            {/* Tarjeta Principal con Imagen */}
            <div className="card shadow-sm mb-4">
              <div className="row g-0">
                <div className="col-md-5">
                  <CityImage city={analysis} imageUrl={analysis.image_url} />
                </div>
                
                <div className="col-md-7">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="card-title">{analysis.name}</h3>
                        <p className="text-muted mb-2">{analysis.description}</p>
                      </div>
                      <span className={`badge bg-${getStatusColor(analysis.status)} fs-6`}>
                        {analysis.status}
                      </span>
                    </div>

                    {/* Información NASA */}
                    <div className="alert alert-info py-2 mt-3">
                      <small>
                        <strong>🛰️ Datos NASA en tiempo real</strong><br />
                        Fuentes: {analysis.data_sources?.join(' • ')}
                      </small>
                    </div>

                    {/* Semáforo de Salud */}
                    <div className="text-center mt-3">
                      <div 
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2"
                        style={{
                          width: '100px',
                          height: '100px',
                          backgroundColor: getHealthColor(analysis.health_score),
                          border: '4px solid #333',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.5rem'
                        }}
                      >
                        {analysis.health_score}
                      </div>
                      <p className="mb-0">Puntaje de Salud Lumínica</p>
                      <small className="text-muted">0-100 (mayor es mejor)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos NASA en Tiempo Real */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <strong>🛰️ Datos Satelitales NASA</strong>
                  </div>
                  <div className="card-body">
                    {analysis.earth_imagery?.image_available && (
                      <div className="mb-3">
                        <strong>🌍 Imagen Satelital:</strong>
                        <div className="mt-1">
                          <a href={analysis.earth_imagery.image_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                            Ver Imagen NASA
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {analysis.nighttime_data?.has_night_data && (
                      <div className="mb-3">
                        <strong>🌙 Luces Nocturnas:</strong>
                        <br />
                        <span className="badge bg-success">Datos VIIRS Disponibles</span>
                      </div>
                    )}

                    <div className="mb-2">
                      <strong>☄️ Asteroides Hoy:</strong>
                      <br />
                      <span className="badge bg-info">{analysis.asteroids_data?.asteroids_today} detectados</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-warning text-dark">
                    <strong>📊 Métricas de Contaminación</strong>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>🔵 LED Azul (Contaminante):</strong>
                      <div className="progress mt-1" style={{height: '25px'}}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{width: `${analysis.blue_ratio * 100}%`}}
                        >
                          {(analysis.blue_ratio * 100).toFixed(1)}%
                        </div>
                      </div>
                      <small className="text-muted">Mayor porcentaje = más contaminación</small>
                    </div>

                    <div className="mb-3">
                      <strong>🟠 Sodio Naranja (Saludable):</strong>
                      <div className="progress mt-1" style={{height: '25px'}}>
                        <div 
                          className="progress-bar bg-warning" 
                          style={{width: `${analysis.orange_ratio * 100}%`}}
                        >
                          {(analysis.orange_ratio * 100).toFixed(1)}%
                        </div>
                      </div>
                      <small className="text-muted">Mayor porcentaje = menos contaminación</small>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        📅 Actualizado: {analysis.last_updated}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos NASA */}
            {analysis.nasa_events && analysis.nasa_events.length > 0 && (
              <div className="card shadow-sm mb-4 border-info">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">🚀 Eventos NASA Activos</h5>
                </div>
                <div className="card-body">
                  {analysis.nasa_events.map((event, index) => (
                    <div key={index} className="mb-3 p-3 border rounded">
                      <h6 className="mb-1">📡 {event.title}</h6>
                      <p className="mb-1 text-muted">
                        <strong>Categoría:</strong> {event.category}
                      </p>
                      <small className="text-muted">
                        <strong>Fecha:</strong> {event.date} | 
                        <strong> Fuente:</strong> {event.source}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gráfico y Recomendaciones */}
            <div className="row">
              <div className="col-md-8">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">📈 Tendencia 2020-2023 (Basado en datos NASA)</h5>
                    <ResponsiveContainer width="100%" height={250}>
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
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-success text-white">
                    <strong>💡 Recomendaciones NASA</strong>
                  </div>
                  <div className="card-body">
                    {analysis.recommendations?.map((rec, index) => (
                      <div key={index} className="mb-2">
                        <small>• {rec}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 text-center text-muted">
        <hr />
        <p className="small">
          <strong>Light Pollution Guardian</strong> - NASA Space Apps Challenge 2024 | 
          Datos en tiempo real de APIs oficiales NASA
        </p>
      </footer>
    </div>
  );
}

export default App;
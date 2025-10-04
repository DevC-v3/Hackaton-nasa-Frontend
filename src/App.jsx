import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cities`);
      const data = await response.json();
      setCities(data);
      setSelectedCity('lima');
      analyzeCity('lima');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const analyzeCity = async (cityId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze/${cityId}`);
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
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

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

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

            {/* Gráfico */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5>📈 Evolución 2020-2023</h5>
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
                <h5>💡 Recomendaciones</h5>
                <div className="row">
                  {analysis.recommendations?.map((rec, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="d-flex">
                        <span className="badge bg-primary me-2">{index + 1}</span>
                        <span>{rec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
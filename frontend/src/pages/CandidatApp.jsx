import React, { useState, useEffect } from 'react';
import axios from 'axios';
// You can create a CSS file for styling

const CandidatApplications = ({ candidatId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/applications/by-candidat/${candidatId}`
        );
        setApplications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch applications.');
        setLoading(false);
      }
    };

    if (candidatId) {
      fetchApplications();
    }
  }, [candidatId]);

  if (loading) {
    return <div className="loading-message">Loading applications...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (applications.length === 0) {
    return <div className="no-applications">You have not applied to any job offers yet.</div>;
  }

  return (
    <div className="candidat-applications-container">
      <h2>My Job Applications</h2>
      <ul className="application-list">
        {applications.map((app) => (
          <li key={app.id} className="application-item">
            <div className="application-info">
              <h3>{app.jobOffer.title}</h3>
              <p>Company: {app.jobOffer.company}</p>
              <p>Status: <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
              <p>Applied on: {new Date(app.applicationDate).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CandidatApplications;
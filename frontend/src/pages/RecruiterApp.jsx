import React, { useState, useEffect } from 'react';
import axios from 'axios';
// You can create a CSS file for styling

const RecruiterApplications = ({ recruiterId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/applications/by-recruiter/${recruiterId}`
      );
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recruiterId) {
      fetchApplications();
    }
  }, [recruiterId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/applications/${applicationId}/status?newStatus=${newStatus}`
      );
      // Optimistically update the UI or refetch data
      fetchApplications();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-message">Loading applications...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (applications.length === 0) {
    return <div className="no-applications">No applications found for your job offers.</div>;
  }

  return (
    <div className="recruiter-applications-container">
      <h2>All Job Applications</h2>
      <ul className="application-list">
        {applications.map((app) => (
          <li key={app.id} className="application-item">
            <div className="application-info">
              <h3>Applicant: {app.candidat.name}</h3>
              <p>Job Offer: {app.jobOffer.title}</p>
              <p>Applied on: {new Date(app.applicationDate).toLocaleDateString()}</p>
            </div>
            <div className="application-status">
              <label htmlFor={`status-${app.id}`}>Current Status: </label>
              <select
                id={`status-${app.id}`}
                value={app.status}
                onChange={(e) => handleStatusChange(app.id, e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecruiterApplications;
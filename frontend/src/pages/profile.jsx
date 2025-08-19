import React, { useState, useEffect } from "react";
import { authAPI } from "../api/api";
import axios from 'axios';
import "../css/profile.css";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    let userMeData = {};

    // Step 1: Fetch general user data first
    axios
      .get("/api/user/me", { headers })
      .then((res) => {
        const id = res.data?.id;
        userMeData = res.data; // Store the general user data
        console.log("User object from /api/user/me:", userMeData);

        const rolesRaw = userMeData.roles;
        const userRoles = Array.isArray(rolesRaw)
          ? rolesRaw.map((r) => (typeof r === "string" ? r : r.name))
          : [];

        if (userRoles.includes("ROLE_CANDIDAT")) {
          setRole("CANDIDAT");
          // Step 2: Return a promise for the role-specific profile
          return axios.get("/api/candidat/profile", { headers });
        } else if (userRoles.includes("ROLE_RECRUITER")) {
          setRole("RECRUITER");
          return axios.get("/api/recruiter/profile", { headers });
        } else {
          throw new Error("Unknown role");
        }
      })
      .then((res) => {
        // Step 3: Combine both data sources before setting state
        setProfile({ ...userMeData, ...res.data });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const url =
      role === "CANDIDAT"
        ? "/api/candidat/profile"
        : "/api/recruiter/profile";

    // If CANDIDAT and file is present, use FormData
    if (role === "CANDIDAT" && profile.cvFile) {
      const formData = new FormData();
      formData.append("firstName", profile.firstName || "");
      formData.append("lastName", profile.lastName || "");
      formData.append("age", profile.age || "");
      formData.append("cvFile", profile.cvFile);
      formData.append("cvUrl", profile.cvUrl || "");
      formData.append("username", profile.username || "");
      axios
        .post(url, formData, { headers: { ...headers, "Content-Type": "multipart/form-data" } })
        .then(() => alert("Profile updated"))
        .catch((err) => console.error("Error updating profile:", err));
      return;
    }

    // Default: JSON
    axios
      .post(url, profile, { headers })
      .then(() => alert("Profile updated"))
      .catch((err) => console.error("Error updating profile:", err));
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>{role} Profile</h2>
      <div className="profile-details">
        <span><b>Name:</b> {profile.firstName} {profile.lastName}</span>
        <span><b>Username:</b> {profile.username}</span>
        {role === "CANDIDAT" && (
          <>
            <span><b>Age:</b> {profile.age}</span>
            <span><b>CV URL:</b> <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">{profile.cvUrl}</a></span>
          </>
        )}
        {role === "RECRUITER" && (
          <span><b>Entreprise:</b> {profile.entreprise}</span>
        )}
        <span><b>Role(s):</b> {Array.isArray(profile.roles) ? profile.roles.map(r => typeof r === "string" ? r : r.name).join(", ") : ""}</span>
      </div>

      <input
        type="text"
        name="firstName"
        value={profile.firstName || ""}
        onChange={handleChange}
        placeholder="First Name"
      />

      <input
        type="text"
        name="lastName"
        value={profile.lastName || ""}
        onChange={handleChange}
        placeholder="Last Name"
      />

      {/* CV Upload for CANDIDAT */}
      {role === "CANDIDAT" && (
        <>
          <input
            type="number"
            name="age"
            value={profile.age || ""}
            onChange={handleChange}
            placeholder="Age"
          />
          {/* Only show CV URL if no file is selected */}
          {!profile.cvFile && (
            <input
              type="text"
              name="cvUrl"
              value={profile.cvUrl || ""}
              onChange={handleChange}
              placeholder="CV URL (or upload a file)"
            />
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={e => setProfile({ ...profile, cvFile: e.target.files[0], cvUrl: undefined })}
          />
        </>
      )}

      {role === "RECRUITER" && (
        <>
          <input
            type="text"
            name="entreprise"
            value={profile.entreprise || ""}
            onChange={handleChange}
            placeholder="Entreprise Name"
          />
        </>
      )}

      <button onClick={handleSubmit}>Save Profile</button>
    </div>
  );
};

export default Profile;
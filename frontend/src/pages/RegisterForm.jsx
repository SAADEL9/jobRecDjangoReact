import React, { useState } from "react";
import { authAPI } from '../api/api';
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
  email: "",
  password: "",
  password2: "",
  user_type: "candidate",
  first_name: "",
  last_name: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.password2.trim()) newErrors.password2 = "Please confirm your password";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.password2)
      newErrors.password2 = "Passwords do not match";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const roleToSend = formData.roles[0].toLowerCase();
      const payload = {
        username: formData.username,
        password: formData.password,
        roles: [roleToSend],
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      if (roleToSend === "candidate") {
        payload.age = parseInt(formData.age);
        payload.cvUrl = formData.cvUrl;
      } else if (roleToSend === "recruiter") {
        payload.entreprise = formData.entreprise;
      }
      // Use axios from api.js
      const { authAPI } = require('../api/api');
      const response = await authAPI.register(payload);
      if (response.status !== 201 && response.status !== 200) {
        throw new Error(response.data?.message || "Registration failed");
      }
      navigate("/login");
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {serverError && <div className="error">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="mt-1 p-2 border rounded w-full"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <div className="error">{errors.username}</div>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="mt-1 p-2 border rounded w-full"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="error">{errors.password}</div>}

        <select
          name="user_type"
          value={formData.user_type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              user_type: e.target.value,
            }))
          }
          required
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="mt-1 p-2 border rounded w-full"
          value={formData.firstName}
          onChange={handleChange}
        />
        {errors.firstName && <div className="error">{errors.firstName}</div>}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="mt-1 p-2 border rounded w-full"
          value={formData.lastName}
          onChange={handleChange}
        />
        {errors.lastName && <div className="error">{errors.lastName}</div>}

  {/* ...existing code... */}

        <button type="submit" className="mt-3 p-2 bg-blue-500 text-white rounded">
          Register
        </button>
      </form>

      <Link to="/login" className="link mt-2 block text-blue-600">
        Already have an account? Login
      </Link>
    </div>
  );
};

export default RegisterForm;

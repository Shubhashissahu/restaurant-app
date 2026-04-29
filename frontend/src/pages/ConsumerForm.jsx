// src/pages/ConsumerForm.js
import { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API = 'http://localhost:5000/api';

export default function ConsumerForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!/^[0-9]{10}$/.test(form.phone))
      e.phone = 'Phone must be exactly 10 digits';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/consumers`, form);
      setMessage('Registration successful! Welcome aboard.');
      setForm({ name: '', email: '', phone: '' });
    } catch (err) {
      setMessage(
        err.response?.data?.message || 'Registration failed. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register — RestaurantApp</title>
      </Helmet>

      <div className="form-container">
        <h1>Consumer Registration</h1>

        {message && (
          <div
            className={`alert ${
              message.includes('successful')
                ? 'alert-success'
                : 'alert-error'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              maxLength={10}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </>
  );
}
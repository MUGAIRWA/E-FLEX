import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InputField from '../ui/InputField';
import { Button } from '../ui/Button';

const RegisterFormParent = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    childEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().split(/\s+/).length < 2) {
      newErrors.fullName = 'Please enter both first and last name';
    }
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nameParts = formData.fullName.trim().split(/\s+/);
    const registrationData = {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      email: formData.email.trim(),
      phoneNumber: formData.phone.trim(),
      password: formData.password,
      role: 'parent',
      ...(formData.childEmail && formData.childEmail.trim()
        ? { childEmail: formData.childEmail.trim() }
        : {})
    };

    if (typeof onSubmit === 'function') {
      await onSubmit(registrationData);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <InputField
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <InputField
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        required
      />

      <InputField
        label="Child's Student Email or Admission Number"
        type="text"
        name="childEmail"
        placeholder="e.g. student@school.ac.ke or ADM-2026-001"
        value={formData.childEmail}
        onChange={handleChange}
        error={errors.childEmail}
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Register'}
      </Button>
    </motion.form>
  );
};

export default RegisterFormParent;

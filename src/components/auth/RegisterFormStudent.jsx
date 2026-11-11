import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InputField from '../ui/InputField';
import { Button } from '../ui/Button';

const RegisterFormStudent = ({ onSubmit, loading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: '',
    email: '',
    password: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    class: '',
    stream: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const classOptions = [
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' }
  ];

  const streamOptions = [
    { value: 'Blue', label: 'Blue' },
    { value: 'Yellow', label: 'Yellow' },
    { value: 'Green', label: 'Green' },
    { value: 'Red', label: 'Red' },
    { value: 'White', label: 'White' },
    { value: 'Pink', label: 'Pink' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter both first and last name';
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent phone is required';
    if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Parent email is invalid';
    }
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.stream) newErrors.stream = 'Stream is required';
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
      password: formData.password,
      role: 'student',
      phoneNumber: formData.parentPhone.trim(),
      ...(formData.parentEmail.trim() ? { parentEmail: formData.parentEmail.trim() } : {}),
      admissionNumber: formData.admissionNumber.trim(),
      class: formData.class,
      stream: formData.stream,
      linkedParents: []
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
        label="Admission Number"
        type="text"
        name="admissionNumber"
        placeholder="Enter your admission number"
        value={formData.admissionNumber}
        onChange={handleChange}
        error={errors.admissionNumber}
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
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <InputField
        label="Parent Name"
        type="text"
        name="parentName"
        placeholder="Enter parent's full name"
        value={formData.parentName}
        onChange={handleChange}
        error={errors.parentName}
        required
      />

      <InputField
        label="Parent Phone Number"
        type="tel"
        name="parentPhone"
        placeholder="Enter parent's phone number"
        value={formData.parentPhone}
        onChange={handleChange}
        error={errors.parentPhone}
        required
      />

      <InputField
        label="Parent Email (Optional)"
        type="email"
        name="parentEmail"
        placeholder="Enter parent's email to auto-link accounts"
        value={formData.parentEmail}
        onChange={handleChange}
        error={errors.parentEmail}
      />

      <InputField
        label="Class"
        type="select"
        name="class"
        options={classOptions}
        value={formData.class}
        onChange={handleChange}
        error={errors.class}
        required
      />

      <InputField
        label="Stream"
        type="select"
        name="stream"
        options={streamOptions}
        value={formData.stream}
        onChange={handleChange}
        error={errors.stream}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading || isLoading}
      >
        {loading || isLoading ? 'Creating Account...' : 'Register'}
      </Button>
    </motion.form>
  );
};

export default RegisterFormStudent;

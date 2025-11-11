import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InputField from '../ui/InputField';
import { Button } from '../ui/Button';

const RegisterFormStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: '',
    email: '',
    password: '',
    parentName: '',
    parentPhone: '',
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
    { value: 'a', label: 'Stream A' },
    { value: 'b', label: 'Stream B' },
    { value: 'c', label: 'Stream C' }
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
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent phone is required';
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

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.fullName.split(' ')[0],
          lastName: formData.fullName.split(' ').slice(1).join(' '),
          email: formData.email,
          password: formData.password,
          role: 'student',
          phoneNumber: formData.parentPhone,
          admissionNumber: formData.admissionNumber,
          class: formData.class,
          stream: formData.stream,
          // Note: In a real app, you'd need to create/find parent users first
          linkedParents: [] // This would be populated when parents register
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth state
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
        navigate('/student/dashboard');
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
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
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Register'}
      </Button>
    </motion.form>
  );
};

export default RegisterFormStudent;

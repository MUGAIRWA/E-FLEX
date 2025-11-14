import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../ui/InputField';
import { Button } from '../ui/Button';

const RegisterFormTeacher = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    classesTaught: [],
    subjects: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const classOptions = [
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' }
  ];

  const subjectOptions = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Kiwahili', label: 'Kiwahili' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Geography', label: 'Geography' },
    { value: 'History', label: 'History' },
    { value: 'CRE', label: 'CRE' },
    { value: 'Business', label: 'Business' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Computer', label: 'Computer' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'French', label: 'French' }
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

  const handleMultiSelectChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.classesTaught.length === 0) newErrors.classesTaught = 'At least one class must be selected';
    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject must be selected';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Delegate to parent (AuthPage) which uses AuthContext to register
    if (typeof onSubmit === 'function') {
      const registrationData = {
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: 'teacher',
        teacherId: `TCH-${Date.now()}`,
        subjects: formData.subjects,
        classesTaught: formData.classesTaught
      };
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
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Classes Taught {errors.classesTaught && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {classOptions.map((classOption) => (
            <label key={classOption.value} className="flex items-center">
              <input
                type="checkbox"
                value={classOption.value}
                checked={formData.classesTaught.includes(classOption.value)}
                onChange={(e) => handleMultiSelectChange(e, 'classesTaught')}
                className="mr-2"
              />
              {classOption.label}
            </label>
          ))}
        </div>
        {errors.classesTaught && (
          <p className="mt-1 text-sm text-red-600">{errors.classesTaught}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects {errors.subjects && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {subjectOptions.map((subject) => (
            <label key={subject.value} className="flex items-center">
              <input
                type="checkbox"
                value={subject.value}
                checked={formData.subjects.includes(subject.value)}
                onChange={(e) => handleMultiSelectChange(e, 'subjects')}
                className="mr-2"
              />
              {subject.label}
            </label>
          ))}
        </div>
        {errors.subjects && (
          <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
        )}
      </div>

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

export default RegisterFormTeacher;

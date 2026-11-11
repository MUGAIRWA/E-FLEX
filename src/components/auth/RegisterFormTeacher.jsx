import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../ui/InputField';
import { Button } from '../ui/Button';
import { STREAMS } from '../../constants/subjects';

const RegisterFormTeacher = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    classesTaught: [], // Array of { class: 'form1', stream: 'Blue' }
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

  const streamOptions = STREAMS.map(stream => ({ value: stream, label: stream }));

  const subjectOptions = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Kiswahili', label: 'Kiswahili' },
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

  const handleClassChange = (e, classValue) => {
    const { checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          classesTaught: [...prev.classesTaught, { class: classValue, stream: '' }]
        };
      } else {
        return {
          ...prev,
          classesTaught: prev.classesTaught.filter(item => item.class !== classValue)
        };
      }
    });
  };

  const handleStreamChange = (classValue, streamValue) => {
    setFormData(prev => ({
      ...prev,
      classesTaught: prev.classesTaught.map(item =>
        item.class === classValue ? { ...item, stream: streamValue } : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter both first and last name';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.classesTaught.length === 0) newErrors.classesTaught = 'At least one class must be selected';
    const hasStreams = formData.classesTaught.every(item => item.stream && item.stream.trim() !== '');
    if (!hasStreams) newErrors.classesTaught = 'Please select a stream for each selected class';
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
      const nameParts = formData.fullName.trim().split(/\s+/);
      const streamsTaught = [
        ...new Set(formData.classesTaught.map((item) => item.stream).filter(Boolean))
      ];
      const registrationData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        role: 'teacher',
        teacherId: `TCH-${Date.now()}`,
        subjects: formData.subjects,
        classesTaught: formData.classesTaught,
        streamsTaught
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
        <label className="block text-sm font-semibold text-[#16211E] mb-2">
          Classes Taught <span className="text-[#C85A28]">*</span>
        </label>
        <div className="space-y-3">
          {classOptions.map((classOption) => {
            const isSelected = formData.classesTaught.some(item => item.class === classOption.value);
            const selectedStream = formData.classesTaught.find(item => item.class === classOption.value)?.stream || '';
            return (
              <div
                key={classOption.value}
                className={`border rounded-xl p-4 transition-colors ${
                  isSelected ? 'border-[#134E4A] bg-[#134E4A]/5' : 'border-[#D8D1C4] bg-white'
                }`}
              >
                <label className="flex items-center font-medium text-[#16211E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleClassChange(e, classOption.value)}
                    className="mr-2.5 accent-[#134E4A] w-4 h-4"
                  />
                  {classOption.label}
                </label>
                {isSelected && (
                  <div className="mt-3 pl-6">
                    <label className="block text-xs font-semibold text-[#5C6663] uppercase tracking-wider mb-1.5">
                      Select Stream for {classOption.label}
                    </label>
                    <select
                      value={selectedStream}
                      onChange={(e) => handleStreamChange(classOption.value, e.target.value)}
                      className="w-full p-2.5 border border-[#D8D1C4] bg-white text-[#16211E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134E4A] focus:border-[#134E4A]"
                      required
                    >
                      <option value="">Select a stream</option>
                      {streamOptions.map((stream) => (
                        <option key={stream.value} value={stream.value}>
                          {stream.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.classesTaught && (
          <p className="mt-1 text-sm text-red-600">{errors.classesTaught}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#16211E] mb-2">
          Subjects <span className="text-[#C85A28]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 p-4 rounded-xl border border-[#D8D1C4] bg-[#F8F6F1]/60">
          {subjectOptions.map((subject) => (
            <label key={subject.value} className="flex items-center text-sm text-[#16211E] cursor-pointer">
              <input
                type="checkbox"
                value={subject.value}
                checked={formData.subjects.includes(subject.value)}
                onChange={(e) => handleMultiSelectChange(e, 'subjects')}
                className="mr-2 accent-[#134E4A] w-4 h-4"
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

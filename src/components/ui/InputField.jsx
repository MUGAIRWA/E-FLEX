import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  options = [],
  ...props
}) => {
  const baseInputStyles = 'w-full px-4 py-3 border border-[#D8D1C4] bg-white text-[#16211E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134E4A] focus:border-[#134E4A] transition-all duration-200';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <label className="block text-sm font-semibold text-[#16211E] mb-2">
        {label} {required && <span className="text-[#C85A28]">*</span>}
      </label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          className={`${baseInputStyles} ${errorStyles}`}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${baseInputStyles} ${errorStyles}`}
          {...props}
        />
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default InputField;

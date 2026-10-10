export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          <span>
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </span>
        </label>
      )}

      <div className={Icon || rightElement ? 'input-with-icon' : ''}>
        {Icon && <Icon size={18} className="input-icon-left" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="vg-input"
          style={error ? { borderColor: 'var(--danger)' } : {}}
          {...props}
        />
        {rightElement && <div className="input-icon-right">{rightElement}</div>}
      </div>

      {error ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

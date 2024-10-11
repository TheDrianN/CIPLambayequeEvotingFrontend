const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-50 shadow-lg rounded-lg p-8 ${className}`}>
    {children}
  </div>
);

export default Card;
const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-lg p-8 ${className}`}>
    {children}
  </div>
);

export default Card;
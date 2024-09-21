import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const ActionButtons = ({ onEdit, onDelete, onView, showEdit, showDelete, showView }) => {
  return (
    <div className="flex space-x-3">
      {showEdit && (
        <button onClick={onEdit} className="text-yellow-500 hover:text-yellow-700">
          <FontAwesomeIcon icon={faEdit} />
        </button>
      )}
      {showDelete && (
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
      {showView && (
        <button onClick={onView} className="text-blue-500 hover:text-blue-700">
          <FontAwesomeIcon icon={faEye} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
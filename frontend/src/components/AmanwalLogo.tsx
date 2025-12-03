import React from 'react';
import './amanwal-logo.css';

interface AmanwalLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const AmanwalLogo: React.FC<AmanwalLogoProps> = ({ size = 'medium' }) => {
  const sizeMap = {
    small: 30,
    medium: 40,
    large: 60
  };

  const dimension = sizeMap[size];

  return (
    <div className="amanwal-logo-container" style={{ width: dimension, height: dimension }}>
      <svg
        viewBox="0 0 300 150"
        width={dimension * 2}
        height={dimension}
        className="amanwal-logo-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Texto "Amanwal" en estilo cursivo dorado con subida y bajada */}
        <g className="logo-text-group">
          {/* Letras en cursiva dorada */}
          <text
            x="150"
            y="85"
            fontSize="70"
            fontWeight="bold"
            fontFamily="cursive"
            fill="#FFC107"
            stroke="#FFD700"
            strokeWidth="0.5"
            textAnchor="middle"
            style={{
              fontStyle: 'italic',
              letterSpacing: '-2px',
              paintOrder: 'stroke fill'
            }}
          >
            Amanwal
          </text>
          
          {/* Línea decorativa debajo */}
          <path
            d="M 80 100 Q 150 105 220 100"
            stroke="#FFD700"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Punto decorativo */}
          <circle
            cx="240"
            cy="95"
            r="3"
            fill="#FFC107"
          />
        </g>
      </svg>
    </div>
  );
};

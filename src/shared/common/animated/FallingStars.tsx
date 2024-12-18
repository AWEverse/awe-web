import React, { useEffect, useState } from 'react';
import './FallingStars.scss';

// Function to generate random position for meteors
const generateRandomPosition = () => {
  return {
    top: Math.random() * 100 + 'vh', // Random top position within viewport height
    left: Math.random() * 100 + 'vw', // Random left position within viewport width
  };
};

const FallingStars: React.FC = () => {
  const [meteors, setFallingStars] = useState<any[]>([]);

  // Generate a random number of meteors on mount
  useEffect(() => {
    const numOfFallingStars = 20; // You can change this number to add more or fewer meteors
    const generatedFallingStars = Array.from({ length: numOfFallingStars }, () => generateRandomPosition());
    setFallingStars(generatedFallingStars);

    // Clean up meteors when component is unmounted
    return () => {
      setFallingStars([]);
    };
  }, []);

  return (
    <div className="meteors-container">
      {meteors.map((meteor, idx) => (
        <div
          key={idx}
          className="meteor"
          style={{
            top: meteor.top,
            left: meteor.left,
            animationDelay: Math.random() * (2 - 0.5) + 0.5 + 's', // Random delay
            animationDuration: Math.random() * (4 - 1) + 2 + 's', // Random duration
          }}
        ></div>
      ))}
    </div>
  );
};

export default FallingStars;

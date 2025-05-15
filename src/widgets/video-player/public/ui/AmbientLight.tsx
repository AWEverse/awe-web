import React from "react";

const AmbientLight: React.FC<{
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  disabled?: boolean;
}> = ({ canvasRef, disabled }) => (
  <canvas ref={canvasRef} className="CinematicLight" data-disabled={disabled} />
);

export default React.memo(AmbientLight);

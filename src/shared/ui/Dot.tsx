interface DotProps {
  size: number;
}

const Dot: React.FC<DotProps> = ({ size }) => {
  return (
    <svg
      className="inline color-gray-500"
      fill="currentColor"
      height={size}
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
};

export default Dot;

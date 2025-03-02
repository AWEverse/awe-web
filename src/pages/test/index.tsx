import React, { useEffect, useState } from "react";
import "./styles.scss";
import AnimatedList from "@/shared/ui/AnimatedList";
import { requestMeasure, requestMutation } from "@/lib/modules/fastdom";
import { fastRaf } from "@/lib/core";
import ExpandedFolders from "@/shared/ui/ExpandedFolders";
import { useClassNameBuilder } from "@/shared/lib/buildClassName";

const TestPage: React.FC = () => {
  // Use state for theme and dynamic conditions
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLarge, setIsLarge] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Get the buildClassName function from the hook
  const buildClassName = useClassNameBuilder();

  // Simulate some complex class name generation
  const buttonClassName = buildClassName(
    "btn", // Basic class name
    isPrimary && "btn-primary", // Conditional class
    { "btn-active": isActive }, // Conditional class from an object
    isLarge && "btn-large", // Conditional class from a boolean
    { "btn-dark": isDarkTheme }, // Conditional class from an object with dynamic theme
  );

  const buttonClassName2 = buildClassName(
    "btn", // Basic class name
    isPrimary && "btn-primary", // Conditional class
    { "btn-active": isActive }, // Conditional class from an object
    isLarge && "btn-large", // Conditional class from a boolean
    { "btn-dark": isDarkTheme }, // Conditional class from an object with dynamic theme
  );

  const wrapperClassName = buildClassName(
    "wrapper",
    { "wrapper-dark": isDarkTheme },
    isLarge && "wrapper-large",
  );

  // Some other components for dynamic updates
  const cardClassName = buildClassName(
    "card",
    { "card-primary": isPrimary },
    isLarge && "card-large",
    isActive && "card-active",
  );

  // Handle toggle of theme and conditions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPrimary((prev) => !prev);
      setIsActive((prev) => !prev);
      setIsLarge((prev) => !prev);
      setIsDarkTheme((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div className={wrapperClassName}>
      <h1 className={buttonClassName}>Dynamic Button</h1>
      <div className={cardClassName}>Card Component</div>
    </div>
  );
};

export default TestPage;

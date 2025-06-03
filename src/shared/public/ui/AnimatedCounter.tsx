import React, { useMemo, useEffect, memo } from "react";
import { motion, MotionValue, useSpring, useTransform } from "framer-motion";

interface NumberProps {
  value: MotionValue<number>;
  number: number;
  height: number;
}

const Number = memo(function Number({ value, number, height }: NumberProps) {
  // Compute Y offset based on the latest value.
  const y = useTransform(value, (latest) => {
    const placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let computedY = offset * height;
    if (offset > 5) {
      computedY -= 10 * height;
    }
    return computedY;
  });

  const baseStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    [],
  );

  return <motion.span style={{ ...baseStyle, y }}>{number}</motion.span>;
});

interface DigitProps {
  place: number;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}

const Digit = memo(function Digit({
  place,
  value,
  height,
  digitStyle,
}: DigitProps) {
  const valueRoundedToPlace = Math.floor(value / place);
  // Persist the spring across renders
  const animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle = useMemo<React.CSSProperties>(
    () => ({
      height,
      position: "relative",
      width: "1ch",
      fontVariantNumeric: "tabular-nums",
    }),
    [height],
  );

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} value={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
});

interface AnimatedCounterProps {
  value: number;
  fontSize?: number;
  padding?: number;
  places?: number[];
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties["fontWeight"];
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
}

export default function AnimatedCounter({
  value,
  fontSize = 14,
  padding = 0,
  places = [100, 10, 1],
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = "white",
  fontWeight = "bold",
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = "black",
  gradientTo = "transparent",
  topGradientStyle,
  bottomGradientStyle,
}: AnimatedCounterProps) {
  const height = fontSize + padding;

  const defaultContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "relative",
      display: "inline-block",
    }),
    [],
  );

  const defaultAnimatedCounterStyle = useMemo<React.CSSProperties>(
    () => ({
      fontSize,
      display: "flex",
      gap,
      overflow: "hidden",
      borderRadius,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      lineHeight: 1,
      color: textColor,
      fontWeight,
    }),
    [fontSize, gap, borderRadius, horizontalPadding, textColor, fontWeight],
  );

  const gradientContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
    [],
  );

  const defaultTopGradientStyle = useMemo<React.CSSProperties>(
    () => ({
      height: gradientHeight,
      background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
    }),
    [gradientHeight, gradientFrom, gradientTo],
  );

  const defaultBottomGradientStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      bottom: 0,
      width: "100%",
      height: gradientHeight,
      background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
    }),
    [gradientHeight, gradientFrom, gradientTo],
  );

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultAnimatedCounterStyle, ...counterStyle }}>
        {places.map((place) => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={height}
            digitStyle={digitStyle}
          />
        ))}
      </div>
      <div style={gradientContainerStyle}>
        <div style={topGradientStyle || defaultTopGradientStyle} />
        <div style={bottomGradientStyle || defaultBottomGradientStyle} />
      </div>
    </div>
  );
}

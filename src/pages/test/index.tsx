import React, { useState } from "react";
import useModalContext from "@/composers/modals/utils/hooks/useModalComposer";

import {
  Crypto,
  State,
  ratchetDecrypt,
  ratchetEncrypt,
  ratchetInitSender,
  ratchetInitReceiver,
} from "@/lib/core/public/cryptography/DoubleRatchet";
import sodium, { to_hex } from "libsodium-wrappers";
import TimePicker from "@/entities/date-picker/public/ui/additional/TimePicker";
import Image from "@/shared/ui/Image";
import {
  PublicKeyBundle,
  KeyBundle,
} from "@/lib/core/public/cryptography/interfaces";
import BundleManager from "@/lib/core/public/cryptography/public/X3DH/BundleManager";
import receiveInitialMessage from "@/lib/core/public/cryptography/public/X3DH/receiveInitialMessage";
import sendInitialMessage from "@/lib/core/public/cryptography/public/X3DH/sendInitialMessage";
import withTooltip from "@/shared/hocs/withTooltip";
import ActionButton from "@/shared/ui/ActionButton";
import RadialPatternCanvas, {
  RadialShapesCanvas,
} from "@/shared/ui/RadialPatternCanvas";

// Utility to convert Uint8Array to hex string
const toHex = (array: Uint8Array): string => {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Utility to compare two Uint8Arrays
const uint8ArrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

const Button = withTooltip(ActionButton, {
  content: "Click me!",
  position: "top",
  color: "#333",
  delay: 125,
  arrow: true,
});

const AdvancedEncryptionPage: React.FC = () => {
  const { openModal, closeModal } = useModalContext();

  return (
    <>
      <Button onClick={() => openModal("calendar", {}, 0)}>
        Open Calendar
      </Button>
      <TimePicker />
      <Image
        src="/img/primary-background.jpg"
        alt="Sunset over mountain range"
        title="Mountain Landscape"
        width={800}
        height={600}
        aspectRatio={4 / 3}
        loading="eager"
        fetchPriority="high"
        placeholderType="shimmer"
        placeholderColor="#ddd"
        borderRadius="8px"
        srcSet="/img/primary-background.jpg 480w, /img/primary-background.jpg 800w,/img/primary-background.jpg 1200w"
        sizes="(max-width: 768px) 100vw, 800px"
        onError={() => console.error("Image failed")}
        onRetry={(attempt) => console.log(`Attempt ${attempt}`)}
      />
      <RadialPatternCanvas
        drawPattern={(params) => {
          const { context, centerX, centerY, radius, width, height } = params;
          const steps = 200;
          for (let i = 0; i < steps; i++) {
            const angle = i * 0.05 * Math.PI;
            const r = (i / steps) * radius;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(
              centerX + r * Math.cos(angle),
              centerY + r * Math.sin(angle),
            );
            context.stroke();
          }
        }}
      />

      <div>
        <h1>SVG Path Rendering</h1>
        <RadialPatternCanvas
          width={100}
          height={100}
          svgPaths={[
            "M 484.435 311.216 l -9.444 -9.42 c -1.892 -1.888 -4.441 -2.93 -7.179 -2.934 c -6.338 -0.009 -12.563 -2.389 -17.549 -6.717 l -0.2 -0.171 c -2.044 -1.739 -4.355 -3.16 -6.829 -4.211 c 0.065 -0.121 0.124 -0.243 0.19 -0.363 c 4.121 -7.5 2.678 -17.049 -3.51 -23.221 l -69.634 -69.458 c -1.93 -1.924 -4.491 -2.983 -7.215 -2.983 c -0.005 0 -0.011 0 -0.016 0 c -1.332 0.002 -2.624 0.257 -3.822 0.742 L 345.207 178.5 c -0.765 -0.761 -1.803 -1.209 -2.88 -1.167 c -1.077 0.015 -2.104 0.464 -2.846 1.246 l -6.343 6.357 l -65.827 -65.656 l 73.49 -73.297 c 1.563 -1.56 1.567 -4.092 0.007 -5.657 l -18.11 -18.16 c -1.56 -1.564 -4.093 -1.567 -5.656 -0.008 l -7.422 7.402 l -9.542 -9.542 c -0.983 -0.983 -2.41 -1.383 -3.76 -1.062 c -1.353 0.324 -2.439 1.327 -2.871 2.649 L 281.8 57.309 l -38.311 38.21 l -38.315 -38.215 l -11.646 -35.697 c -0.431 -1.322 -1.519 -2.326 -2.871 -2.649 c -1.354 -0.322 -2.776 0.078 -3.76 1.062 l -9.54 9.54 l -7.424 -7.405 c -1.564 -1.56 -4.097 -1.557 -5.657 0.007 l -18.112 18.159 c -0.749 0.751 -1.169 1.769 -1.168 2.83 c 0.001 1.061 0.424 2.078 1.175 2.827 l 73.493 73.302 l -65.835 65.669 l -5.696 -5.696 l -0.639 -0.673 c -0.742 -0.782 -1.769 -1.231 -2.846 -1.246 c -1.09 -0.039 -2.116 0.405 -2.879 1.167 l -14.02 13.982 c -1.199 -0.485 -2.491 -0.74 -3.823 -0.742 c -0.005 0 -0.01 0 -0.016 0 c -2.724 0 -5.286 1.059 -7.215 2.983 L 47.062 264.18 c -6.188 6.172 -7.631 15.721 -3.51 23.221 c 0.066 0.12 0.126 0.243 0.19 0.364 c -2.475 1.052 -4.788 2.474 -6.839 4.219 l -0.208 0.179 c -4.967 4.312 -11.193 6.691 -17.53 6.7 c -2.737 0.004 -5.286 1.046 -7.178 2.933 l -9.445 9.42 c -1.636 1.631 -2.539 3.805 -2.542 6.12 c -0.003 2.195 0.814 4.288 2.3 5.893 c 1.572 1.698 3.741 2.659 6.106 2.707 c 2.429 0.03 4.81 -0.904 6.524 -2.614 l 1.412 -1.409 c 2.348 -2.341 5.87 -3.1 8.975 -1.93 l 0.371 0.139 c 1.851 0.696 3.386 2.158 4.324 4.115 c 1.368 2.857 3.213 5.418 5.485 7.636 l -5.079 5.066 c -3.754 3.746 -5.504 9.108 -4.681 14.344 c 2.956 18.79 13.689 66.907 49.418 107.79 c 5.111 5.844 12.311 9.054 19.764 9.054 c 2.143 0 4.307 -0.266 6.448 -0.811 c 12 -3.044 23.488 -10.039 34.146 -20.792 c 9.466 -9.565 10.045 -25.127 1.319 -35.43 c -6.411 -7.566 -14.316 -17.879 -22.862 -29.824 c -1.235 -1.726 -2.074 -3.743 -2.427 -5.833 c -0.189 -1.119 -0.239 -2.246 -0.158 -3.356 l 3.442 1.859 c 6.332 3.411 13.15 5.083 19.904 5.083 c 10.025 0 19.906 -3.685 27.835 -10.836 c 13.268 -11.967 17.439 -30.373 10.627 -46.889 l -4.631 -11.232 l 42.843 -42.843 c 1.321 -1.321 1.551 -3.381 0.555 -4.961 l -0.82 -1.301 c -0.158 -0.25 -13.973 -14.14 -13.973 -14.14 c -1.542 -1.672 -2.394 -3.823 -2.393 -6.11 c 0.002 -2.417 0.947 -4.69 2.662 -6.4 c 1.564 -1.56 1.567 -4.093 0.008 -5.657 l -0.932 -0.935 l 38.864 -38.764 c 0.751 -0.749 1.174 -1.766 1.175 -2.827 c 0.001 -1.061 -0.419 -2.079 -1.168 -2.83 l -7.898 -7.918 c -1.56 -1.564 -4.093 -1.567 -5.657 -0.007 l -25.83 25.763 l -5.371 -5.371 l 52.862 -52.721 l 52.86 52.722 l -5.373 5.373 l -25.833 -25.766 c -0.75 -0.748 -1.767 -1.168 -2.825 -1.168 c -0.002 0 -0.004 0 -0.005 0 c -1.062 0.001 -2.078 0.424 -2.827 1.175 l -7.897 7.918 c -1.561 1.564 -1.557 4.097 0.007 5.657 l 38.865 38.764 l -0.932 0.935 c -0.749 0.751 -1.17 1.769 -1.168 2.83 c 0.002 1.061 0.425 2.078 1.176 2.827 c 1.715 1.71 2.66 3.983 2.661 6.4 c 0.002 2.284 -0.849 4.433 -2.397 6.115 c 0 0 -13.81 13.883 -13.968 14.134 l -0.82 1.301 c -0.996 1.581 -0.766 3.641 0.556 4.962 l 42.842 42.842 l -4.631 11.232 c -6.812 16.517 -2.64 34.922 10.629 46.89 c 7.928 7.151 17.808 10.835 27.833 10.835 c 6.754 0 13.575 -1.673 19.908 -5.085 l 3.439 -1.857 c 0.081 1.11 0.031 2.237 -0.158 3.357 c -0.353 2.089 -1.192 4.106 -2.427 5.832 c -8.548 11.947 -16.453 22.26 -22.861 29.825 c -8.727 10.301 -8.147 25.864 1.32 35.432 c 10.656 10.75 22.145 17.745 34.142 20.789 c 2.143 0.545 4.308 0.811 6.451 0.811 c 7.454 0 14.654 -3.21 19.764 -9.055 c 35.727 -40.879 46.461 -88.998 49.418 -107.789 c 0.823 -5.236 -0.926 -10.598 -4.681 -14.344 l -5.079 -5.066 c 2.273 -2.22 4.117 -4.78 5.485 -7.636 c 0.938 -1.957 2.473 -3.418 4.321 -4.114 l 0.376 -0.141 c 3.105 -1.17 6.625 -0.41 8.972 1.931 l 1.412 1.409 c 1.714 1.709 4.092 2.644 6.524 2.614 c 2.366 -0.047 4.534 -1.008 6.104 -2.705 c 1.488 -1.605 2.306 -3.699 2.302 -5.892 C 486.974 315.022 486.071 312.848 484.435 311.216 Z M 395.512 303.644 c -6.749 6.767 -15.725 10.5 -25.275 10.513 c -2.604 -0.006 -5.16 -0.291 -7.642 -0.826 l 42.506 -42.616 C 407.608 282.21 404.421 294.712 395.512 303.644 Z M 354.224 310.394 c -3.39 -1.692 -6.527 -3.927 -9.292 -6.685 l -37.64 -37.542 l 3.565 -3.574 l 28.182 28.109 c 2.535 2.529 5.86 3.792 9.187 3.792 c 3.337 0 6.674 -1.272 9.211 -3.815 c 2.459 -2.465 3.808 -5.737 3.796 -9.196 c 0.003 -3.475 -1.354 -6.743 -3.819 -9.203 l -28.182 -28.109 l 8.391 -8.413 l 28.182 28.109 c 2.457 2.45 5.719 3.799 9.187 3.799 c 0.006 0 0.012 0 0.018 0 c 3.475 -0.004 6.74 -1.362 9.194 -3.823 c 2.458 -2.465 3.807 -5.736 3.796 -9.197 c 0.002 -3.475 -1.355 -6.742 -3.82 -9.201 l -28.182 -28.108 l 1.81 -1.815 l 37.64 37.542 c 2.796 2.789 5.023 5.932 6.702 9.283 L 354.224 310.394 Z M 323.581 249.836 l 28.181 28.108 c 0.949 0.946 1.471 2.201 1.47 3.549 c 0.005 1.332 -0.514 2.587 -1.46 3.536 c -0.945 0.948 -2.202 1.471 -3.54 1.472 c -0.002 0 -0.005 0 -0.007 0 c -1.335 0 -2.591 -0.519 -3.536 -1.463 l -28.183 -28.109 L 323.581 249.836 Z M 350.346 223 l 28.182 28.109 c 0.948 0.946 1.471 2.201 1.47 3.547 c 0.004 1.333 -0.515 2.589 -1.46 3.538 c -0.945 0.948 -2.203 1.471 -3.541 1.472 c -0.002 0 -0.004 0 -0.007 0 c -1.335 0 -2.591 -0.519 -3.536 -1.463 l -28.182 -28.109 L 350.346 223 Z M 301.628 260.518 l -7.095 -7.076 l 50.515 -50.643 l 7.093 7.074 L 301.628 260.518 Z M 315.023 203.092 l -7.351 -7.332 l 12.479 -12.479 l 7.334 7.315 L 315.023 203.092 Z M 299.031 30.286 l 4.925 4.925 l -9.682 9.657 L 299.031 30.286 Z M 319.858 30.648 l 12.462 12.496 l -70.673 70.487 l -12.494 -12.462 L 319.858 30.648 Z M 187.945 30.286 l 4.756 14.577 l -9.679 -9.654 L 187.945 30.286 Z M 159.491 190.603 l 7.34 -7.321 l 12.478 12.478 l -7.355 7.336 l -9.243 -9.266 l 0 0 l -0.405 -0.405 L 159.491 190.603 Z M 192.443 253.441 l -7.095 7.076 l -50.514 -50.645 l 7.093 -7.075 L 192.443 253.441 Z M 81.875 270.713 l 42.516 42.627 c -2.472 0.533 -5.016 0.816 -7.604 0.816 c -0.016 0 -0.032 0 -0.047 0 c -9.55 -0.012 -18.527 -3.746 -25.276 -10.513 C 82.555 294.711 79.368 282.209 81.875 270.713 Z M 132.756 310.399 l -47.927 -48.052 c 1.678 -3.351 3.905 -6.494 6.701 -9.282 l 37.64 -37.542 l 1.81 1.815 l -28.182 28.109 c -2.465 2.459 -3.822 5.727 -3.819 9.186 c -0.012 3.475 1.336 6.746 3.795 9.212 c 2.537 2.544 5.874 3.816 9.211 3.816 c 3.326 0 6.652 -1.264 9.187 -3.792 l 28.182 -28.109 l 8.391 8.413 l -28.182 28.109 c -2.465 2.458 -3.821 5.726 -3.82 9.187 c -0.011 3.475 1.337 6.746 3.796 9.211 c 2.537 2.544 5.874 3.816 9.211 3.816 c 3.326 0 6.652 -1.264 9.187 -3.792 l 28.182 -28.109 l 3.565 3.574 l -37.64 37.542 C 139.281 306.464 136.145 308.703 132.756 310.399 Z M 143.704 230.094 l -28.182 28.109 c -1.955 1.95 -5.134 1.947 -7.084 -0.009 c -0.946 -0.948 -1.464 -2.204 -1.46 -3.552 c -0.001 -1.333 0.521 -2.587 1.469 -3.533 L 136.629 223 L 143.704 230.094 Z M 170.47 256.929 l -28.182 28.109 c -1.955 1.95 -5.134 1.947 -7.084 -0.009 c -0.946 -0.948 -1.465 -2.205 -1.46 -3.551 c 0 -1.333 0.521 -2.588 1.469 -3.534 l 28.182 -28.108 L 170.47 256.929 Z M 28.504 312.633 l -0.371 -0.139 c -6.032 -2.271 -12.877 -0.796 -17.441 3.754 l -1.412 1.409 c -0.181 0.18 -0.451 0.27 -0.715 0.279 c -0.122 -0.002 -0.29 -0.029 -0.396 -0.143 C 8.057 317.671 8 317.521 8 317.346 c 0 -0.183 0.064 -0.339 0.191 -0.466 l 9.445 -9.42 c 0.385 -0.384 0.932 -0.596 1.541 -0.597 c 8.26 -0.012 16.344 -3.087 22.744 -8.643 l 0.179 -0.153 c 1.399 -1.19 2.936 -2.145 4.59 -2.865 c 2.833 10.497 0.73 21.908 -5.801 30.729 c -1.505 -1.516 -2.743 -3.235 -3.66 -5.15 C 35.394 316.954 32.297 314.061 28.504 312.633 Z M 165.799 324.349 c 6.682 16.203 -0.056 30.201 -8.59 37.899 c -8.536 7.699 -23.156 12.963 -38.584 4.652 l -4.361 -2.355 c 0.368 -0.479 0.762 -0.94 1.195 -1.372 l 16.286 -16.286 c 1.339 4.62 4.269 8.537 8.389 11.111 c 3.148 1.966 6.696 2.977 10.31 2.977 c 1.55 0 3.112 -0.186 4.659 -0.562 c 2.146 -0.522 3.464 -2.685 2.942 -4.832 c -0.522 -2.147 -2.688 -3.465 -4.832 -2.942 c -3.045 0.739 -6.184 0.233 -8.841 -1.426 c -2.658 -1.66 -4.49 -4.26 -5.16 -7.32 l -0.803 -3.669 l 24.029 -24.029 L 165.799 324.349 Z M 109.802 357.516 c -5.036 5.036 -7.333 12.235 -6.146 19.256 c 0.554 3.28 1.871 6.445 3.809 9.154 c 8.794 12.292 16.622 22.5 23.264 30.34 c 6.071 7.167 5.675 17.987 -0.899 24.629 c -9.619 9.705 -19.857 15.985 -30.432 18.667 c -6.653 1.692 -13.635 -0.513 -18.219 -5.756 c -34.355 -39.311 -44.69 -85.663 -47.538 -103.767 c -0.427 -2.714 0.48 -5.494 2.428 -7.437 l 7.022 -7.005 c 13.72 -13.683 16.793 -35.087 7.473 -52.051 c -2.416 -4.397 -1.533 -10.033 2.148 -13.704 l 69.633 -69.457 c 0.419 -0.417 0.975 -0.647 1.566 -0.647 c 0.001 0 0.002 0 0.003 0 c 0.592 0.001 1.149 0.232 1.567 0.652 c 0.749 0.752 1.767 1.175 2.828 1.176 c 0.002 0 0.003 0 0.005 0 c 1.06 0 2.076 -0.42 2.826 -1.169 l 4.204 -4.196 l 0.931 0.933 L 85.88 247.4 c -17.086 17.042 -17.122 44.807 -0.081 61.893 c 8.258 8.28 19.243 12.848 30.93 12.863 c 0.02 0 0.039 0 0.059 0 c 11.665 0 22.639 -4.539 30.905 -12.783 l 50.416 -50.285 l 5.055 5.065 L 109.802 357.516 Z M 141.009 190.553 l 3.561 -3.55 l 12.482 12.483 l 0.003 -0.003 l 7.061 7.081 l -0.003 0.003 l 25.174 25.237 c -0.962 1.561 -1.653 3.265 -2.065 5.052 L 141.009 190.553 Z M 189.84 218.582 l 6.154 -6.138 l 2.252 2.251 l -6.157 6.141 L 189.84 218.582 Z M 224.648 183.864 l 2.249 2.254 l -22.987 22.928 l -2.251 -2.251 L 224.648 183.864 Z M 190.337 206.788 l -7.371 7.352 l -5.365 -5.379 l 7.364 -7.344 L 190.337 206.788 Z M 184.973 190.11 l -12.478 -12.478 l 52.834 -52.702 l 12.499 12.466 L 184.973 190.11 Z M 154.653 43.139 l 12.463 -12.495 l 147.372 146.989 l -12.479 12.479 L 154.653 43.139 Z M 262.328 183.864 l 22.993 22.934 l -2.251 2.251 l -22.99 -22.931 L 262.328 183.864 Z M 290.985 212.448 l 6.15 6.134 l -2.248 2.254 l -6.153 -6.138 L 290.985 212.448 Z M 296.643 206.791 l 5.373 -5.373 l 7.361 7.341 l -5.366 5.38 L 296.643 206.791 Z M 297.688 231.804 l 25.174 -25.238 l -0.002 -0.003 l 7.061 -7.08 l 0.002 0.002 l 12.482 -12.482 l 3.562 3.55 l -46.213 46.304 C 299.341 235.07 298.65 233.365 297.688 231.804 Z M 368.353 366.898 c -15.431 8.314 -30.048 3.049 -38.586 -4.65 c -8.534 -7.698 -15.272 -21.696 -8.59 -37.899 l 3.362 -8.154 l 24.029 24.029 l -0.803 3.668 c -0.671 3.061 -2.503 5.661 -5.161 7.321 c -2.657 1.66 -5.799 2.167 -8.84 1.426 c -2.153 -0.521 -4.311 0.796 -4.832 2.942 c -0.521 2.146 0.795 4.31 2.941 4.832 c 1.548 0.376 3.109 0.562 4.659 0.562 c 3.613 0 7.162 -1.01 10.31 -2.977 c 4.121 -2.574 7.05 -6.491 8.389 -11.111 l 16.286 16.286 c 0.432 0.432 0.827 0.893 1.195 1.372 L 368.353 366.898 Z M 453.336 350.04 c -2.85 18.104 -13.185 64.458 -47.539 103.767 c -4.583 5.243 -11.563 7.447 -18.222 5.756 c -10.572 -2.682 -20.811 -8.963 -30.427 -18.665 c -6.576 -6.646 -6.972 -17.465 -0.901 -24.632 c 6.641 -7.838 14.468 -18.046 23.264 -30.34 c 1.938 -2.708 3.255 -5.873 3.81 -9.153 c 1.188 -7.022 -1.111 -14.221 -6.147 -19.257 l -93.36 -93.361 l 5.055 -5.065 l 50.416 50.284 c 8.267 8.245 19.239 12.783 30.905 12.783 c 0.019 0 0.039 0 0.058 0 c 11.688 -0.015 22.672 -4.583 30.93 -12.863 c 17.042 -17.086 17.006 -44.851 -0.08 -61.893 L 350.7 197.135 l 0.931 -0.933 l 4.205 4.196 c 0.75 0.748 1.766 1.168 2.825 1.168 c 0.002 0 0.004 0 0.005 0 c 1.062 -0.001 2.079 -0.424 2.828 -1.176 c 0.418 -0.419 0.975 -0.651 1.567 -0.652 c 0.001 0 0.002 0 0.003 0 c 0.592 0 1.148 0.23 1.566 0.647 l 69.633 69.457 c 3.682 3.671 4.564 9.307 2.148 13.704 c -9.32 16.964 -6.247 38.368 7.473 52.05 l 7.022 7.005 C 452.854 344.546 453.763 347.326 453.336 350.04 Z M 478.805 317.794 c -0.104 0.113 -0.272 0.14 -0.395 0.143 c -0.266 0.004 -0.534 -0.099 -0.715 -0.279 l -1.413 -1.409 c -4.563 -4.552 -11.411 -6.025 -17.437 -3.755 l -0.376 0.141 c -3.792 1.427 -6.889 4.321 -8.721 8.146 c -0.917 1.914 -2.155 3.632 -3.661 5.15 c -6.531 -8.821 -8.634 -20.232 -5.801 -30.73 c 1.653 0.72 3.187 1.672 4.579 2.857 l 0.171 0.146 c 6.419 5.572 14.503 8.647 22.763 8.659 c 0.608 0.001 1.155 0.213 1.54 0.597 l 9.445 9.421 c 0.126 0.125 0.19 0.281 0.19 0.467 C 478.976 317.522 478.919 317.671 478.805 317.794 Z",
          ]}
        />
        <RadialShapesCanvas
          width={1200}
          height={1200}
          shapeRadius={400}
          shapeSize={50}
          shapeCount={8}
          strokeWidth={1}
          strokeColor="#ffffff"
          applyRotation={false}
          svgPath="M 371.708 362.032 c -18.597 -10.054 -30.028 -8.812 -33.104 -3.119 c -0.005 0.009 -11.734 21.707 -11.734 21.707 l -28.296 -15.297 c -1.942 -1.051 -4.37 -0.326 -5.421 1.616 l -1.12 2.073 l -22.613 -12.226 v -40.722 h 27.26 c 23.881 0 43.31 -19.429 43.31 -43.31 c 0 -7.195 -1.803 -14.318 -5.212 -20.594 c -2.837 -5.242 -6.761 -9.875 -11.443 -13.537 c 3.453 -12.746 5.079 -25.913 4.835 -39.182 c -0.509 -27.975 -9.346 -54.866 -25.556 -77.766 c -15.165 -21.423 -35.778 -38.019 -59.758 -48.199 c 0.426 -3.016 0.098 -5.812 -1.013 -8.357 c 0 0 -15.639 -53.722 -15.649 -53.74 C 221.312 1.282 205.806 -2.19 181.31 1.342 c -22.783 3.286 -50.825 12.309 -78.963 25.407 C 74.211 39.848 49.254 55.498 32.072 70.815 c -18.595 16.579 -25.9 30.76 -21.127 41.012 c 0.587 1.26 30.958 46.361 30.958 46.361 c 2.026 4.096 5.933 7.01 11.565 8.731 c -2.954 11.421 -4.46 23.204 -4.46 35.093 c 0 12.392 1.636 24.692 4.865 36.607 c -10.479 8.176 -16.655 20.73 -16.655 34.133 c 0 11.561 4.503 22.438 12.682 30.628 c 8.179 8.178 19.052 12.682 30.618 12.682 h 27.26 v 47.9 c 0 19.817 16.123 35.94 35.94 35.94 h 89.76 c 13.157 0 25.01 -7.078 31.317 -18.337 l 15.825 8.554 l -0.001 0.002 c -0.505 0.933 -0.618 2.029 -0.314 3.045 c 0.303 1.017 0.997 1.871 1.931 2.375 l 52.131 28.183 c 5.055 2.733 10.589 4.121 16.178 4.121 c 3.274 0 6.568 -0.477 9.794 -1.438 c 8.732 -2.604 15.928 -8.453 20.261 -16.468 l 11.85 -21.917 c 1.432 -2.647 1.827 -7.213 -4.417 -13.93 C 384.13 369.897 378.333 365.614 371.708 362.032 Z M 18.197 108.451 c -2.997 -6.437 4.181 -18.274 19.199 -31.664 c 16.614 -14.813 40.88 -30.007 68.328 -42.785 s 54.697 -21.564 76.728 -24.742 c 5.838 -0.842 11.14 -1.254 15.793 -1.254 c 11.223 0 18.679 2.397 20.797 6.948 c 2.31 4.964 -1.433 13.139 -10.151 22.76 c -19.41 -16.065 -60.266 -14.838 -99.784 3.558 c -39.515 18.396 -66.758 48.87 -66.96 74.065 C 29.173 115.814 20.507 113.415 18.197 108.451 Z M 91.541 105.233 c -13.152 4.262 -25.621 7.305 -36.754 8.911 c -1.589 0.229 -3.134 0.423 -4.641 0.589 c 0.546 -18.961 20.222 -42.467 49.049 -59.261 c -1.535 2.778 -3.105 5.889 -4.548 9.256 C 88.069 80.068 87.031 93.951 91.541 105.233 Z M 112.717 49.019 c 8.307 0.629 39.628 4.305 49.794 24.133 c -9.643 5.681 -20.06 11.16 -30.997 16.25 c -10.937 5.091 -21.835 9.536 -32.391 13.258 C 90.524 82.153 107.859 55.787 112.717 49.019 Z M 126.417 42.805 c 31.387 -11.225 62.012 -11.141 76.863 0.64 c -1.097 1.046 -2.239 2.103 -3.437 3.171 c -8.394 7.483 -18.745 15.063 -30.468 22.381 C 160.564 52.392 140.578 45.585 126.417 42.805 Z M 49.672 155.596 c -5.565 -8.638 -22.5 -33.846 -22.054 -33.149 c 3.367 0.63 7.166 0.958 11.412 0.957 c 5.035 0 10.679 -0.446 16.898 -1.343 c 22.783 -3.286 50.825 -12.31 78.963 -25.408 c 28.136 -13.099 53.094 -28.748 70.275 -44.066 c 8.64 -7.703 14.839 -14.888 18.525 -21.402 c 0 0 10.652 36.772 10.756 36.993 c 2.675 5.747 -4.109 16.848 -17.707 28.971 c -15.364 13.698 -37.808 27.751 -63.198 39.571 c -25.39 11.82 -50.593 19.948 -70.966 22.886 C 65.741 162.035 53.007 160.773 49.672 155.596 Z M 80.518 308.064 c -9.43 0 -18.294 -3.672 -24.96 -10.336 c -6.668 -6.678 -10.34 -15.547 -10.34 -24.974 c 0 -10.841 4.955 -21 13.376 -27.669 c 0.686 -0.544 4.127 -2.547 5 -3.014 c 12.011 -6.432 19.583 -18.872 19.583 -32.742 v -35.191 c 0 -2.209 -1.791 -4 -4 -4 s -4 1.791 -4 4 v 35.191 c 0 10.412 -5.43 19.805 -14.148 25.024 c -2.667 -10.552 -4.021 -21.407 -4.021 -32.34 c 0 -11.381 1.468 -22.655 4.336 -33.573 c 2.091 0.214 4.32 0.329 6.704 0.329 c 4.674 0 9.905 -0.413 15.67 -1.244 c 21.125 -3.047 47.121 -11.411 73.2 -23.551 c 26.078 -12.141 49.214 -26.648 65.146 -40.852 c 8.963 -7.991 15.1 -15.392 18.322 -22.009 c 22.33 9.623 41.531 25.173 55.697 45.184 c 15.278 21.583 23.607 46.927 24.087 73.29 c 0.217 11.84 -1.149 23.591 -4.054 35.001 c -8.953 -5.168 -14.554 -14.687 -14.554 -25.259 v -37.596 c 0 -2.209 -1.791 -4 -4 -4 s -4 1.791 -4 4 v 37.596 c 0 14.523 8.288 27.497 21.293 33.631 c 0.65 0.307 3.321 1.791 3.912 2.266 c 3.659 2.938 6.735 6.604 8.978 10.747 c 2.776 5.112 4.244 10.915 4.244 16.781 c 0 19.47 -15.84 35.31 -35.31 35.31 h -32.28 c -7.951 0 -14.935 4.204 -18.857 10.504 c -2.472 -2.187 -5.617 -3.394 -8.963 -3.394 c -3.742 0 -7.136 1.52 -9.598 3.975 c -2.555 -2.56 -5.961 -3.971 -9.595 -3.971 c -3.737 0 -7.129 1.52 -9.591 3.974 c -2.556 -2.562 -5.964 -3.974 -9.599 -3.974 c -3.743 0 -7.136 1.519 -9.598 3.972 c -2.461 -2.454 -5.853 -3.973 -9.594 -3.973 c -3.742 0 -7.135 1.52 -9.596 3.974 c -2.461 -2.454 -5.853 -3.974 -9.595 -3.974 c -3.742 0 -7.135 1.52 -9.596 3.974 c -2.461 -2.454 -5.853 -3.974 -9.595 -3.974 c -3.435 0 -6.567 1.29 -8.962 3.398 c -3.921 -6.303 -10.908 -10.511 -18.862 -10.511 H 80.518 Z M 261.419 316.384 v 36.076 l -11.25 -6.083 l 0.03 -16.115 C 250.199 323.456 255.016 317.757 261.419 316.384 Z M 242.169 328.773 v 8.76 h -11.19 v -8.76 c 0 -3.088 2.513 -5.6 5.601 -5.6 c 1.498 0 2.897 0.579 3.951 1.639 C 241.587 325.869 242.169 327.275 242.169 328.773 Z M 222.975 328.777 v 8.756 h -11.19 v -8.758 c 0.006 -3.087 2.519 -5.598 5.601 -5.598 c 1.498 0 2.898 0.579 3.951 1.638 C 222.393 325.872 222.975 327.279 222.975 328.777 Z M 220.903 357.84 c -0.977 0.796 -2.208 1.277 -3.517 1.277 c -3.088 0 -5.601 -2.512 -5.601 -5.6 v -0.606 L 220.903 357.84 Z M 192.598 337.533 v -8.762 c 0 -0.01 -0.002 -0.021 -0.002 -0.031 c 0.015 -3.07 2.519 -5.563 5.598 -5.563 c 1.498 0 2.898 0.579 3.96 1.647 c 1.051 1.044 1.63 2.445 1.63 3.943 v 8.766 H 192.598 Z M 203.785 348.587 v 4.931 c 0 3.083 -2.508 5.59 -5.59 5.59 c -3.078 0 -5.582 -2.492 -5.598 -5.562 c 0 -0.01 0.001 -0.019 0.001 -0.029 v -7.984 h 5.538 L 203.785 348.587 Z M 184.595 345.533 v 7.984 c 0 0.01 0.001 0.019 0.001 0.029 c -0.016 3.072 -2.518 5.566 -5.593 5.566 c -3.086 0 -5.596 -2.51 -5.596 -5.595 v -7.984 H 184.595 Z M 173.408 337.533 v -8.762 c 0 -3.085 2.51 -5.595 5.596 -5.595 c 3.074 0 5.576 2.493 5.593 5.564 c 0 0.009 -0.001 0.018 -0.001 0.027 v 8.766 H 173.408 Z M 154.218 337.533 v -8.762 c 0 -3.085 2.51 -5.595 5.596 -5.595 c 3.085 0 5.595 2.51 5.595 5.595 v 8.762 H 154.218 Z M 165.408 345.533 v 7.984 c 0 3.085 -2.51 5.595 -5.595 5.595 c -3.086 0 -5.596 -2.51 -5.596 -5.595 v -7.984 H 165.408 Z M 135.027 337.533 v -8.762 c 0 -3.085 2.51 -5.595 5.596 -5.595 c 3.085 0 5.595 2.51 5.595 5.595 v 8.762 H 135.027 Z M 146.218 345.533 v 7.984 c 0 3.085 -2.51 5.595 -5.595 5.595 c -3.086 0 -5.596 -2.51 -5.596 -5.595 v -7.984 H 146.218 Z M 233.478 391.903 h -89.76 c -15.406 0 -27.94 -12.534 -27.94 -27.94 v -47.58 c 6.403 1.373 11.221 7.072 11.221 13.879 l 0.028 23.254 c 0 7.497 6.099 13.595 13.596 13.595 c 3.741 0 7.134 -1.52 9.595 -3.974 c 2.461 2.454 5.854 3.974 9.596 3.974 c 3.741 0 7.134 -1.52 9.595 -3.974 c 2.461 2.454 5.854 3.974 9.596 3.974 s 7.135 -1.52 9.596 -3.975 c 2.461 2.452 5.854 3.97 9.595 3.97 c 3.738 0 7.128 -1.518 9.588 -3.969 c 2.462 2.457 5.858 3.979 9.603 3.979 c 3.721 0 7.137 -1.482 9.618 -3.973 c 2.504 2.477 5.93 3.969 9.575 3.969 c 0.445 0 0.896 -0.027 1.347 -0.071 l 19.836 10.723 C 252.842 386.45 243.663 391.903 233.478 391.903 Z M 284.424 383.084 l -69.465 -37.551 h 16.827 l 56.441 30.516 L 284.424 383.084 Z M 373.561 406.136 c -3.317 6.136 -8.825 10.613 -15.51 12.606 c -6.685 1.993 -13.744 1.264 -19.881 -2.053 l -48.612 -26.28 l 8.729 -16.146 l 28.296 15.297 c 1.945 1.053 4.371 0.326 5.421 -1.616 l 9.254 -17.119 c 3.325 4.388 9.161 9.255 18.085 14.079 c 8.925 4.825 16.193 7.042 21.686 7.42 L 373.561 406.136 Z M 363.148 377.867 c -11.716 -6.333 -16.893 -12.95 -17.381 -15.081 c 2.05 -0.759 10.423 -0.049 22.136 6.283 c 11.716 6.334 16.894 12.95 17.381 15.081 C 383.238 384.907 374.864 384.2 363.148 377.867 Z"
        />
      </div>
    </>
  );
};

async function runX3DHExample() {
  try {
    // Generate keys for sender (Alice)
    const aliceIdentityKey = BundleManager.generateIdentityKey();
    const aliceSignedPrekey = BundleManager.generateSignedPrekey(
      aliceIdentityKey.ed25519.privateKey,
    );
    const aliceOneTimePrekeys = BundleManager.generateOneTimePrekeys(5);
    const aliceKeyBundle: KeyBundle = {
      identityKey: {
        publicKey: aliceIdentityKey.x25519.publicKey,
        privateKey: aliceIdentityKey.x25519.privateKey,
      },
      signedPrekey: {
        keyPair: aliceSignedPrekey.keyPair,
        signature: aliceSignedPrekey.signature,
      },
      oneTimePrekeys: aliceOneTimePrekeys.map((kp) => kp.publicKey),
    };

    // Generate keys for recipient (Bob)
    const bobIdentityKey = BundleManager.generateIdentityKey();
    const bobSignedPrekey = BundleManager.generateSignedPrekey(
      bobIdentityKey.ed25519.privateKey,
    );
    const bobOneTimePrekeys = BundleManager.generateOneTimePrekeys(5);
    const bobPublicBundle: PublicKeyBundle = BundleManager.createPublicBundle(
      bobIdentityKey.ed25519.publicKey, // Pass Ed25519 public key
      bobIdentityKey.x25519.publicKey,
      bobSignedPrekey.keyPair.publicKey,
      bobSignedPrekey.signature,
      bobOneTimePrekeys.map((kp) => kp.publicKey),
    );
    const bobKeyBundle: KeyBundle = {
      identityKey: {
        publicKey: bobIdentityKey.x25519.publicKey,
        privateKey: bobIdentityKey.x25519.privateKey,
      },
      signedPrekey: {
        keyPair: bobSignedPrekey.keyPair,
        signature: bobSignedPrekey.signature,
      },
      oneTimePrekeys: bobOneTimePrekeys.map((kp) => kp.privateKey),
    };

    // Alice sends an initial message to Bob
    const message = "Hello, Bob! This is a secure message.";
    const { initialMessage, sharedSecret: senderSharedSecret } =
      sendInitialMessage(aliceKeyBundle, bobPublicBundle, message, {
        info: "X3DHExample",
        oneTimePrekeyIndex: 0,
      });

    console.log("Initial message sent:", {
      identityKey: initialMessage.identityKey,
      ephemeralKey: initialMessage.ephemeralKey,
      usedPrekeys: initialMessage.usedPrekeys,
      ciphertext: initialMessage.ciphertext,
      nonce: initialMessage.nonce,
    });

    // Bob receives and decrypts the message
    const {
      decryptedMessage,
      sharedSecret: receiverSharedSecret,
      senderIdentityKey,
    } = receiveInitialMessage(bobKeyBundle, initialMessage, {
      info: "X3DHExample",
    });

    console.log("Decrypted message:", decryptedMessage);
    console.log("Sender identity key:", to_hex(senderIdentityKey));

    // Verify shared secrets match
    const secretsMatch = senderSharedSecret.every(
      (byte, i) => byte === receiverSharedSecret[i],
    );
    console.log("Shared secrets match:", secretsMatch);

    // Clean up sensitive data
    BundleManager.wipeKey(aliceIdentityKey.x25519.privateKey);
    BundleManager.wipeKey(aliceIdentityKey.ed25519.privateKey);
    BundleManager.wipeKey(aliceSignedPrekey.keyPair.privateKey);
    aliceOneTimePrekeys.forEach((kp) => BundleManager.wipeKey(kp.privateKey));

    BundleManager.wipeKey(bobIdentityKey.x25519.privateKey);
    BundleManager.wipeKey(bobIdentityKey.ed25519.privateKey);
    BundleManager.wipeKey(bobSignedPrekey.keyPair.privateKey);
    bobOneTimePrekeys.forEach((kp) => BundleManager.wipeKey(kp.privateKey));

    BundleManager.wipeKey(senderSharedSecret);
    BundleManager.wipeKey(receiverSharedSecret);
  } catch (error) {
    console.error("Error in X3DH example:", error);
  }
}

runX3DHExample();

export async function main() {
  // Initialization
  const stateSender: State = {} as State;
  const stateReceiver: State = {} as State;
  const SK = sodium.randombytes_buf(32); // Shared secret (e.g., from X3DH)
  const bobKeyPair = Crypto.generateDH();

  console.log("Sender initialization:");
  console.log("Sender secret key:", sodium.to_base64(SK));
  console.log("Receiver public key:", sodium.to_base64(bobKeyPair.publicKey));

  // Initialize ratchet states
  await ratchetInitSender(stateSender, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(stateReceiver, SK, bobKeyPair);

  const AD = new TextEncoder().encode("AssociatedData");

  // A1 → B
  const { header: h1, ciphertext: c1 } = ratchetEncrypt(
    stateSender,
    "Hello, Bob! How are you? 😉",
    AD,
  );
  const m1 = ratchetDecrypt(stateReceiver, h1, c1, AD);
  console.log("\n--- A1 → B ---");
  console.log(
    "Encrypted (h1, c1):",
    sodium.to_base64(h1),
    sodium.to_base64(c1),
  );
  console.log("Decrypted (B ← A1):", m1);

  // B1 → A
  const { header: h2, ciphertext: c2 } = ratchetEncrypt(
    stateReceiver,
    "Hi, Alice! I'm good, you? 😎",
    AD,
  );
  const m2 = ratchetDecrypt(stateSender, h2, c2, AD);
  console.log("\n--- B1 → A ---");
  console.log(
    "Encrypted (h2, c2):",
    sodium.to_base64(h2),
    sodium.to_base64(c2),
  );
  console.log("Decrypted (A ← B1):", m2);

  // A2 → B
  const { header: h3, ciphertext: c3 } = ratchetEncrypt(
    stateSender,
    "What's up? Anything interesting? 😊",
    AD,
  );
  const m3 = ratchetDecrypt(stateReceiver, h3, c3, AD);
  console.log("\n--- A2 → B ---");
  console.log(
    "Encrypted (h3, c3):",
    sodium.to_base64(h3),
    sodium.to_base64(c3),
  );
  console.log("Decrypted (B ← A2):", m3);

  // B2 → A
  const { header: h4, ciphertext: c4 } = ratchetEncrypt(
    stateReceiver,
    "All good here! Wanna chat more? 😁",
    AD,
  );
  const m4 = ratchetDecrypt(stateSender, h4, c4, AD);
  console.log("\n--- B2 → A ---");
  console.log(
    "Encrypted (h4, c4):",
    sodium.to_base64(h4),
    sodium.to_base64(c4),
  );
  console.log("Decrypted (A ← B2):", m4);

  // A3 → B
  const { header: h5, ciphertext: c5 } = ratchetEncrypt(
    stateSender,
    "Doing great! Still working on this Double Ratchet 😁💪",
    AD,
  );
  const m5 = ratchetDecrypt(stateReceiver, h5, c5, AD);
  console.log("\n--- A3 → B ---");
  console.log(
    "Encrypted (h5, c5):",
    sodium.to_base64(h5),
    sodium.to_base64(c5),
  );
  console.log("Decrypted (B ← A3):", m5);

  // Simulate delayed message
  // B3 → A, B4 → A, but B3 is delayed
  const { header: h6b4, ciphertext: c6b4 } = ratchetEncrypt(
    stateReceiver,
    "B4: Wow, that's impressive! 😲",
    AD,
  ); // Sent first
  const { header: h6b3, ciphertext: c6b3 } = ratchetEncrypt(
    stateReceiver,
    "B3: Great job! Well done! 👏",
    AD,
  ); // Delivered later

  // A ← B4 (before B3)
  const m6b4 = ratchetDecrypt(stateSender, h6b4, c6b4, AD);
  console.log("\n--- A ← B4 ---");
  console.log(
    "Encrypted (h6b4, c6b4):",
    sodium.to_base64(h6b4),
    sodium.to_base64(c6b4),
  );
  console.log("Decrypted (A ← B4):", m6b4);

  // A ← B3 (later, out-of-order)
  const m6b3 = ratchetDecrypt(stateSender, h6b3, c6b3, AD);
  console.log("\n--- A ← B3 (delayed) ---");
  console.log(
    "Encrypted (h6b3, c6b3):",
    sodium.to_base64(h6b3),
    sodium.to_base64(c6b3),
  );
  console.log("Decrypted (A ← B3):", m6b3);

  console.log(stateSender);
  console.log(stateReceiver);
}

export async function benchmark() {
  const iterations = 100;
  const message = "Test message for benchmarking";
  const AD = new TextEncoder().encode("BenchmarkData");

  // Generate fresh keys for each benchmark run
  const SK = sodium.randombytes_buf(32);
  const bobKeyPair = Crypto.generateDH();

  // Initialize states
  const aliceState: State = {} as State;
  const bobState: State = {} as State;

  // Set up initial states
  await ratchetInitSender(aliceState, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Benchmark encryption
  console.log(`\nEncryption Benchmark (${iterations} iterations):`);
  const encryptStart = performance.now();
  const headers: Uint8Array[] = [];
  const ciphertexts: Uint8Array[] = [];

  for (let i = 0; i < iterations; i++) {
    const { header, ciphertext } = ratchetEncrypt(aliceState, message, AD);
    headers.push(header);
    ciphertexts.push(ciphertext);
  }

  const encryptEnd = performance.now();
  const encryptTime = encryptEnd - encryptStart;
  console.log(`Total time: ${encryptTime.toFixed(2)}ms`);
  console.log(
    `Average per operation: ${(encryptTime / iterations).toFixed(2)}ms`,
  );
  console.log(
    `Operations per second: ${((1000 * iterations) / encryptTime).toFixed(2)}`,
  );

  // Reset receiver's state completely
  bobState.DHr = null;
  bobState.CKr = null;
  bobState.Nr = 0;
  bobState.MKSKIPPED.clear();
  await ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Benchmark decryption
  console.log(`\nDecryption Benchmark (${iterations} iterations):`);
  const decryptStart = performance.now();

  try {
    for (let i = 0; i < iterations; i++) {
      ratchetDecrypt(bobState, headers[i], ciphertexts[i], AD);
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }

  const decryptEnd = performance.now();
  const decryptTime = decryptEnd - decryptStart;
  console.log(`Total time: ${decryptTime.toFixed(2)}ms`);
  console.log(
    `Average per operation: ${(decryptTime / iterations).toFixed(2)}ms`,
  );
  console.log(
    `Operations per second: ${((1000 * iterations) / decryptTime).toFixed(2)}`,
  );

  // Benchmark DH ratchet steps
  console.log("\nDH Ratchet Step Benchmark (100 iterations):");
  const dhIterations = 100;

  const aliceStateDH: State = {} as State;
  const bobStateDH: State = {} as State;

  await ratchetInitSender(aliceStateDH, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(bobStateDH, SK, bobKeyPair);

  const dhStart = performance.now();
  for (let i = 0; i < dhIterations; i++) {
    // Sender sends to Receiver
    const { header: h1, ciphertext: c1 } = ratchetEncrypt(
      aliceStateDH,
      "A→B",
      AD,
    );
    ratchetDecrypt(bobStateDH, h1, c1, AD);

    // Receiver sends to Sender (triggers DH ratchet)
    const { header: h2, ciphertext: c2 } = ratchetEncrypt(
      bobStateDH,
      "B→A",
      AD,
    );
    ratchetDecrypt(aliceStateDH, h2, c2, AD);
  }

  const dhEnd = performance.now();
  const dhTime = dhEnd - dhStart;
  console.log(`Total time: ${dhTime.toFixed(2)}ms`);
  console.log(
    `Average per operation: ${(dhTime / (2 * dhIterations)).toFixed(2)}ms`,
  );
  console.log(
    `Operations per second: ${((1000 * 2 * dhIterations) / dhTime).toFixed(2)}`,
  );
}

main();
benchmark();
export default AdvancedEncryptionPage;

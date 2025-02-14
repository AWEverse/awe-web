import { AnimatePresence, motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";

import "./styles.scss";

const Slider = ({ items }: { items: any }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + items.length) % items.length,
		);
	};

	return (
		<div className="slider-container">
			<button onClick={prevSlide} className="prev-button">
				Previous
			</button>
			<div className="slider-track">
				<AnimatePresence>
					<motion.div
						key={currentIndex}
						className="slide"
						initial={{ x: 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -100, opacity: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="column">
							<div
								className="item"
								style={{ height: `${items[currentIndex].height}px` }}
							>
								{items[currentIndex].content}
							</div>
						</div>
						<div className="column">
							<div
								className="item"
								style={{
									height: `${items[(currentIndex + 1) % items.length].height}px`,
								}}
							>
								{items[(currentIndex + 1) % items.length].content}
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
			<button onClick={nextSlide} className="next-button">
				Next
			</button>
		</div>
	);
};

const TestPage: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const items = [
		{ content: "Item 1", height: 150 },
		{ content: "Item 2", height: 200 },
		{ content: "Item 3", height: 180 },
		{ content: "Item 4", height: 220 },
	];

	return (
		<div className="app">
			<Slider items={items} />
		</div>
	);
};

export default TestPage;

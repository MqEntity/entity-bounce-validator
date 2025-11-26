"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function CursorWrapper({ children }) {
	const dotRef = useRef(null);
	const [hovering, setHovering] = useState(false);
	const [clicking, setClicking] = useState(false);
	const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
	const [pos, setPos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		let mouseX = 0;
		let mouseY = 0;
		let outerX = 0;
		let outerY = 0;

		const interactiveElements = [
			"button",
			"a",
			"input",
			"textarea",
			"select",
			"label",
		];

		const animateCursor = () => {
			outerX += (mouseX - outerX) * 0.25;
			outerY += (mouseY - outerY) * 0.25;
			setPos({ x: outerX, y: outerY });

			if (dotRef.current) {
				dotRef.current.style.left = `${mouseX}px`;
				dotRef.current.style.top = `${mouseY}px`;
			}

			requestAnimationFrame(animateCursor);
		};

		const handleMouseMove = (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		const handleMouseDown = (e) => {
			setClicking(true);
			setClickPos({ x: e.clientX, y: e.clientY });
		};

		const handleMouseUp = () => setClicking(false);

		const handleMouseOver = (e) => {
			if (e.target.closest(interactiveElements.join(","))) setHovering(true);
		};

		const handleMouseOut = (e) => {
			if (
				!e.relatedTarget ||
				!e.relatedTarget.closest(interactiveElements.join(","))
			) {
				setHovering(false);
			}
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mouseover", handleMouseOver);
		document.addEventListener("mouseout", handleMouseOut);

		animateCursor();

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("mouseover", handleMouseOver);
			document.removeEventListener("mouseout", handleMouseOut);
		};
	}, []);

	return (
		<div className="relative">
			{children}

			<div
				ref={dotRef}
				className="fixed dot pointer-events-none z-50 mix-blend-difference"
				style={{
					width: "6px",
					height: "6px",
					borderRadius: "50%",
					backgroundColor: "gold",
					transform: "translate(-50%, -50%)",
				}}
			/>

			<motion.div
				className="fixed outer pointer-events-none z-50 mix-blend-difference border-2 border-white"
				style={{
					x: pos.x,
					y: pos.y,
					translateX: "-50%",
					translateY: "-50%",
				}}
				animate={{
					scale: clicking ? 1.4 : hovering ? 2 : 1.5,
					background: clicking
						? "rgba(59, 130, 246, 0.3)"
						: hovering
						? "#333"
						: "transparent",
					borderColor: hovering || clicking ? "#3b82f6" : "#ffffff",
					opacity: clicking ? 0.7 : 0.9,
				}}
				transition={{ type: "spring", stiffness: 500, damping: 28 }}
			/>
		</div>
	);
}

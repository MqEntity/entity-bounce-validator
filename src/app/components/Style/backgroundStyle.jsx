"use client";

import { useRef, useEffect } from "react";

export default function BackgroundStyle({ children }) {
	const canvasRef = useRef(null);
	const nodes = [];
	const NODE_COUNT = 100;

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		window.addEventListener("resize", resize);
		resize();

		for (let i = 0; i < NODE_COUNT; i++) {
			nodes.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.4,
				vy: (Math.random() - 0.5) * 0.4,
				size: Math.random() * 2 + 1,
			});
		}

		let mouse = { x: 0, y: 0 };

		const mouseMove = (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};
		window.addEventListener("mousemove", mouseMove);

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			nodes.forEach((n) => {
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
				ctx.fillStyle = "#00FFFF";
				ctx.fill();

				n.x += n.vx;
				n.y += n.vy;

				if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
				if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
			});

			for (let i = 0; i < NODE_COUNT; i++) {
				for (let j = i + 1; j < NODE_COUNT; j++) {
					const n1 = nodes[i];
					const n2 = nodes[j];

					const dx = n1.x - n2.x;
					const dy = n1.y - n2.y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 150) {
						ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / 150})`;
						ctx.lineWidth = 0.6;
						ctx.beginPath();
						ctx.moveTo(n1.x, n1.y);
						ctx.lineTo(n2.x, n2.y);
						ctx.stroke();
					}
				}

				const dx = nodes[i].x - mouse.x;
				const dy = nodes[i].y - mouse.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < 200) {
					ctx.strokeStyle = `rgba(0, 255, 100, ${1 - dist / 200})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(nodes[i].x, nodes[i].y);
					ctx.lineTo(mouse.x, mouse.y);
					ctx.stroke();
				}
			}

			requestAnimationFrame(draw);
		}
		draw();

		return () => {
			window.removeEventListener("mousemove", mouseMove);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<div className="relative pointer-events-none">
			<canvas ref={canvasRef} className="absolute inset-0" />
			<div className="relative z-50 pointer-events-auto">{children}</div>
		</div>
	);
}

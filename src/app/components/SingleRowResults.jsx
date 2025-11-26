"use client";

import {
	CheckCircleIcon,
	XCircleIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { motion } from "motion/react";

export default function SingleRowResults({
	email,
	status,
	loading,
	delay = 0,
}) {
	let Icon;
	let color;

	if (loading) {
		Icon = ArrowPathIcon;
		color = "text-yellow-500";
	} else if (status === "valid") {
		Icon = CheckCircleIcon;
		color = "text-green-500";
	} else if (status === "invalid") {
		Icon = XCircleIcon;
		color = "text-red-500";
	} else if (status === "unknown") {
		Icon = XCircleIcon;
		color = "text-purple-500";
	} else if (status === "invalid email") {
		Icon = XCircleIcon;
		color = "text-red-500";
	} else if (status === "email syntax error") {
		Icon = XCircleIcon;
		color = "text-red-500";
	} else if (status === "mx record not found") {
		Icon = XCircleIcon;
		color = "text-stone-500";
	} else if (status === "disposable email") {
		Icon = XCircleIcon;
		color = "text-cyan-500";
	} else {
		Icon = XCircleIcon;
		color = "text-gray-500";
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.4, delay }}
			className="flex items-center space-x-2"
		>
			<Icon className={`h-5 w-5 ${color} ${loading ? "animate-spin" : ""}`} />
			<code className={`${color}`}>{email}</code>
			<code className="text-gray-500">→</code>
			<code
				className={
					status === "valid"
						? "text-green-400"
						: status === "invalid"
						? "text-red-500"
						: status === "unknown"
						? "text-purple-500"
						: status === "invalid email"
						? "text-red-500"
						: status === "email syntax error"
						? "text-red-500"
						: status === "mx record not found"
						? "text-stone-500"
						: status === "disposable email"
						? "text-cyan-500"
						: "text-white"
				}
			>
				{status.toUpperCase()}
			</code>
		</motion.div>
	);
}

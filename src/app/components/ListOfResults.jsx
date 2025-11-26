"use client";

import SingleRowResults from "./SingleRowResults";
import { motion } from "motion/react";

export default function ListOfResults({
	results,
	BudakError,
	emailInputError,
	maxEmail,
}) {
	const hasErrors = emailInputError || BudakError || maxEmail;

	return (
		<motion.div
			className="p-4 bg-[#0a0a0a] border hover:border-blue-500 focus:border-green-500 rounded-lg h-100 scroll"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{results.length === 0 ? (
				<div className="flex flex-col space-y-1">
					{emailInputError && (
						<code className="text-red-500">[X] {emailInputError}</code>
					)}
					{BudakError && <code className="text-red-500">[X] {BudakError}</code>}
					{maxEmail && <code className="text-red-500">[X] {maxEmail}</code>}
					{!hasErrors && (
						<code className="text-stone-500">
							All information will be displayed here.
						</code>
					)}
				</div>
			) : (
				results.map((r, idx) => (
					<motion.div
						key={idx}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
						className="mb-1"
					>
						<SingleRowResults key={idx} {...r} delay={idx * 0.1} />
					</motion.div>
				))
			)}
		</motion.div>
	);
}

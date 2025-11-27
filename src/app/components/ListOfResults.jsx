"use client";

import SingleRowResults from "./SingleRowResults";
import { motion } from "motion/react";

export default function ListOfResults({
	results,
	BudakError,
	emailInputError,
	maxEmailError,
	quotaError,
}) {
	return (
		<motion.div
			className="p-4 bg-[#0a0a0a] border hover:border-blue-500 focus:border-green-500 rounded-lg h-100 scroll"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex flex-col space-y-1 mb-2">
				{emailInputError && (
					<div>
						<code>[</code>
						<code className="text-red-700">ERROR</code>
						<code>]</code>{" "}
						<code className="text-red-700">{emailInputError}</code>
					</div>
				)}
				{BudakError && (
					<div>
						<code>[</code>
						<code className="text-red-700">ERROR</code>
						<code>]</code> <code className="text-red-700">{BudakError}</code>
					</div>
				)}
				{maxEmailError && (
					<div>
						<code>[</code>
						<code className="text-red-700">ERROR</code>
						<code>]</code> <code className="text-red-700">{maxEmailError}</code>
					</div>
				)}
				{quotaError && (
					<div>
						<code>[</code>
						<code className="text-red-700">ERROR</code>
						<code>]</code> <code className="text-red-700">{quotaError}</code>
					</div>
				)}
			</div>

			{results.length === 0 &&
				!(emailInputError || BudakError || maxEmailError || quotaError) && (
					<code className="text-stone-500">
						All information will be displayed here.
					</code>
				)}

			{results.map((r, idx) => (
				<motion.div
					key={idx}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
					className="mb-1"
				>
					<SingleRowResults key={idx} {...r} delay={idx * 0.1} />
				</motion.div>
			))}
		</motion.div>
	);
}

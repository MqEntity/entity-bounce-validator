"use client";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { motion } from "motion/react";

export default function EmailForm({
	onSubmit,
	loading,
	BudakError,
	setBudakError,
	emailsInput,
	setEmailsInput,
	emailInputError,
	setEmailInputError,
	results,
	handleDownload,
}) {
	const [workerCount, setWorkerCount] = useState(5);

	const handleWorkerChange = (e) => {
		const input = e.target.value;
		const sanitized = input.replace(/\D/g, "");
		const value = sanitized ? Number(sanitized) : "";
		setWorkerCount(value);
		if (value > 10) setBudakError("FREE USER MAKSIMAL 10 BUDAK/PEKERJA");
		else setBudakError("");
	};

	const handleEmailsChange = (e) => {
		setEmailsInput(e.target.value);
		if (emailInputError) setEmailInputError("");
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!emailsInput.trim()) {
			setEmailInputError("EMAIL TIDAK BOLEH KOSONG");
			return;
		}
		if (workerCount > 10) {
			setBudakError("FREE USER MAKSIMAL 10 BUDAK/PEKERJA");
			return;
		}
		onSubmit(e);
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className="space-y-4"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.4 }}
				className="flex flex-col"
			>
				<textarea
					name="emails"
					placeholder="Email list - Comma or New Line separated"
					rows={5}
					value={emailsInput}
					onChange={handleEmailsChange}
					className={`scroll transition duration-200 w-full p-3 ring-1 rounded-lg bg-[#0a0a0a] focus:outline-none focus:ring-green-500 hover:ring-blue-500 placeholder:text-stone-600 ${
						emailInputError ? "ring-red-500" : "ring-white"
					}`}
				/>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.4 }}
				className="flex gap-5 items-center"
			>
				<div>
					<label className="text-gray-300">Worker/Thread :</label>
					<input
						type="text"
						name="workers"
						value={workerCount}
						onChange={handleWorkerChange}
						className={`transition duration-200 text-center ml-2 p-2 w-20 bg-[#0a0a0a] ring-1 ${
							BudakError ? "ring-red-500" : "ring-white"
						} rounded text-white focus:outline-none focus:ring-green-500 hover:ring-blue-500`}
					/>
				</div>
			</motion.div>

			<motion.button
				type="submit"
				disabled={loading}
				initial={{ opacity: 0, y: 0 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.4 }}
				className={`w-full p-3 text-white rounded-lg ${
					loading
						? "bg-[#0a0a0a] ring-1 cursor-not-allowed ring-stone-600"
						: "bg-[#0a0a0a] ring-1 hover:ring-blue-500 transition duration-200"
				} focus:outline-none focus:ring-green-500`}
			>
				<code className="flex items-center justify-center">
					{loading ? (
						<ArrowPathIcon className="animate-spin w-5 text-stone-800" />
					) : (
						"Start Checking"
					)}
				</code>
			</motion.button>
			{!loading && results.length > 0 && (
				<motion.button
					type="button"
					onClick={handleDownload}
					className="mt-4 w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition duration-200"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					Download Results
				</motion.button>
			)}
		</motion.form>
	);
}

"use client";

import {
	ArrowPathIcon,
	CheckCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/solid";
import { useState, useRef } from "react";
import { motion } from "motion/react";

export default function EmailForm({
	onSubmit,
	loading,
	BudakError,
	setBudakError,
	setQuotaError,
	emailsInput,
	setEmailsInput,
	emailInputError,
	setEmailInputError,
	maxEmailError,
	setMaxEmailError,
	results,
	handleDownload,
	user,
}) {
	const [workerCount, setWorkerCount] = useState(user?.maxWorkers || 5);
	const [showModal, setShowModal] = useState(false);
	const [confirmed, setConfirmed] = useState(false);
	const formRef = useRef(null);

	const emailCount = emailsInput
		.split(/[\n,]/)
		.map((e) => e.trim())
		.filter(Boolean).length;

	const remainingQuota = user ? user.dailyEmailLimit - user.dailyUsage : 0;
	const isQuotaDepleted = remainingQuota <= 0;

	const handleWorkerChange = (e) => {
		const input = e.target.value;
		const sanitized = input.replace(/\D/g, "");
		const value = sanitized ? Number(sanitized) : "";
		setWorkerCount(value);

		if (user && value > user.maxWorkers) {
			setBudakError(`Max workers allowed : ${user.maxWorkers}`);
		} else {
			setBudakError("");
		}
	};

	const handleEmailsChange = (e) => {
		setEmailsInput(e.target.value);
		setEmailInputError("");
		setMaxEmailError("");
		setQuotaError("");
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!confirmed) {
			if (!emailsInput.trim()) {
				setEmailInputError("List of emails is required.");
				return;
			}

			if (isQuotaDepleted) {
				setQuotaError("Daily limit reached.");
				return;
			}

			if (user && workerCount > user.maxWorkers) {
				setBudakError(`Max workers allowed : ${user.maxWorkers}`);
				return;
			}

			if (user && emailCount > user.dailyEmailLimit) {
				setMaxEmailError(`Max emails allowed : ${user.dailyEmailLimit}`);
				return;
			}

			setShowModal(true);
			return;
		}

		onSubmit(e);

		setConfirmed(false);
	};

	return (
		<>
			{showModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 pointer-events-auto">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="bg-[#0a0a0a] border border-white rounded-lg p-6 w-96 text-white pointer-events-auto"
					>
						<h2 className="text-xl font-semibold mb-4">Confirm Check</h2>

						<p className="mb-2">
							Emails to check : <b>{emailCount}</b>
						</p>
						<p className="mb-4">
							Workers/Threads : <b>{workerCount}</b>
						</p>

						<div className="flex justify-end gap-2 mt-5">
							<button
								onClick={() => setShowModal(false)}
								className="hover:text-red-500 cursor-none transition duration-200"
							>
								<XCircleIcon className="w-8" />
							</button>

							<button
								onClick={() => {
									setShowModal(false);
									setConfirmed(true);

									setTimeout(() => {
										formRef.current?.requestSubmit();
									}, 0);
								}}
								className="hover:text-green-500 cursor-none transition duration-200"
							>
								<CheckCircleIcon className="w-8" />
							</button>
						</div>
					</motion.div>
				</div>
			)}

			<div className={showModal ? "pointer-events-none" : ""}>
				<motion.form
					ref={formRef}
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
							className={`cursor-none scroll transition duration-200 w-full p-3 border rounded-lg bg-[#0a0a0a] focus:outline-none focus:border-green-500 hover:border-blue-500 placeholder:text-stone-600 ${
								emailInputError || maxEmailError
									? "border-red-500"
									: "border-white"
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
								className={`cursor-none transition duration-200 text-center ml-2 p-2 w-20 bg-[#0a0a0a] border ${
									BudakError ? "border-red-500" : "border-white"
								} rounded text-white focus:outline-none focus:border-green-500 hover:border-blue-500`}
							/>
						</div>
					</motion.div>

					<motion.button
						type="submit"
						disabled={loading}
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className={`cursor-none w-full p-3 text-white rounded-lg ${
							loading
								? "bg-[#0a0a0a] border cursor-not-allowed border-stone-600"
								: "bg-[#0a0a0a] border hover:border-blue-500 transition duration-200"
						} focus:outline-none focus:border-green-500`}
					>
						<code className="flex items-center justify-center hover:border-blue-500">
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
							className="cursor-none w-full p-3 hover:border-blue-500 focus:border-green-500 border rounded-lg text-white transition duration-200"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							Download Results
						</motion.button>
					)}
				</motion.form>
			</div>
		</>
	);
}

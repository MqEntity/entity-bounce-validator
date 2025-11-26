"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import EntitySlave from "@/app/lib/EntitySlave";
import EmailForm from "./EmailForm";
import ListOfResults from "./ListOfResults";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function EntityMain() {
	const { results, loading, error, startProcessing } = EntitySlave();
	const [BudakError, setBudakError] = useState("");
	const [emailsInput, setEmailsInput] = useState("");
	const [emailInputError, setEmailInputError] = useState("");
	const [maxEmail, setMaxEMail] = useState("");
	const formRef = useRef();

	const parseEmails = (input) =>
		input
			.split(/[\n,]+/)
			.map((e) => e.trim())
			.filter(Boolean);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const form = new FormData(e.target);
		const raw = form.get("emails");
		const emails = parseEmails(raw);
		const workerCount = Number(form.get("workers")) || 5;

		if (emails.length === 0) return;
		if (emails.length > 20) {
			setMaxEMail("FREE USER MAKSIMAL 20 EMAIL");
			return;
		}

		await startProcessing(emails, workerCount);
	};

	const handleDownload = async () => {
		const zip = new JSZip();
		const grouped = results.reduce((acc, r) => {
			let key = r.status.toUpperCase();
			if (key === "DOMAIN") key = "NOMX";
			if (!acc[key]) acc[key] = [];
			acc[key].push(r.email);
			return acc;
		}, {});

		for (const [status, emails] of Object.entries(grouped)) {
			const content = emails.join("\n");
			zip.file(`${status}.txt`, content);
		}

		const blob = await zip.generateAsync({ type: "blob" });
		saveAs(blob, "email-results.zip");
	};

	return (
		<motion.div
			className="max-w-6xl mx-auto p-8 bg-[#0a0a0ac3] text-white shadow-lg font-mono"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<motion.h1
				className="text-4xl font-bold text-center text-blue-600 mb-8 tracking-wide animate-pulse"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.5 }}
			>
				Entity Email Bounce Checker
			</motion.h1>

			<div className="flex flex-col lg:flex-row gap-2">
				<motion.div
					key="form"
					className="lg:w-2/3 bg-[#0a0a0a] p-6 rounded-xl shadow-md"
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -30 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<EmailForm
						onSubmit={handleSubmit}
						loading={loading}
						BudakError={BudakError}
						setBudakError={setBudakError}
						emailsInput={emailsInput}
						setEmailsInput={setEmailsInput}
						emailInputError={emailInputError}
						setEmailInputError={setEmailInputError}
						results={results}
						handleDownload={handleDownload}
					/>
				</motion.div>

				<motion.div
					key="results"
					className="lg:w-2/3 bg-[#0a0a0a] p-6 rounded-xl shadow-md"
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 30 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<AnimatePresence>
						{error && (
							<motion.p
								key="error"
								className="text-red-500 text-center mb-4"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								{error}
							</motion.p>
						)}

						<ListOfResults
							results={results}
							BudakError={BudakError}
							emailInputError={emailInputError}
							maxEmail={maxEmail}
						/>
					</AnimatePresence>
				</motion.div>
			</div>
		</motion.div>
	);
}

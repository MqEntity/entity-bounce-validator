"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import EntitySlave from "@/app/lib/EntitySlave";
import EmailForm from "./EmailForm";
import ListOfResults from "./ListOfResults";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import BackgroundStyle from "./Style/backgroundStyle";

export default function EntityMain() {
	const [BudakError, setBudakError] = useState("");
	const [emailsInput, setEmailsInput] = useState("");
	const [emailInputError, setEmailInputError] = useState("");
	const [maxEmailError, setMaxEmailError] = useState("");
	const [isPlaying, setIsPlaying] = useState(true);
	const [apiKey, setApiKey] = useState("");
	const [user, setUser] = useState(null);
	const [apiError, setApiError] = useState("");
	const [showApiKeyModal, setShowApiKeyModal] = useState(true);
	const [quotaError, setQuotaError] = useState("");

	const audioRef = useRef(null);

	const { results, loading, error, startProcessing } = EntitySlave({
		user,
		setUser,
		setQuotaError,
	});

	useEffect(() => {
		audioRef.current = new Audio("/pvz.mp3");
		audioRef.current.loop = true;
		audioRef.current
			.play()
			.catch((err) => console.warn("Autoplay blocked:", err));
	}, []);

	const validateApiKey = async () => {
		if (!apiKey.trim()) {
			setApiError("API key is required");
			return false;
		}

		try {
			const res = await fetch("/api/get-users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ apiKey }),
			});
			const data = await res.json();

			if (!res.ok) {
				setUser(null);
				setApiError(data.error || "Invalid API key");
				return false;
			}

			setUser({
				...data,
				apiKey: data.apiKey,
				dailyEmailLimit: data.dailyEmailLimit,
				dailyUsage: data.dailyUsage,
				remainingQuota: data.remainingQuota,
			});
			setApiError("");
			setShowApiKeyModal(false);
			return true;
		} catch (err) {
			setUser(null);
			setApiError("Failed to validate API key");
			return false;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) return;

		const form = new FormData(e.target);
		const raw = form.get("emails") || "";
		const emails = raw
			.toString()
			.split(/[\n,]+/)
			.map((e) => e.trim())
			.filter(Boolean);

		const workerCount = Number(form.get("workers")) || 5;

		if (emails.length === 0) return;

		const remainingQuota = user.dailyEmailLimit - user.dailyUsage;
		if (emails.length > remainingQuota) {
			setQuotaError("Your list exceeds your remaining quota.");
			return;
		}

		const stoppedEarly = await startProcessing(emails, workerCount);

		if (stoppedEarly) {
			setQuotaError("Daily limit reached");
		}
	};

	const handleDownload = async () => {
		const zip = new JSZip();
		const grouped = results.reduce((acc, r) => {
			const bucket =
				r.status.toUpperCase() === "DOMAIN" ? "NOMX" : r.status.toUpperCase();
			acc[bucket] ||= [];
			acc[bucket].push(r.email);
			return acc;
		}, {});
		Object.entries(grouped).forEach(([status, emails]) =>
			zip.file(`${status}.txt`, emails.join("\n"))
		);
		saveAs(await zip.generateAsync({ type: "blob" }), "email-results.zip");
	};

	const toggleMusic = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	return (
		<>
			<AnimatePresence>
				{showApiKeyModal && (
					<BackgroundStyle>
						<div className="cursor-none fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto">
							<motion.div
								initial={{ scale: 0.5, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.5, opacity: 0 }}
								className="bg-[#0a0a0a] border border-white rounded-lg p-6 w-96 text-white pointer-events-auto"
							>
								<code className="text-lg mb-5 cursor-none">
									Enter your API Key
								</code>
								<input
									type="password"
									placeholder="******-****-****-****"
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									className={`cursor-none w-full p-2 rounded border ${
										apiError ? "border-red-500" : "border-white"
									} bg-[#0a0a0a] text-white my-3 focus:outline-none focus:border-green-500 hover:border-blue-500 transition duration-200`}
								/>

								<div className="mb-3">
									{apiError && <code className="text-red-500">{apiError}</code>}
								</div>

								<button
									onClick={validateApiKey}
									className="cursor-none w-full p-2 border rounded hover:border-blue-500 focus:border-green-500 transition duration-200"
								>
									<code>Validate</code>
								</button>
							</motion.div>
						</div>
					</BackgroundStyle>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{!showApiKeyModal && (
					<motion.div
						className="max-w-6xl mx-auto p-8 bg-[#ffffff28] text-white shadow-lg font-mono relative -mt-7"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<button
							type="button"
							onClick={toggleMusic}
							className="cursor-none absolute top-10 right-4 text-2xl text-blue-500 hover:text-blue-400"
						>
							{isPlaying ? <HiOutlineSpeakerWave /> : <HiOutlineSpeakerXMark />}
						</button>

						<motion.h1
							className="cursor-none text-4xl font-bold text-center text-blue-600 mb-5 tracking-wide animate-pulse"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							Entity Email Bounce Checker
						</motion.h1>

						{user && (
							<div className="mb-2 text-center">
								<code className="text-blue-500 animate-pulse">{user.name}</code>{" "}
								- <code className="text-cyan-500">Daily Credits </code> :{" "}
								<code className="text-green-500">{user.dailyEmailLimit}</code> -{" "}
								<code className="text-cyan-500">Used Credits</code> :{" "}
								<code
									className={
										user.dailyUsage >= user.dailyEmailLimit
											? "text-red-500"
											: user.dailyUsage >= user.dailyEmailLimit * 0.7
											? "text-yellow-500"
											: "text-green-500"
									}
								>
									{user.dailyUsage}
								</code>
							</div>
						)}

						{user && (
							<div className="flex flex-col lg:flex-row gap-2 mt-4">
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
										maxEmailError={maxEmailError}
										setMaxEmailError={setMaxEmailError}
										setBudakError={setBudakError}
										setQuotaError={setQuotaError}
										quotaError={quotaError}
										emailsInput={emailsInput}
										setEmailsInput={setEmailsInput}
										emailInputError={emailInputError}
										setEmailInputError={setEmailInputError}
										results={results}
										handleDownload={handleDownload}
										user={user}
										setUser={setUser}
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
											maxEmailError={maxEmailError}
											quotaError={quotaError}
										/>
									</AnimatePresence>
								</motion.div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BlurDrop } from "@/components/ui/BlurDrop";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch, notifyStatsUpdated } from "@/lib/apiClient";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { InterviewReport } from "@/components/interview/InterviewReport";
import {
  PHASE_STEPS,
  PROVENANCE_LABELS,
  STRATEGY_LABELS,
} from "@/components/interview/interviewConfig";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  Square,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Loader2,
  Briefcase,
  Layers,
  Send,
  Lightbulb,
  Sparkles,
  BrainCircuit,
} from "lucide-react";

export default function MockInterviewPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalizedIndicesRef = useRef(new Set());
  const usedSpeechForTurnRef = useRef(false);
  const turnStartTimeRef = useRef(Date.now());

  const [isSpeechSupported, setIsSpeechSupported] = useState(() => {
    return (
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  });

  const [projectMock] = useState(() => {
    try {
      const saved = sessionStorage.getItem("prepnest_mock_project_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Setup & Config Data from PostgreSQL
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [bankCounts, setBankCounts] = useState({});
  const [candidateContext, setCandidateContext] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [activeRecoverable, setActiveRecoverable] = useState(null);

  // User Interview Configuration
  const [selectedCategory, setSelectedCategory] = useState(() =>
    projectMock?.questions?.length > 0 ? "Project" : "Technical"
  );
  const [selectedCompany, setSelectedCompany] = useState("General");
  const [targetRole, setTargetRole] = useState("");
  const [selectedMode, setSelectedMode] = useState("realistic");
  const [selectedPersonality, setSelectedPersonality] = useState("professional");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [durationMinutes, setDurationMinutes] = useState(15);

  // Active AI Interview Session State
  const [session, setSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  // Practice Mode Hint + Feedback
  const [hintText, setHintText] = useState(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Answer Capture & Hardware
  const [answer, setAnswer] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [micError, setMicError] = useState(null);

  // Timers (Total remaining + per-turn pressure timer)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120);

  // Final Report State
  const [finishedReport, setFinishedReport] = useState(null);
  const [finishedMeta, setFinishedMeta] = useState(null);
  const [xpData, setXpData] = useState(null);

  const loadConfigAndHistory = useCallback(async () => {
    setConfigLoading(true);
    setConfigError(null);
    try {
      const [cfgRes, actRes, histRes] = await Promise.all([
        apiFetch("/api/interviews/config"),
        apiFetch("/api/interviews/active"),
        apiFetch("/api/interviews/history"),
      ]);

      if (!cfgRes.ok) {
        throw new Error(`HTTP ${cfgRes.status}`);
      }
      const cfg = await cfgRes.json();
      setCompanies(cfg.companies || []);
      setBankCounts(cfg.bank_counts || {});
      setCandidateContext(cfg.candidate_context || null);
      if (cfg.candidate_context?.target_role && !targetRole) {
        setTargetRole(cfg.candidate_context.target_role);
      }
      if (cfg.candidate_context?.target_companies?.length > 0 && selectedCompany === "General") {
        const firstComp = cfg.candidate_context.target_companies[0];
        const match = (cfg.companies || []).find(
          (c) => c.name.toLowerCase() === firstComp.toLowerCase()
        );
        if (match) setSelectedCompany(match.name);
      }

      if (actRes.ok) {
        const actData = await actRes.json();
        setActiveRecoverable(actData.active_session || null);
      }
      if (histRes.ok) {
        const histData = await histRes.json();
        setInterviewHistory(histData.history || []);
      }
    } catch (err) {
      console.error("Failed to load interview config:", err);
      setConfigError("Unable to load interview configuration and history from the server.");
    } finally {
      setConfigLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadConfigAndHistory();
  }, [loadConfigAndHistory]);

  const started = Boolean(session && !finishedReport);

  /* =======================================================
     CAMERA & MICROPHONE HARDWARE (PRESERVED)
  ======================================================= */

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setMicActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera and microphone are not supported in this browser environment.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
        streamRef.current = stream;
        setCameraActive(true);
        setMicActive(true);
        setCameraError(null);
      } catch (videoError) {
        if (
          videoError.name === "NotFoundError" ||
          videoError.name === "OverconstrainedError" ||
          videoError.name === "DevicesNotFoundError"
        ) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = audioStream;
            setCameraActive(false);
            setMicActive(true);
            setCameraError("No webcam found. Continuing in audio-only mode.");
          } catch {
            throw videoError;
          }
        } else {
          throw videoError;
        }
      }
    } catch (error) {
      console.error("Camera/Mic error:", error);
      setCameraActive(false);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError(
          "Camera/Microphone permission was denied. Allow browser permissions or continue with manual typing."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("No webcam or microphone was detected on this device.");
      } else {
        setCameraError(`Device access issue: ${error.message || "Unable to open webcam."}`);
      }
    }
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn("Video playback error:", err));
    }
  }, [cameraActive, started]);

  const toggleCamera = () => {
    if (cameraActive) stopCamera();
    else startCamera();
  };

  /* =======================================================
     SPEECH RECOGNITION (BUG-FREE DEDUP PRESERVED)
  ======================================================= */

  const stopSpeechRecognition = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech stop error:", err);
      }
      recognitionRef.current = null;
    }
    setIsAnswering(false);
    setInterimTranscript("");
  }, []);

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextEnabled = !micActive;
        audioTracks.forEach((t) => {
          t.enabled = nextEnabled;
        });
        setMicActive(nextEnabled);
        if (!nextEnabled && isAnswering) {
          stopSpeechRecognition();
        }
        return;
      }
    }
    if (!micActive) startCamera();
  };

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMicError(
        "Speech recognition is not supported in this browser. Use Chrome or Edge, or type your answer manually."
      );
      return;
    }

    stopSpeechRecognition();
    finalizedIndicesRef.current.clear();
    isListeningRef.current = true;
    usedSpeechForTurnRef.current = true;
    setMicError(null);
    setInterimTranscript("");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsAnswering(true);

      recognition.onresult = (event) => {
        if (!isListeningRef.current) return;
        let newFinalText = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || "";
          if (result.isFinal) {
            if (!finalizedIndicesRef.current.has(i)) {
              finalizedIndicesRef.current.add(i);
              const cleanChunk = transcriptChunk.trim();
              if (cleanChunk) {
                newFinalText += (newFinalText ? " " : "") + cleanChunk;
              }
            }
          } else {
            const cleanChunk = transcriptChunk.trim();
            if (cleanChunk) {
              currentInterim += (currentInterim ? " " : "") + cleanChunk;
            }
          }
        }

        if (newFinalText) {
          setAnswer((prev) => {
            const prevTrimmed = prev ? prev.trim() : "";
            return prevTrimmed ? `${prevTrimmed} ${newFinalText}` : newFinalText;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError(
            "Microphone permission was denied. Allow microphone access or type your response manually."
          );
          stopSpeechRecognition();
          return;
        }
        if (event.error === "audio-capture") {
          setMicError("No microphone detected. Continue by typing manually.");
          stopSpeechRecognition();
          return;
        }
        console.warn("Speech warning:", event.error);
      };

      recognition.onend = () => {
        setInterimTranscript("");
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            isListeningRef.current = false;
            setIsAnswering(false);
          }
        } else {
          setIsAnswering(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      isListeningRef.current = false;
      setIsAnswering(false);
      setMicError(`Unable to start speech recognition: ${error.message}`);
    }
  }, [stopSpeechRecognition]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeechRecognition();
    };
  }, [stopCamera, stopSpeechRecognition]);

  /* =======================================================
     TIMERS
  ======================================================= */

  useEffect(() => {
    if (!started || finishedReport) return;

    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => Math.max(0, prev - 1));
      if (session?.mode === "pressure" && session?.current_phase !== "introduction") {
        setTurnTimeLeft((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finishedReport, session?.mode, session?.current_phase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* =======================================================
     SESSION START, RECOVERY & TURN LIFECYCLE
  ======================================================= */

  const startNewInterview = async () => {
    setIsStarting(true);
    setSessionError(null);
    setFinishedReport(null);
    setXpData(null);
    setHintText(null);
    try {
      const res = await apiFetch("/api/interviews/sessions", {
        method: "POST",
        body: JSON.stringify({
          category: selectedCategory,
          company_name: selectedCompany === "General" ? null : selectedCompany,
          target_role: targetRole.trim() || null,
          personality: selectedPersonality,
          mode: selectedMode,
          experience_level: experienceLevel,
          duration_minutes: durationMinutes,
          project_data: selectedCategory === "Project" ? projectMock : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to start AI interview session");
      }
      const data = await res.json();
      setSession(data);
      setActiveRecoverable(null);
      setSessionTimeLeft(data.time_remaining_seconds ?? durationMinutes * 60);
      setTurnTimeLeft(data.mode === "pressure" ? 90 : 180);
      setAnswer("");
      setInterimTranscript("");
      usedSpeechForTurnRef.current = false;
      turnStartTimeRef.current = Date.now();
      await startCamera();
    } catch (err) {
      setSessionError(err.message || "Could not start interview session.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleResumeRecoverable = async () => {
    if (!activeRecoverable) return;
    setSession(activeRecoverable);
    setActiveRecoverable(null);
    setSessionTimeLeft(activeRecoverable.time_remaining_seconds ?? 600);
    setTurnTimeLeft(activeRecoverable.mode === "pressure" ? 90 : 180);
    setAnswer("");
    setInterimTranscript("");
    setHintText(null);
    usedSpeechForTurnRef.current = false;
    turnStartTimeRef.current = Date.now();
    await startCamera();
  };

  const handleDiscardRecoverable = async () => {
    if (!activeRecoverable?.session_id) return;
    try {
      await apiFetch(`/api/interviews/sessions/${activeRecoverable.session_id}/abandon`, {
        method: "POST",
      });
    } catch {
      // ignore
    }
    setActiveRecoverable(null);
  };

  const handleSubmitTurn = async (overrideAnswer = null) => {
    if (!session || isSubmittingTurn || isFinishing) return;
    const textToSubmit = overrideAnswer !== null ? overrideAnswer : answer;

    if (session.current_phase !== "introduction" && !textToSubmit.trim()) {
      setSessionError("Please speak or type your answer before continuing.");
      return;
    }

    stopSpeechRecognition();
    setIsSubmittingTurn(true);
    setSessionError(null);
    setHintText(null);

    const elapsedSec = Math.max(1, Math.round((Date.now() - turnStartTimeRef.current) / 1000));

    try {
      const res = await apiFetch(`/api/interviews/sessions/${session.session_id}/respond`, {
        method: "POST",
        body: JSON.stringify({
          turn_number: session.current_turn_number,
          candidate_answer: textToSubmit.trim() || "Yes, I am ready to begin.",
          response_time_seconds: elapsedSec,
          time_remaining_seconds: sessionTimeLeft,
          transcription_uncertain: usedSpeechForTurnRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to process your response");
      }

      const updated = await res.json();
      if (updated.current_prompt?.should_complete) {
        await handleCompleteSession(updated, true);
        return;
      }

      setSession(updated);
      setAnswer("");
      setInterimTranscript("");
      usedSpeechForTurnRef.current = false;
      turnStartTimeRef.current = Date.now();
      setTurnTimeLeft(updated.mode === "pressure" ? 90 : 180);
    } catch (err) {
      setSessionError(err.message || "AI interviewer encountered an issue. Your draft is preserved — retry.");
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  const handleCompleteSession = async (sessionOverride = null, skipFinalDraft = false) => {
    const activeSess = sessionOverride || session;
    if (!activeSess || isFinishing) return;

    stopCamera();
    stopSpeechRecognition();
    setIsFinishing(true);
    setSessionError(null);

    const elapsedSec = Math.max(1, Math.round((Date.now() - turnStartTimeRef.current) / 1000));
    const draft = skipFinalDraft ? "" : answer.trim();

    try {
      const res = await apiFetch(`/api/interviews/sessions/${activeSess.session_id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          turn_number: activeSess.current_turn_number,
          final_answer: draft || null,
          response_time_seconds: elapsedSec,
          transcription_uncertain: usedSpeechForTurnRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not finalize evaluation report");
      }

      const data = await res.json();
      setFinishedReport(data.evaluation_report);
      setFinishedMeta({
        category: activeSess.category,
        company_name: activeSess.company_name,
        target_role: activeSess.target_role,
        mode: activeSess.mode,
        personality: activeSess.personality,
      });
      setXpData(data);
      setSession(null);
      notifyStatsUpdated();
      loadConfigAndHistory();
    } catch (err) {
      setSessionError(err.message || "Failed to generate final evaluation report.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleAskHint = async () => {
    if (!session || session.mode !== "practice" || isLoadingHint) return;
    setIsLoadingHint(true);
    setSessionError(null);
    try {
      const res = await apiFetch(`/api/interviews/sessions/${session.session_id}/hint`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setHintText(data.hint);
      }
    } catch {
      setHintText("Structure your answer around core mechanism, trade-offs, and a concrete example.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleViewHistoryReport = async (sessionId) => {
    try {
      const res = await apiFetch(`/api/interviews/sessions/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.evaluation_report) {
        setFinishedReport(data.evaluation_report);
        setFinishedMeta({
          category: data.category,
          company_name: data.company_name,
          target_role: data.target_role,
          mode: data.mode,
          personality: data.personality,
        });
        setXpData(null);
      }
    } catch (err) {
      console.warn("Could not open past report:", err);
    }
  };

  const handleRestart = () => {
    stopCamera();
    stopSpeechRecognition();
    setSession(null);
    setFinishedReport(null);
    setFinishedMeta(null);
    setXpData(null);
    setAnswer("");
    setInterimTranscript("");
    setHintText(null);
    setSessionError(null);
    loadConfigAndHistory();
  };

  /* =======================================================
     REPORT VIEW
  ======================================================= */

  if (finishedReport) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0D1117] text-[#1E293B] dark:text-[#E6EDF3] font-sans">
        <Sidebar activeRoute="mock-interview" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header defaultCollapsed />
          <BlurDrop as="main" className="p-6 md:p-8 overflow-y-auto">
            <InterviewReport
              report={finishedReport}
              xpData={xpData}
              sessionMeta={finishedMeta}
              onRestart={handleRestart}
            />
          </BlurDrop>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE (SETUP OR ACTIVE CONVERSATIONAL ROOM)
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0D1117] text-[#1E293B] dark:text-[#E6EDF3] font-sans">
      <Sidebar activeRoute="mock-interview" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:pr-[124px] lg:pr-[132px]">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
                AI Adaptive Mock Interview
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] mt-1">
                Conversational AI interviewer with dynamic follow-up probing, company-pattern calibration, and structured rubric evaluation.
              </p>
            </div>
          </div>

          {sessionError && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/30 text-xs text-[#DC2626] dark:text-[#F85149] flex items-center justify-between gap-3">
              <span className="font-medium">{sessionError}</span>
              <button
                type="button"
                onClick={() => setSessionError(null)}
                className="font-semibold underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SETUP VIEW */}
          {!started && (
            <InterviewSetup
              configLoading={configLoading}
              configError={configError}
              onRetryConfig={loadConfigAndHistory}
              companies={companies}
              bankCounts={bankCounts}
              candidateContext={candidateContext}
              projectMock={projectMock}
              activeRecoverableSession={activeRecoverable}
              onResumeSession={handleResumeRecoverable}
              onDiscardRecoverable={handleDiscardRecoverable}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              targetRole={targetRole}
              onChangeTargetRole={setTargetRole}
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              selectedPersonality={selectedPersonality}
              onSelectPersonality={setSelectedPersonality}
              experienceLevel={experienceLevel}
              onSelectExperienceLevel={setExperienceLevel}
              durationMinutes={durationMinutes}
              onSelectDuration={setDurationMinutes}
              onStartInterview={startNewInterview}
              isStarting={isStarting}
              interviewHistory={interviewHistory}
              onViewHistoryReport={handleViewHistoryReport}
            />
          )}

          {/* ACTIVE CONVERSATIONAL INTERVIEW ROOM */}
          {started && session && (() => {
            const prompt = session.current_prompt || {};
            const turns = session.turns || [];
            const liveWords = answer.split(/\s+/).filter(Boolean).length;
            const mainTotal = session.max_questions || 6;
            const mainAsked = session.main_questions_asked || 0;
            const completionPct = Math.min(100, Math.round((mainAsked / mainTotal) * 100));

            const evaluatedTurns = turns.filter(
              (t) => t.phase !== "introduction" && t.evaluation_score !== null && t.evaluation_score !== undefined
            );
            const avgLiveScore =
              evaluatedTurns.length > 0
                ? Math.round(
                    evaluatedTurns.reduce((acc, t) => acc + Number(t.evaluation_score || 0), 0) /
                      evaluatedTurns.length
                  )
                : null;

            const provenance =
              PROVENANCE_LABELS[prompt.question_source] || PROVENANCE_LABELS.topic_directory;
            const strategyLabel = prompt.followup_strategy
              ? STRATEGY_LABELS[prompt.followup_strategy] || prompt.followup_strategy
              : null;

            const ringSize = 92;
            const ringStroke = 8;
            const ringRadius = (ringSize - ringStroke) / 2;
            const ringCircumference = 2 * Math.PI * ringRadius;
            const ringOffset = ringCircumference - (completionPct / 100) * ringCircumference;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN (~68%): WEBCAM + CONVERSATIONAL PROMPT + ANSWER WORKSPACE */}
                <div className="lg:col-span-8 space-y-5 min-w-0">
                  {/* A. INTERVIEW VIDEO WORKSPACE */}
                  <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs overflow-hidden">
                    <div className="px-4 sm:px-5 py-3 bg-[#F8FAFC] dark:bg-[#0D1117]/75 border-b border-[#E2E8F0] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          AI
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                              {session.company_name ? `${session.company_name} ` : ""}AI Interviewer
                            </h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#B45309] dark:text-[#FBBF24] capitalize">
                              {session.personality}
                            </span>
                            {isAnswering && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-[#DC2626] dark:text-[#F85149] text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                                REC
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] truncate">
                            {isSubmittingTurn
                              ? "AI interviewer is analyzing your answer and preparing the next turn..."
                              : isAnswering
                              ? "Listening and transcribing your response..."
                              : "Interview session active — speak or type your response"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={toggleCamera}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            cameraActive
                              ? "bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/25 text-[#16A34A] dark:text-[#3FB950]"
                              : "bg-[#FFFFFF] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]"
                          }`}
                        >
                          {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                          <span>{cameraActive ? "Camera On" : "Camera Off"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={toggleMic}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            isAnswering
                              ? "bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626]"
                              : micActive
                              ? "bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/25 text-[#16A34A]"
                              : "bg-[#FFFFFF] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]"
                          }`}
                        >
                          {micActive || isAnswering ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                          <span>{isAnswering ? "Recording" : micActive ? "Mic Ready" : "Mic Muted"}</span>
                        </button>
                      </div>
                    </div>

                    {/* 16:9 Webcam Preview */}
                    <div className="relative aspect-video bg-[#0F172A] flex items-center justify-center overflow-hidden">
                      {cameraActive ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 max-w-sm">
                          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto text-[#F59E0B]">
                            <User className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-semibold text-white mt-3">
                            Camera preview is paused
                          </p>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {cameraError || "Enable your webcam for a realistic interview or continue in voice/text mode."}
                          </p>
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className="mt-4 inline-flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-xs text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Enable Camera
                          </button>
                        </div>
                      )}

                      {/* AI Thinking Overlay Pill */}
                      {isSubmittingTurn && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#F59E0B]/40 text-xs font-semibold text-white">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F59E0B]" />
                          <span>AI Interviewer thinking...</span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex items-center justify-between gap-2 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-[11px] font-medium text-white">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAnswering ? "bg-[#EF4444] animate-pulse" : cameraActive ? "bg-[#22C55E]" : "bg-slate-400"
                            }`}
                          />
                          {isAnswering ? "Voice Capture Active" : cameraActive ? "Live Video Feed" : "Audio / Text Mode"}
                        </span>

                        <span className="text-[11px] font-medium text-white/90 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15 capitalize">
                          {session.mode} Mode · {session.category}
                        </span>
                      </div>
                    </div>

                    {(cameraError || micError) && (
                      <div className="px-4 py-3 bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border-t border-[#F59E0B]/25 text-xs text-[#B45309] dark:text-[#FBBF24] flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          {cameraError && <p>{cameraError}</p>}
                          {micError && <p>{micError}</p>}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* B. CONVERSATIONAL QUESTION & C. ANSWER WORKSPACE */}
                  <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs p-5 sm:p-6 space-y-5">
                    {/* Phase Lifecycle Stepper & Timers */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {PHASE_STEPS.map((st, idx) => {
                          const active = session.current_phase === st.id;
                          return (
                            <span
                              key={st.id}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                                active
                                  ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                                  : "bg-[#F8FAFC] dark:bg-[#0D1117] text-[#64748B] border-[#E2E8F0] dark:border-[#30363D]"
                              }`}
                            >
                              {idx + 1}. {st.label}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {session.mode === "pressure" && session.current_phase !== "introduction" && (
                          <div
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold tabular-nums ${
                              turnTimeLeft <= 20
                                ? "bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626] animate-pulse"
                                : "bg-[#FFFBEB] border-[#F59E0B]/30 text-[#B45309]"
                            }`}
                            title="Pressure mode per-question timer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Turn {formatTime(turnTimeLeft)}</span>
                          </div>
                        )}
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tabular-nums ${
                            sessionTimeLeft <= 60
                              ? "bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626]"
                              : "bg-[#F8FAFC] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#1E293B] dark:text-[#E6EDF3]"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>{formatTime(sessionTimeLeft)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Question Metadata Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[11px] font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        Turn {session.current_turn_number}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${provenance.className}`}>
                        {provenance.label}
                      </span>
                      {prompt.question_topic && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[11px] font-medium text-[#64748B]">
                          Topic: {prompt.question_topic}
                        </span>
                      )}
                      {prompt.question_difficulty && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/12 border border-[#F59E0B]/30 text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                          {prompt.question_difficulty}
                        </span>
                      )}
                      {strategyLabel && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#2563EB]/15 border border-[#2563EB]/30 text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                          {strategyLabel}
                        </span>
                      )}
                    </div>

                    {/* AI Interviewer Spoken/Written Prompt Box */}
                    <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/80 border border-[#E2E8F0] dark:border-[#30363D] p-5 space-y-2.5">
                      {prompt.interviewer_message && (
                        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                          {prompt.interviewer_message}
                        </p>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                        {prompt.question_text}
                      </h3>
                    </div>

                    {/* Practice Mode Immediate Feedback + Hint */}
                    {session.mode === "practice" && session.practice_feedback && (
                      <div className="p-4 rounded-xl bg-[#F0FDF4]/70 dark:bg-[#16A34A]/10 border border-[#16A34A]/25 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#16A34A] dark:text-[#3FB950] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Practice Coaching on Previous Response</span>
                          </span>
                          <span className="font-bold text-[#16A34A]">
                            {session.practice_feedback.score}% ({session.practice_feedback.verdict})
                          </span>
                        </div>
                        <p className="text-[#1E293B] dark:text-[#E6EDF3]">
                          <strong>Good:</strong> {session.practice_feedback.what_was_correct}
                        </p>
                        <p className="text-[#64748B] dark:text-[#8B949E]">
                          <strong>Tip:</strong> {session.practice_feedback.suggested_improvement}
                        </p>
                      </div>
                    )}

                    {session.mode === "practice" && hintText && (
                      <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/12 border border-[#F59E0B]/30 text-xs text-[#B45309] dark:text-[#FBBF24] flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
                        <div>
                          <span className="font-bold block">Coaching Hint</span>
                          <span>{hintText}</span>
                        </div>
                      </div>
                    )}

                    {/* Answer Workspace */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="interview-answer-editor"
                          className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Your Response</span>
                        </label>
                        <span className="text-[11px] text-[#64748B] dark:text-[#8B949E]">
                          {isAnswering
                            ? "Recording & transcribing voice live"
                            : isSpeechSupported
                            ? "Speak via microphone or type manually"
                            : "Manual typing workspace"}
                        </span>
                      </div>

                      <textarea
                        id="interview-answer-editor"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={isSubmittingTurn || isFinishing}
                        placeholder={
                          session.current_phase === "introduction"
                            ? "Confirm you are ready (or click 'Ready & Begin' below), or briefly introduce yourself..."
                            : isAnswering
                            ? "Listening to your microphone... Speak naturally and clearly."
                            : "Type your response here, or click 'Start Answering' below to dictate via microphone..."
                        }
                        className="w-full min-h-[160px] resize-y rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/80 border border-[#E2E8F0] dark:border-[#30363D] text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] p-4 outline-none focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-[#0D1117] focus:ring-2 focus:ring-[#F59E0B]/15 leading-relaxed transition disabled:opacity-60"
                      />

                      {interimTranscript && (
                        <div className="p-3 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs text-[#B45309] dark:text-[#FBBF24] flex items-start gap-2">
                          <Mic className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-semibold">Live Transcript: </span>
                            <span className="italic">"{interimTranscript}"</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#64748B] tabular-nums">
                        <span>
                          <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{liveWords}</strong> words · {answer.length} chars
                        </span>
                        {usedSpeechForTurnRef.current && (
                          <span className="text-[11px] text-[#64748B]">
                            Speech capture active (transcription tolerant grading)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {!isAnswering ? (
                          <button
                            type="button"
                            onClick={startSpeechRecognition}
                            disabled={isSubmittingTurn || isFinishing}
                            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            <span>Start Answering</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopSpeechRecognition}
                            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            <MicOff className="w-4 h-4" />
                            <span>Stop Recording</span>
                          </button>
                        )}

                        {session.mode === "practice" && session.current_phase !== "introduction" && (
                          <button
                            type="button"
                            onClick={handleAskHint}
                            disabled={isLoadingHint || isSubmittingTurn}
                            className="inline-flex items-center gap-1.5 bg-[#FFFBEB] dark:bg-[#F59E0B]/15 hover:bg-[#FEF3C7] text-[#B45309] dark:text-[#FBBF24] border border-[#F59E0B]/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                          >
                            {isLoadingHint ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Lightbulb className="w-3.5 h-3.5" />
                            )}
                            <span>Hint</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            stopSpeechRecognition();
                            setAnswer("");
                            setInterimTranscript("");
                            usedSpeechForTurnRef.current = false;
                          }}
                          disabled={!answer && !interimTranscript}
                          className="inline-flex items-center gap-1.5 bg-[#F8FAFC] dark:bg-[#21262D] disabled:opacity-40 text-[#1E293B] dark:text-[#E6EDF3] text-xs font-medium px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Clear</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleSubmitTurn(
                              session.current_phase === "introduction" && !answer.trim()
                                ? "Yes, I am ready to begin."
                                : null
                            )
                          }
                          disabled={
                            isSubmittingTurn ||
                            isFinishing ||
                            (session.current_phase !== "introduction" && !answer.trim())
                          }
                          className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-45 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          {isSubmittingTurn ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>AI Analyzing...</span>
                            </>
                          ) : session.current_phase === "introduction" ? (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Ready &amp; Begin</span>
                            </>
                          ) : session.current_phase === "final" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Submit &amp; Finish</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Response</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "End this interview now and generate your evaluation report?"
                              )
                            ) {
                              handleCompleteSession();
                            }
                          }}
                          disabled={isSubmittingTurn || isFinishing}
                          className="inline-flex items-center gap-1.5 bg-[#FFFFFF] dark:bg-[#161B22] hover:bg-[#FEF2F2] text-[#64748B] hover:text-[#DC2626] text-xs font-medium px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] transition cursor-pointer"
                        >
                          {isFinishing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                          <span>Finish &amp; Report</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN (~32%): PROGRESS, ADAPTIVE TELEMETRY, SESSION INFO, TRANSCRIPT */}
                <aside className="lg:col-span-4 space-y-5 min-w-0">
                  {/* A. INTERVIEW PROGRESS */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                        Interview Progress
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFBEB] dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#F59E0B]/25 capitalize">
                        {session.current_phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative w-[92px] h-[92px] shrink-0 flex items-center justify-center">
                        <svg width={ringSize} height={ringSize} className="-rotate-90" aria-hidden="true">
                          <circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={ringRadius}
                            fill="none"
                            stroke={isDark ? "#30363D" : "#E2E8F0"}
                            strokeWidth={ringStroke}
                          />
                          <circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={ringRadius}
                            fill="none"
                            stroke={completionPct === 100 ? "#16A34A" : "#F59E0B"}
                            strokeWidth={ringStroke}
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-base font-bold tabular-nums">{completionPct}%</span>
                          <span className="text-[10px] text-[#64748B]">Track</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                        <span className="text-[11px] text-[#64748B] block">Core Questions</span>
                        <span className="text-base font-bold tabular-nums">
                          {mainAsked} / {mainTotal}
                        </span>
                        <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* B. ADAPTIVE ENGINE TELEMETRY */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Adaptive AI Telemetry</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Adaptive Difficulty</span>
                        <span className="font-bold text-[#F59E0B]">{session.current_difficulty}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Evaluated Turns</span>
                        <span className="font-semibold tabular-nums">{evaluatedTurns.length}</span>
                      </div>
                      {session.mode === "practice" && avgLiveScore !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Practice Running Avg</span>
                          <span className="font-bold text-[#16A34A] tabular-nums">{avgLiveScore}%</span>
                        </div>
                      )}
                      {session.mode !== "practice" && (
                        <p className="text-[11px] text-[#64748B] pt-1 border-t border-[#E2E8F0] dark:border-[#30363D]">
                          Detailed rubric scoring is withheld until conclusion in {session.mode} mode.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* C. SESSION INFORMATION */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Session Details</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#64748B]">Company Track</span>
                        <span className="font-semibold truncate">{session.company_name || "General"}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#64748B]">Target Role</span>
                        <span className="font-semibold truncate max-w-[160px]">{session.target_role}</span>
                      </div>
                      <div className="flex justify-between gap-2 capitalize">
                        <span className="text-[#64748B]">Mode / Style</span>
                        <span className="font-semibold">
                          {session.mode} · {session.personality}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* D. RESPONSE STATUS */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Response Status</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between tabular-nums">
                        <span className="text-[#64748B]">Current Draft</span>
                        <span className="font-semibold">{liveWords} words</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Voice Capture</span>
                        <span className={isAnswering ? "text-[#DC2626] font-semibold" : "text-[#16A34A] font-medium"}>
                          {isAnswering ? "Recording" : isSpeechSupported ? "Ready" : "Manual"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Camera / Mic</span>
                        <span className="font-medium">
                          {cameraActive ? "Cam On" : "Cam Off"} · {micActive ? "Mic On" : "Muted"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* E. LIVE CONVERSATION TRANSCRIPT */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                        Interview Transcript
                      </h3>
                      <span className="text-[11px] text-[#64748B] tabular-nums">{turns.length} turns</span>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {turns.map((t) => {
                        const isLatest = t.turn_number === session.current_turn_number;
                        return (
                          <div
                            key={t.turn_number}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isLatest
                                ? "bg-[#FFFBEB] dark:bg-[#F59E0B]/12 border-[#F59E0B]/40"
                                : "bg-[#F8FAFC] dark:bg-[#0D1117]/70 border-[#E2E8F0] dark:border-[#30363D]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase">
                              <span className={isLatest ? "text-[#D97706]" : "text-[#64748B]"}>
                                Turn {t.turn_number} · {t.phase}
                              </span>
                              {t.followup_strategy && (
                                <span className="text-[#2563EB]">{t.followup_strategy}</span>
                              )}
                            </div>
                            <p className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] line-clamp-2">
                              Q: {t.question_text}
                            </p>
                            {t.candidate_answer && (
                              <p className="text-[#64748B] dark:text-[#8B949E] line-clamp-2 italic">
                                You: {t.candidate_answer}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </aside>
              </div>
            );
          })()}
        </BlurDrop>
      </div>
    </div>
  );
}

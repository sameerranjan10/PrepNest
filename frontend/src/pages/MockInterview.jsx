import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sparkles,
  User,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Clock,
  MessageSquare,
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

/* =========================================================
   INTERVIEW QUESTIONS
========================================================= */

const INTERVIEW_QUESTIONS = {
  Technical: [
    {
      question:
        "Explain the difference between optimistic concurrency control and pessimistic locking in database architecture.",
      keywords: [
        "optimistic",
        "pessimistic",
        "locking",
        "transaction",
        "concurrency",
      ],
    },
    {
      question:
        "What is the difference between a process and a thread?",
      keywords: [
        "process",
        "thread",
        "memory",
        "execution",
        "resource",
      ],
    },
    {
      question:
        "What is REST API and what are the main HTTP methods used in REST?",
      keywords: [
        "rest",
        "api",
        "http",
        "get",
        "post",
        "put",
        "delete",
      ],
    },
    {
      question:
        "Explain the concept of normalization in databases and why it is useful.",
      keywords: [
        "normalization",
        "database",
        "redundancy",
        "normal form",
        "data",
      ],
    },
    {
      question:
        "What is the difference between authentication and authorization?",
      keywords: [
        "authentication",
        "authorization",
        "identity",
        "permission",
        "access",
      ],
    },
  ],

  HR: [
    {
      question:
        "Tell me about yourself and explain why you are interested in this role.",
      keywords: [
        "education",
        "experience",
        "skills",
        "project",
        "career",
      ],
    },
    {
      question:
        "What is your biggest strength and how has it helped you?",
      keywords: [
        "strength",
        "example",
        "experience",
        "result",
      ],
    },
    {
      question:
        "Tell me about a difficult problem you faced and how you solved it.",
      keywords: [
        "problem",
        "solution",
        "challenge",
        "result",
        "learn",
      ],
    },
    {
      question:
        "Where do you see yourself in the next five years?",
      keywords: [
        "career",
        "growth",
        "skills",
        "experience",
        "goal",
      ],
    },
    {
      question:
        "Why should we hire you?",
      keywords: [
        "skills",
        "experience",
        "value",
        "team",
        "contribute",
      ],
    },
  ],

  Behavioral: [
    {
      question:
        "Tell me about a time when you worked as part of a team.",
      keywords: [
        "team",
        "communication",
        "responsibility",
        "result",
      ],
    },
    {
      question:
        "Describe a situation where you had to meet a tight deadline.",
      keywords: [
        "deadline",
        "planning",
        "priority",
        "result",
      ],
    },
    {
      question:
        "Tell me about a mistake you made and what you learned from it.",
      keywords: [
        "mistake",
        "learn",
        "improve",
        "experience",
      ],
    },
    {
      question:
        "How do you handle disagreement with a teammate?",
      keywords: [
        "communication",
        "listen",
        "discussion",
        "solution",
        "team",
      ],
    },
    {
      question:
        "Describe a situation where you demonstrated leadership.",
      keywords: [
        "leadership",
        "team",
        "decision",
        "responsibility",
        "result",
      ],
    },
  ],
};

/* =========================================================
   EVALUATION FUNCTION
========================================================= */

const evaluateAnswer = (answerText, question) => {
  if (!answerText || !answerText.trim()) {
    return {
      score: 0,
      wordCount: 0,
      matchedKeywords: [],
    };
  }

  const normalizedAnswer = answerText.toLowerCase();
  const words = normalizedAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const matchedKeywords = (question?.keywords || []).filter((keyword) =>
    normalizedAnswer.includes(keyword.toLowerCase())
  );

  const keywordScore =
    question?.keywords?.length > 0
      ? Math.round((matchedKeywords.length / question.keywords.length) * 50)
      : 0;

  let lengthScore = 0;
  if (wordCount >= 100) {
    lengthScore = 30;
  } else if (wordCount >= 60) {
    lengthScore = 25;
  } else if (wordCount >= 30) {
    lengthScore = 18;
  } else if (wordCount >= 15) {
    lengthScore = 10;
  } else {
    lengthScore = 5;
  }

  const structureScore =
    answerText.includes(".") || answerText.includes(",") ? 20 : 10;

  const score = Math.min(100, keywordScore + lengthScore + structureScore);

  return {
    score,
    wordCount,
    matchedKeywords,
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MockInterviewPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalizedIndicesRef = useRef(new Set());

  // Check speech recognition support once
  const [isSpeechSupported, setIsSpeechSupported] = useState(() => {
    return typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const [projectMock, setProjectMock] = useState(() => {
    try {
      const saved = sessionStorage.getItem("prepnest_mock_project_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const allInterviewQuestions = useMemo(() => {
    const base = { ...INTERVIEW_QUESTIONS };
    if (projectMock && projectMock.questions && projectMock.questions.length > 0) {
      base["Project"] = projectMock.questions;
    }
    return base;
  }, [projectMock]);

  const [interviewType, setInterviewType] = useState(() => {
    try {
      const saved = sessionStorage.getItem("prepnest_mock_project_data");
      return saved ? "Project" : "Technical";
    } catch {
      return "Technical";
    }
  });

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Current question answer text (manual + finalized speech)
  const [answer, setAnswer] = useState("");
  // Live unfinalized speech (interim only, cleared on finalize or stop)
  const [interimTranscript, setInterimTranscript] = useState("");

  // Store answers per question: Array of objects indexed by question index
  const [answers, setAnswers] = useState([]);

  const [isAnswering, setIsAnswering] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [micError, setMicError] = useState(null);

  const [timeLeft, setTimeLeft] = useState(180);
  const [results, setResults] = useState(null);
  const [xpData, setXpData] = useState(null);

  const questions =
    allInterviewQuestions[interviewType] || INTERVIEW_QUESTIONS.Technical;

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (!started || finished) {
      return;
    }

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  /* =======================================================
     CAMERA ATTACHMENT
  ======================================================= */

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn("Video playback error:", err);
      });
    }
  }, [cameraActive, started]);

  /* =======================================================
     CLEANUP ON UNMOUNT
  ======================================================= */

  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeechRecognition();
    };
  }, []);

  /* =======================================================
     FORMAT TIMER
  ======================================================= */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  /* =======================================================
     CAMERA & MICROPHONE HARDWARE
  ======================================================= */

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera and microphone are not supported in this browser environment.");
        return;
      }

      // First attempt video + audio
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
        // Fallback: If no camera hardware is attached or video fails, try audio-only
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
          } catch (audioErr) {
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
          "Camera/Microphone permission was denied. Please allow access in browser permissions or continue using manual typing."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("No webcam or microphone was detected on this device.");
      } else {
        setCameraError(`Device access issue: ${error.message || "Unable to open webcam."}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  /* =======================================================
     SPEECH RECOGNITION (BUG-FREE & NO DUPLICATION)
  ======================================================= */

  const stopSpeechRecognition = useCallback(() => {
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        // Detach event listeners so no trailing events are processed
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      }
      recognitionRef.current = null;
    }

    setIsAnswering(false);
    setInterimTranscript("");
  }, []);

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMicError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your answer manually."
      );
      return;
    }

    // Cleanly stop any existing instance and reset state
    stopSpeechRecognition();

    finalizedIndicesRef.current.clear();
    isListeningRef.current = true;
    setMicError(null);
    setInterimTranscript("");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsAnswering(true);
      };

      recognition.onresult = (event) => {
        if (!isListeningRef.current) return;

        let newFinalText = "";
        let currentInterim = "";

        // Iterate through all returned results starting at resultIndex
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || "";

          if (result.isFinal) {
            // Strictly guard against processing the same finalized index more than once
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

        // Commit final speech to answer state exactly once
        if (newFinalText) {
          setAnswer((prev) => {
            const prevTrimmed = prev ? prev.trim() : "";
            return prevTrimmed ? `${prevTrimmed} ${newFinalText}` : newFinalText;
          });
        }

        // Display interim speech only as a temporary preview
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          // Normal pause in speech, ignore without interrupting user
          return;
        }

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError(
            "Microphone permission was denied. Please allow microphone access in your browser or type manually."
          );
          stopSpeechRecognition();
          return;
        }

        if (event.error === "audio-capture") {
          setMicError("No microphone hardware detected on this device. You can type manually.");
          stopSpeechRecognition();
          return;
        }

        console.warn("Speech recognition warning:", event.error);
      };

      recognition.onend = () => {
        setInterimTranscript("");

        // If user is still actively answering and mic was not explicitly stopped,
        // resume recognition seamlessly (Chrome auto-stops after silence).
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
      console.error("Could not start speech recognition:", error);
      isListeningRef.current = false;
      setIsAnswering(false);
      setMicError(`Unable to start speech recognition: ${error.message}`);
    }
  }, [stopSpeechRecognition]);

  /* =======================================================
     ANSWER COMMIT & NAVIGATION
  ======================================================= */

  const commitAnswerForQuestion = useCallback(
    (questionIdx, text) => {
      const q = questions[questionIdx];
      if (!q) return null;

      const evalResult = evaluateAnswer(text, q);
      const answerRecord = {
        question: q.question,
        answer: text,
        score: evalResult.score,
        wordCount: evalResult.wordCount,
        matchedKeywords: evalResult.matchedKeywords,
      };

      setAnswers((prev) => {
        const copy = [...prev];
        copy[questionIdx] = answerRecord;
        return copy;
      });

      return answerRecord;
    },
    [questions]
  );

  const startInterview = async () => {
    setStarted(true);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setAnswer("");
    setInterimTranscript("");
    setResults(null);
    setXpData(null);
    setTimeLeft(180);

    await startCamera();
  };

  const startAnswering = () => {
    startSpeechRecognition();
  };

  const stopAnswering = () => {
    stopSpeechRecognition();
  };

  const handleRetryCurrentAnswer = () => {
    stopSpeechRecognition();
    setAnswer("");
    setInterimTranscript("");
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestion] = null;
      return copy;
    });
    setTimeLeft(180);
  };

  const handleNext = () => {
    stopSpeechRecognition();
    commitAnswerForQuestion(currentQuestion, answer);

    if (currentQuestion < questions.length - 1) {
      const nextIdx = currentQuestion + 1;
      setCurrentQuestion(nextIdx);
      setAnswer(answers[nextIdx]?.answer || "");
      setInterimTranscript("");
      setTimeLeft(180);
    } else {
      finishInterview();
    }
  };

  const handlePrev = () => {
    if (currentQuestion <= 0) return;

    stopSpeechRecognition();
    commitAnswerForQuestion(currentQuestion, answer);

    const prevIdx = currentQuestion - 1;
    setCurrentQuestion(prevIdx);
    setAnswer(answers[prevIdx]?.answer || "");
    setInterimTranscript("");
    setTimeLeft(180);
  };

  const handleJumpQuestion = (targetIdx) => {
    if (targetIdx === currentQuestion || targetIdx < 0 || targetIdx >= questions.length) {
      return;
    }

    stopSpeechRecognition();
    commitAnswerForQuestion(currentQuestion, answer);

    setCurrentQuestion(targetIdx);
    setAnswer(answers[targetIdx]?.answer || "");
    setInterimTranscript("");
    setTimeLeft(180);
  };

  /* =======================================================
     FINISH INTERVIEW
  ======================================================= */

  const finishInterview = async () => {
    stopCamera();
    stopSpeechRecognition();

    const currentRecord = commitAnswerForQuestion(currentQuestion, answer);

    // Build complete final results
    const completedAnswers = questions.map((q, idx) => {
      if (idx === currentQuestion && currentRecord) return currentRecord;
      if (answers[idx]) return answers[idx];
      return {
        question: q.question,
        answer: "",
        score: 0,
        wordCount: 0,
        matchedKeywords: [],
      };
    });

    const attempted = completedAnswers.filter((item) => item.answer && item.answer.trim().length > 0);

    const totalScore =
      completedAnswers.length > 0
        ? Math.round(
            completedAnswers.reduce((total, item) => total + item.score, 0) /
              completedAnswers.length
          )
        : 0;

    const averageWords =
      attempted.length > 0
        ? Math.round(
            attempted.reduce((total, item) => total + item.wordCount, 0) /
              attempted.length
          )
        : 0;

    const keywordMatches = completedAnswers.reduce(
      (total, item) => total + item.matchedKeywords.length,
      0
    );

    const strengths = [];
    const improvements = [];

    if (totalScore >= 75) {
      strengths.push("Strong overall interview performance and structured responses.");
    }
    if (averageWords >= 45) {
      strengths.push("Answers contain comprehensive technical depth and clear context.");
    } else {
      improvements.push("Try to elaborate further and provide more detailed explanations (target 50+ words).");
    }

    if (keywordMatches >= 8) {
      strengths.push("Excellent use of relevant domain and role-specific terminology.");
    } else {
      improvements.push("Incorporate more industry-standard technical keywords and architectural concepts.");
    }

    if (totalScore >= 80) {
      strengths.push("Demonstrated strong problem-solving articulation and confidence.");
    } else if (totalScore < 60) {
      improvements.push("Practice the STAR method (Situation, Task, Action, Result) for clearer structure.");
    }

    if (improvements.length === 0) {
      improvements.push("Continue practicing to sharpen answer conciseness and delivery impact.");
    }

    setResults({
      score: totalScore,
      strengths,
      improvements,
      averageWords,
      keywordMatches,
      attemptedCount: attempted.length,
      totalQuestions: questions.length,
    });
    setAnswers(completedAnswers);

    // Record interview in backend API and award +100 XP
    try {
      const token = localStorage.getItem("prepnest_token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/interviews/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: interviewType,
          score: totalScore,
          average_words: averageWords,
          keyword_matches: keywordMatches,
          strengths,
          improvements,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setXpData(data);
      }
    } catch (err) {
      console.warn("Mock interview XP recording error:", err);
    }

    setFinished(true);
    setStarted(false);
    setIsAnswering(false);
  };

  const restartInterview = () => {
    stopCamera();
    stopSpeechRecognition();

    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswer("");
    setInterimTranscript("");
    setAnswers([]);
    setResults(null);
    setXpData(null);
    setCameraError(null);
    setMicError(null);
    setTimeLeft(180);
    setIsAnswering(false);
  };

  /* =======================================================
     FINISHED SCREEN
  ======================================================= */

  if (finished && results) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Sidebar activeRoute="mock-interview" />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* HEADER */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <h1 className="text-3xl font-extrabold text-white mt-5">
                  Interview Completed
                </h1>

                <p className="text-sm text-slate-400 mt-2">
                  Here is your structured performance analysis and feedback.
                </p>

                {xpData && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>+{xpData.xp_earned || 100} XP Earned! Daily Streak: {xpData.streak || 1} day(s)</span>
                  </div>
                )}
              </div>

              {/* OVERALL SCORE */}
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Overall Score
                </p>

                <div className="text-7xl font-extrabold text-indigo-400 mt-3">
                  {results.score}%
                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {results.score >= 80
                    ? "Excellent performance — placement ready!"
                    : results.score >= 65
                    ? "Good performance — refine your keywords & structure."
                    : results.score >= 50
                    ? "Satisfactory — practice structured technical articulation."
                    : "Needs improvement — keep practicing with mock questions."}
                </p>
              </div>

              {/* STATS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Questions Answered"
                  value={`${results.attemptedCount} / ${results.totalQuestions}`}
                />
                <StatCard
                  title="Average Words"
                  value={results.averageWords}
                />
                <StatCard
                  title="Keywords Matched"
                  value={results.keywordMatches}
                />
                <StatCard
                  title="Interview Type"
                  value={interviewType}
                />
              </div>

              {/* STRENGTHS / AREAS TO IMPROVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h3>

                  <ul className="space-y-3 text-sm text-slate-300">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Improve
                  </h3>

                  <ul className="space-y-3 text-sm text-slate-300">
                    {results.improvements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* QUESTION-BY-QUESTION ANALYSIS */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Question-by-Question Analysis
                </h3>

                <div className="space-y-4">
                  {answers.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                            Question {index + 1}
                          </p>
                          <p className="text-sm font-semibold text-white mt-1">
                            {item.question}
                          </p>
                        </div>

                        <span
                          className={`text-sm font-bold px-3 py-1 rounded-full border ${
                            item.score >= 70
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : item.score >= 40
                              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          }`}
                        >
                          {item.score}%
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <p className="text-xs text-slate-300 whitespace-pre-wrap">
                          {item.answer ? (
                            item.answer
                          ) : (
                            <span className="text-slate-500 italic">
                              No response recorded for this question.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-2">
                        <span>{item.wordCount || 0} words</span>

                        {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-500 text-[11px]">Keywords found:</span>
                            {item.matchedKeywords.map((kw, kwIdx) => (
                              <span
                                key={kwIdx}
                                className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={restartInterview}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                Start Another Interview
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE / ACTIVE INTERVIEW ROOM
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="mock-interview" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                AI Interactive Mock Interview Room
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Real-time webcam preview, speech-to-text response capture, and structured feedback.
              </p>
            </div>

            {!started && (
              <button
                onClick={startInterview}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Interview
              </button>
            )}
          </div>

          {/* SETUP SCREEN: CHOOSE INTERVIEW TYPE */}
          {!started && (
            <div className="max-w-4xl space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h2 className="text-base font-bold text-white">
                  Choose Interview Type
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select the practice track you want to prepare for.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {Object.keys(allInterviewQuestions).map((type) => (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={`p-5 rounded-xl border text-left transition ${
                        interviewType === type
                          ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                      }`}
                    >
                      <Sparkles
                        className={`w-5 h-5 ${
                          interviewType === type
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }`}
                      />
                      <p className="text-sm font-bold text-white mt-3">
                        {type === "Project" && projectMock?.projectTitle
                          ? "Project Defense"
                          : `${type} Interview`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {type === "Project" && projectMock?.projectTitle
                          ? projectMock.projectTitle
                          : `${allInterviewQuestions[type]?.length || 5} curated questions`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SYSTEM CAPABILITY / PERMISSIONS NOTICE */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
                <HelpCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">
                    System Readiness Checklist
                  </p>
                  <p>
                    Ensure your browser has webcam and microphone permissions enabled. Speech recognition works best on Google Chrome or Microsoft Edge. You can also type answers manually at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE INTERVIEW ROOM */}
          {started && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT & CENTER COLUMN */}
              <div className="lg:col-span-2 space-y-6">
                {/* WEBCAM PREVIEW */}
                <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">
                        <User className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300 mt-3">
                        Camera is off
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        {cameraError || "You can enable your camera or proceed with voice/text."}
                      </p>
                      <button
                        onClick={toggleCamera}
                        className="mt-4 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold px-3.5 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Turn Camera On
                      </button>
                    </div>
                  )}

                  {/* AI INTERVIEWER OVERLAY */}
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl flex items-center gap-3 w-64 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        AI Senior Interviewer
                      </h4>
                      <p className="text-[10px] text-indigo-400 flex items-center gap-1">
                        {isAnswering ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Listening to your response...
                          </>
                        ) : (
                          "Waiting for your answer"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* STATUS CHIPS & CONTROLS OVERLAY */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        cameraActive
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-slate-400 bg-slate-900/80 border-slate-700"
                      }`}
                    >
                      {cameraActive ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <VideoOff className="w-3.5 h-3.5" />
                      )}
                      {cameraActive ? "Camera On" : "Camera Off"}
                    </span>

                    <span
                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        isAnswering
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse"
                          : micActive
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-slate-400 bg-slate-900/80 border-slate-700"
                      }`}
                    >
                      {isAnswering || micActive ? (
                        <Mic className="w-3.5 h-3.5" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5" />
                      )}
                      {isAnswering
                        ? "Transcribing Voice..."
                        : micActive
                        ? "Mic Ready"
                        : "Mic Off"}
                    </span>
                  </div>

                  {/* CAMERA TOGGLE BUTTON */}
                  {cameraActive && (
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={toggleCamera}
                        className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        <VideoOff className="w-3.5 h-3.5" />
                        Turn Off Camera
                      </button>
                    </div>
                  )}
                </div>

                {/* HARDWARE / PERMISSION ERROR BANNER */}
                {(cameraError || micError) && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {cameraError && <p>{cameraError}</p>}
                      {micError && <p>{micError}</p>}
                    </div>
                  </div>
                )}

                {/* QUESTION & ANSWERING PANEL */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                  {/* QUESTION HEADER & NAVIGATION PILLS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Question {currentQuestion + 1} of {questions.length}
                      </span>

                      {/* Question progress pills */}
                      <div className="flex items-center gap-1.5 ml-2">
                        {questions.map((_, qIdx) => {
                          const isCurrent = qIdx === currentQuestion;
                          const hasAnswer =
                            (qIdx === currentQuestion && answer.trim().length > 0) ||
                            (answers[qIdx] && answers[qIdx].answer?.trim().length > 0);

                          return (
                            <button
                              key={qIdx}
                              onClick={() => handleJumpQuestion(qIdx)}
                              title={`Go to Question ${qIdx + 1}`}
                              className={`w-6 h-6 rounded-md text-[11px] font-bold transition flex items-center justify-center ${
                                isCurrent
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                  : hasAnswer
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono flex items-center gap-1.5 ${
                        timeLeft <= 30 ? "text-rose-400 font-bold animate-pulse" : "text-slate-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  {/* QUESTION TEXT */}
                  <h3 className="text-lg font-bold text-white leading-relaxed">
                    {questions[currentQuestion]?.question}
                  </h3>

                  {/* ANSWER TEXTAREA */}
                  <div className="space-y-2">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={
                        isAnswering
                          ? "Listening to your voice... Speak clearly into your microphone."
                          : "Type your answer here, or click 'Start Answering' to speak..."
                      }
                      className="w-full h-36 resize-none rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 p-4 outline-none focus:border-indigo-500 leading-relaxed transition"
                    />

                    {/* LIVE INTERIM TRANSCRIPT BADGE (TEMPORARY PREVIEW ONLY, NOT DUPLICATED) */}
                    {interimTranscript && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2 animate-pulse">
                        <Mic className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-indigo-200">Listening: </span>
                          <span className="italic">"{interimTranscript}"</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {answer.split(/\s+/).filter(Boolean).length} words
                      </span>
                      <span>
                        {answer.length} characters
                      </span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* LEFT CONTROLS: MIC & RETRY */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!isAnswering ? (
                        <button
                          onClick={startAnswering}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-indigo-600/20"
                        >
                          <Mic className="w-4 h-4" />
                          Start Answering
                        </button>
                      ) : (
                        <button
                          onClick={stopAnswering}
                          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-rose-600/20"
                        >
                          <MicOff className="w-4 h-4" />
                          Stop Answering
                        </button>
                      )}

                      <button
                        onClick={handleRetryCurrentAnswer}
                        disabled={!answer && !interimTranscript}
                        title="Clear current answer and try again"
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-700 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </div>

                    {/* RIGHT CONTROLS: PREVIOUS, NEXT, END */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={currentQuestion === 0}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-700 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-emerald-600/20"
                      >
                        {currentQuestion === questions.length - 1 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Finish Interview
                          </>
                        ) : (
                          <>
                            Next Question
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to end this interview session? Your progress will be saved.")) {
                            finishInterview();
                          }
                        }}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-700/80 transition"
                      >
                        <Square className="w-3.5 h-3.5" />
                        End Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR: ANALYTICS & STATUS */}
              <div className="space-y-6">
                {/* ANALYTICS CARD */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Interview Analytics
                  </h3>

                  {/* PERFORMANCE SCORE */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400">Current Performance</span>
                      <span className="text-indigo-400">
                        {answers.filter(Boolean).length > 0
                          ? Math.round(
                              answers.filter(Boolean).reduce((total, item) => total + item.score, 0) /
                                answers.filter(Boolean).length
                            )
                          : 0}
                        %
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            answers.filter(Boolean).length > 0
                              ? Math.round(
                                  answers.filter(Boolean).reduce((total, item) => total + item.score, 0) /
                                    answers.filter(Boolean).length
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400">Interview Progress</span>
                      <span className="text-emerald-400">
                        {Math.round(
                          ((currentQuestion + (answer.trim() ? 1 : 0)) / questions.length) * 100
                        )}
                        %
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((currentQuestion + (answer.trim() ? 1 : 0)) / questions.length) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* TYPE */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        Interview Track
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {interviewType}
                      </p>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                      {questions.length} Questions
                    </span>
                  </div>
                </div>

                {/* ANSWER STATUS CARD */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Response Status
                  </h3>

                  <div className="mt-4 space-y-3.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Word Count</span>
                      <span className="text-white font-semibold">
                        {answer.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Voice Transcription</span>
                      <span
                        className={
                          isAnswering
                            ? "text-rose-400 font-semibold flex items-center gap-1.5"
                            : "text-slate-500"
                        }
                      >
                        {isAnswering ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            Listening live
                          </>
                        ) : (
                          "Idle"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Speech API Support</span>
                      <span
                        className={
                          isSpeechSupported ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"
                        }
                      >
                        {isSpeechSupported ? "Supported" : "Manual Typing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
      <p className="text-xs uppercase font-bold text-slate-500">{title}</p>
      <p className="text-2xl font-extrabold text-white mt-2">{value}</p>
    </div>
  );
}
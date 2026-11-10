import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BlurDrop } from "@/components/ui/BlurDrop";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch, notifyStatsUpdated } from "@/lib/apiClient";
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
  Loader2,
  History,
  BarChart3,
  Briefcase,
  Layers,
  Send,
} from "lucide-react";

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
  const { user } = useAuth();
  const { isDark } = useTheme();
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

  const [questionBank, setQuestionBank] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);

  const loadInterviewData = useCallback(async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const [qRes, hRes] = await Promise.all([
        apiFetch("/api/interviews/questions"),
        apiFetch("/api/interviews/history"),
      ]);
      if (!qRes.ok) {
        throw new Error(`HTTP ${qRes.status}`);
      }
      const qData = await qRes.json();
      setQuestionBank(qData.questions_by_category || {});
      if (hRes.ok) {
        const hData = await hRes.json();
        setInterviewHistory(hData.history || []);
      }
    } catch (err) {
      console.error("Failed to load interview bank:", err);
      setQuestionsError("Unable to load interview question bank from database.");
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviewData();
  }, [loadInterviewData]);

  const allInterviewQuestions = useMemo(() => {
    const base = { ...questionBank };
    if (projectMock && projectMock.questions && projectMock.questions.length > 0) {
      base["Project"] = projectMock.questions;
    }
    return base;
  }, [questionBank, projectMock]);

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
  const [savedNotice, setSavedNotice] = useState(false);

  const questions =
    allInterviewQuestions[interviewType] || [];

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
    if (!micActive) {
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

  const handleSubmitCurrentAnswer = () => {
    stopSpeechRecognition();
    commitAnswerForQuestion(currentQuestion, answer);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleNext = () => {
    setSavedNotice(false);
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
      const res = await apiFetch("/api/interviews/complete", {
        method: "POST",
        body: JSON.stringify({
          category: interviewType,
          score: totalScore,
          average_words: averageWords,
          keyword_matches: keywordMatches,
          strengths,
          improvements,
          answers: completedAnswers,
          total_questions: questions.length,
          attempted_count: attempted.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setXpData(data);
        notifyStatsUpdated();
        loadInterviewData();
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
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
        <Sidebar activeRoute="mock-interview" />

        <div className="flex-1 flex flex-col min-w-0">
          <Header defaultCollapsed />

          <BlurDrop as="main" className="p-6 md:p-8 overflow-y-auto">
            <div className="w-full space-y-6">
              {/* HEADER */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E6FAF6] border border-[#16A34A]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] mt-4">
                  Interview Completed
                </h1>

                <p className="text-sm text-[#64748B] mt-1.5">
                  Here is your structured performance analysis and feedback.
                </p>

                {xpData && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-[#FFF8EE] border border-[#FFA116]/30 text-[#D97706] text-xs font-semibold px-3.5 py-1.5 rounded-full">
                    <Award className="w-4 h-4 text-[#FFA116]" />
                    <span>+{xpData.xp_earned || 100} XP Earned! Daily Streak: {xpData.streak || 1} day(s)</span>
                  </div>
                )}
              </div>

              {/* OVERALL SCORE */}
              <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#FFA116]" />

                <p className="text-xs uppercase tracking-wider font-semibold text-[#64748B]">
                  Overall Score
                </p>

                <div className={`text-6xl font-extrabold mt-2 ${results.score >= 70 ? 'text-[#16A34A]' : results.score >= 50 ? 'text-[#FFA116]' : 'text-[#DC2626]'}`}>
                  {results.score}%
                </div>

                <p className="text-sm text-[#64748B] mt-2 font-medium">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
                  <h3 className="text-sm font-bold text-[#16A34A] flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h3>

                  <ul className="space-y-2.5 text-sm text-[#262626]">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#16A34A] font-bold">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
                  <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Improve
                  </h3>

                  <ul className="space-y-2.5 text-sm text-[#262626]">
                    {results.improvements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#D97706] font-bold">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* QUESTION-BY-QUESTION ANALYSIS */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
                <h3 className="text-sm font-bold text-[#262626] mb-5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#FFA116]" />
                  Question-by-Question Analysis
                </h3>

                <div className="space-y-4">
                  {answers.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#FFA116] font-semibold uppercase tracking-wider">
                            Question {index + 1}
                          </p>
                          <p className="text-sm font-semibold text-[#262626] mt-0.5">
                            {item.question}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            item.score >= 70
                              ? "text-[#16A34A] bg-[#E6FAF6] border-[#16A34A]/20"
                              : item.score >= 40
                              ? "text-[#D97706] bg-[#FFF8EE] border-[#FFA116]/30"
                              : "text-[#DC2626] bg-[#FFEBEF] border-[#DC2626]/20"
                          }`}
                        >
                          {item.score}%
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB]">
                        <p className="text-xs text-[#262626] whitespace-pre-wrap leading-relaxed">
                          {item.answer ? (
                            item.answer
                          ) : (
                            <span className="text-[#64748B] italic">
                              No response recorded for this question.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-1 gap-2">
                        <span>{item.wordCount || 0} words</span>

                        {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[#64748B] text-[11px]">Keywords found:</span>
                            {item.matchedKeywords.map((kw, kwIdx) => (
                              <span
                                key={kwIdx}
                                className="px-2 py-0.5 rounded bg-[#E6FAF6] border border-[#16A34A]/20 text-[#16A34A] text-[10px] font-medium"
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
                className="w-full flex items-center justify-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Start Another Interview
              </button>
            </div>
          </BlurDrop>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE / ACTIVE INTERVIEW ROOM
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="mock-interview" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:pr-[124px] lg:pr-[132px]">
            <div>
              <h1 className="text-2xl font-extrabold text-[#262626]">
                AI Interactive Mock Interview Room
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Real-time webcam preview, speech-to-text response capture, and structured feedback.
              </p>
            </div>

            {!started && (
              <button
                onClick={startInterview}
                disabled={questionsLoading || questions.length === 0}
                className="flex items-center justify-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Interview
              </button>
            )}
          </div>

          {/* SETUP SCREEN: CHOOSE INTERVIEW TYPE */}
          {!started && (
            <div className="w-full space-y-6">
              {questionsError && !questionsLoading && (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/25 text-xs text-[#DC2626] flex items-center justify-between">
                  <span>{questionsError}</span>
                  <button
                    type="button"
                    onClick={loadInterviewData}
                    className="font-semibold underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
                <h2 className="text-base font-bold text-[#262626]">
                  Choose Interview Type
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Select the practice track loaded from the question bank.
                </p>

                {questionsLoading ? (
                  <div className="py-10 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFA116]" />
                    <span>Loading interview tracks from database...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {Object.keys(allInterviewQuestions).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInterviewType(type)}
                        className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                          interviewType === type
                            ? "border-[#FFA116] bg-[#FFF8EE] shadow-sm"
                            : "border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#FFA116]/60"
                        }`}
                      >
                        <Sparkles
                          className={`w-5 h-5 ${
                            interviewType === type
                              ? "text-[#FFA116]"
                              : "text-[#64748B]"
                          }`}
                        />
                        <p className="text-sm font-bold text-[#262626] mt-3">
                          {type === "Project" && projectMock?.projectTitle
                            ? "Project Defense"
                            : `${type} Interview`}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">
                          {type === "Project" && projectMock?.projectTitle
                            ? projectMock.projectTitle
                            : `${allInterviewQuestions[type]?.length || 0} curated questions`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {interviewHistory.length > 0 && (
                <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#262626] flex items-center gap-2">
                      <History className="w-4 h-4 text-[#FFA116]" />
                      Recent Interview Sessions
                    </h2>
                    <span className="text-[11px] text-[#64748B]">
                      {interviewHistory.length} completed
                    </span>
                  </div>
                  <div className="divide-y divide-[#F1F3F5]">
                    {interviewHistory.slice(0, 5).map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <span className="font-semibold text-[#262626]">{item.category} Interview</span>
                          <p className="text-[11px] text-[#64748B]">
                            {item.attempted_count || 0}/{item.total_questions || 0} answered · Avg {item.average_words || 0} words
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${item.score >= 70 ? "text-[#16A34A]" : "text-[#FFA116]"}`}>
                            {item.score}%
                          </span>
                          <p className="text-[10px] text-[#94A3B8]">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SYSTEM CAPABILITY / PERMISSIONS NOTICE */}
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm flex items-start gap-3 text-xs text-[#64748B]">
                <HelpCircle className="w-4 h-4 text-[#FFA116] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#262626]">
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
          {started && (() => {
            const currentQ = questions[currentQuestion] || {};
            const liveWords = answer.split(/\s+/).filter(Boolean).length;
            const completedQuestionsCount = questions.filter((_, idx) => {
              if (idx === currentQuestion) {
                return answer.trim().length > 0 || Boolean(answers[idx]?.answer?.trim());
              }
              return Boolean(answers[idx]?.answer?.trim());
            }).length;
            const completionPct = questions.length > 0
              ? Math.round((completedQuestionsCount / questions.length) * 100)
              : 0;
            const committedList = answers.filter((a) => a && a.answer && a.answer.trim().length > 0);
            const avgPerfScore = committedList.length > 0
              ? Math.round(committedList.reduce((acc, item) => acc + item.score, 0) / committedList.length)
              : 0;
            const avgCommittedWords = committedList.length > 0
              ? Math.round(committedList.reduce((acc, item) => acc + (item.wordCount || 0), 0) / committedList.length)
              : 0;
            const totalKeywordsMatched = committedList.reduce(
              (acc, item) => acc + (item.matchedKeywords?.length || 0),
              0
            );
            const remainingQuestionsCount = Math.max(0, questions.length - completedQuestionsCount);
            const currentStatusLabel = isAnswering
              ? "Recording Voice"
              : answers[currentQuestion]?.answer?.trim() || answer.trim()
              ? "Answered"
              : "In Progress";

            const ringSize = 96;
            const ringStroke = 8;
            const ringRadius = (ringSize - ringStroke) / 2;
            const ringCircumference = 2 * Math.PI * ringRadius;
            const ringOffset = ringCircumference - (completionPct / 100) * ringCircumference;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN (~68%): VIDEO WORKSPACE + QUESTION PANEL + ANSWER WORKSPACE */}
                <div className="lg:col-span-8 space-y-5 min-w-0">
                  {/* A. INTERVIEW VIDEO WORKSPACE */}
                  <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs overflow-hidden">
                    {/* Studio Control Header */}
                    <div className="px-4 sm:px-5 py-3 bg-[#F8FAFC] dark:bg-[#0D1117]/75 border-b border-[#E2E8F0] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          AI
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                              AI Senior Interviewer
                            </h3>
                            {isAnswering && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-[#DC2626] dark:text-[#F85149] text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                                REC
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] truncate">
                            {isAnswering
                              ? "Listening and transcribing your response..."
                              : "Session active — ready for your answer"}
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
                              : "bg-[#FFFFFF] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3]"
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
                              ? "bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626] dark:text-[#F85149]"
                              : micActive
                              ? "bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/25 text-[#16A34A] dark:text-[#3FB950]"
                              : "bg-[#FFFFFF] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3]"
                          }`}
                        >
                          {micActive || isAnswering ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                          <span>{isAnswering ? "Recording" : micActive ? "Mic Ready" : "Mic Muted"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Consistent 16:9 Video Stage */}
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
                            {cameraError || "Enable your webcam for a realistic mock interview or continue using voice and text input."}
                          </p>
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className="mt-4 inline-flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-xs text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Enable Camera
                          </button>
                        </div>
                      )}

                      {/* Bottom Overlay Strip Inside Video */}
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex items-center justify-between gap-2 pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-[11px] font-medium text-white">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isAnswering ? "bg-[#EF4444] animate-pulse" : cameraActive ? "bg-[#22C55E]" : "bg-slate-400"
                              }`}
                            />
                            {isAnswering ? "Voice Capture Active" : cameraActive ? "Live Video Feed" : "Audio / Text Mode"}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-white/85 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15">
                          {interviewType} Track
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

                  {/* B. INTERVIEW QUESTION PANEL + C. ANSWER WORKSPACE */}
                  <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs p-5 sm:p-6 space-y-6">
                    {/* Question Header Metadata + Countdown Timer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#B45309] dark:text-[#FBBF24] text-xs font-bold tabular-nums">
                          Question {currentQuestion + 1} of {questions.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          {interviewType}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-medium text-[#64748B] dark:text-[#8B949E]">
                          {currentQ.difficulty || "Standard"}
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tabular-nums self-start sm:self-auto ${
                          timeLeft <= 30
                            ? "bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626] dark:text-[#F85149] animate-pulse"
                            : "bg-[#F8FAFC] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#1E293B] dark:text-[#E6EDF3]"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    </div>

                    {/* Visual Step-Based Question Progress Indicator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B] dark:text-[#8B949E]">
                        <span>Question Stepper</span>
                        <span>Click any step to review or jump</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {questions.map((_, qIdx) => {
                          const isCurrent = qIdx === currentQuestion;
                          const hasAnswer =
                            (qIdx === currentQuestion && answer.trim().length > 0) ||
                            Boolean(answers[qIdx] && answers[qIdx].answer?.trim().length > 0);

                          return (
                            <React.Fragment key={qIdx}>
                              <button
                                type="button"
                                onClick={() => handleJumpQuestion(qIdx)}
                                title={`Question ${qIdx + 1}`}
                                aria-label={`Jump to Question ${qIdx + 1}`}
                                className={`h-8 min-w-[36px] px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                                  isCurrent
                                    ? "bg-[#F59E0B] text-white ring-2 ring-[#F59E0B]/30 shadow-xs"
                                    : hasAnswer
                                    ? "bg-[#F0FDF4] dark:bg-[#16A34A]/15 text-[#16A34A] dark:text-[#3FB950] border border-[#16A34A]/30"
                                    : "bg-[#F8FAFC] dark:bg-[#21262D] text-[#64748B] dark:text-[#8B949E] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B]/50"
                                }`}
                              >
                                {hasAnswer && !isCurrent && <CheckCircle2 className="w-3 h-3" />}
                                <span>{qIdx + 1}</span>
                              </button>
                              {qIdx < questions.length - 1 && (
                                <div
                                  className={`h-0.5 flex-1 min-w-[12px] rounded-full transition-colors ${
                                    hasAnswer ? "bg-[#16A34A]/50" : "bg-[#E2E8F0] dark:bg-[#30363D]"
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prominent Current Question Box */}
                    <div
                      key={currentQuestion}
                      className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] p-5 transition-all duration-200"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] mb-2">
                        Interviewer Prompt
                      </p>
                      <h3 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                        {currentQ.question}
                      </h3>
                    </div>

                    {/* C. ANSWER WORKSPACE */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="interview-answer-editor"
                          className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Your Response</span>
                        </label>

                        <div className="flex items-center gap-2 text-[11px]">
                          {isAnswering ? (
                            <span className="inline-flex items-center gap-1.5 text-[#DC2626] dark:text-[#F85149] font-semibold">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                              Recording &amp; Transcribing Live
                            </span>
                          ) : (
                            <span className="text-[#64748B] dark:text-[#8B949E]">
                              {isSpeechSupported
                                ? "Use voice capture or type manually"
                                : "Manual typing workspace"}
                            </span>
                          )}
                        </div>
                      </div>

                      <textarea
                        id="interview-answer-editor"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={
                          isAnswering
                            ? "Listening to your microphone... Speak naturally and structure your answer clearly."
                            : "Type your response clearly here, or click 'Start Answering' below to dictate via microphone..."
                        }
                        className="w-full min-h-[180px] resize-y rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/80 border border-[#E2E8F0] dark:border-[#30363D] text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] p-4 outline-none focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-[#0D1117] focus:ring-2 focus:ring-[#F59E0B]/15 leading-relaxed transition"
                      />

                      {interimTranscript && (
                        <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs text-[#B45309] dark:text-[#FBBF24] flex items-start gap-2.5">
                          <Mic className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                              Live Transcript:{' '}
                            </span>
                            <span className="italic">"{interimTranscript}"</span>
                          </div>
                        </div>
                      )}

                      {/* Word count & saved confirmation bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#8B949E] pt-0.5 tabular-nums">
                        <div className="flex items-center gap-3">
                          <span>
                            <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{liveWords}</strong> words
                          </span>
                          <span>•</span>
                          <span>{answer.length} characters</span>
                        </div>
                        {savedNotice && (
                          <span className="inline-flex items-center gap-1 text-[#16A34A] dark:text-[#3FB950] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Answer saved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls Toolbar */}
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3">
                      {/* Voice & Retry */}
                      <div className="flex flex-wrap items-center gap-2">
                        {!isAnswering ? (
                          <button
                            type="button"
                            onClick={startAnswering}
                            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            <span>Start Answering</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopAnswering}
                            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <MicOff className="w-4 h-4" />
                            <span>Stop Recording</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleRetryCurrentAnswer}
                          disabled={!answer && !interimTranscript}
                          title="Clear current answer and try again"
                          className="inline-flex items-center gap-1.5 bg-[#F8FAFC] dark:bg-[#21262D] hover:bg-[#F1F5F9] dark:hover:bg-[#30363D] disabled:opacity-40 text-[#1E293B] dark:text-[#E6EDF3] text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Navigation & Submit */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrev}
                          disabled={currentQuestion === 0}
                          className="inline-flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#21262D] hover:bg-[#F1F5F9] dark:hover:bg-[#30363D] disabled:opacity-35 text-[#1E293B] dark:text-[#E6EDF3] text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#64748B]" />
                          <span>Previous</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmitCurrentAnswer}
                          disabled={!answer.trim()}
                          className="inline-flex items-center gap-1.5 bg-[#FFFFFF] dark:bg-[#21262D] hover:bg-[#FFFBEB] dark:hover:bg-[#F59E0B]/15 disabled:opacity-40 text-[#1E293B] dark:text-[#E6EDF3] hover:text-[#D97706] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B]/50 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Submit Answer</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          {currentQuestion === questions.length - 1 ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Finish Interview</span>
                            </>
                          ) : (
                            <>
                              <span>Next Question</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to end this interview session? Your progress will be saved.")) {
                              finishInterview();
                            }
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#FFFFFF] dark:bg-[#161B22] hover:bg-[#FEF2F2] dark:hover:bg-[#F85149]/15 text-[#64748B] dark:text-[#8B949E] hover:text-[#DC2626] dark:hover:text-[#F85149] text-xs font-medium px-3 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] transition cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>End</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN (~32%): PROGRESS, ANALYTICS, SESSION INFO & RESPONSE STATUS */}
                <aside className="lg:col-span-4 space-y-5 min-w-0">
                  {/* A. INTERVIEW PROGRESS */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                        Interview Progress
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isAnswering
                            ? "bg-[#FEF2F2] dark:bg-[#F85149]/15 text-[#DC2626] dark:text-[#F85149] border-[#DC2626]/25"
                            : currentStatusLabel === "Answered"
                            ? "bg-[#F0FDF4] dark:bg-[#16A34A]/15 text-[#16A34A] dark:text-[#3FB950] border-[#16A34A]/25"
                            : "bg-[#FFFBEB] dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24] border-[#F59E0B]/25"
                        }`}
                      >
                        {currentStatusLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                        <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="-rotate-90" aria-hidden="true">
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums leading-none">
                            {completionPct}%
                          </span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#8B949E] mt-1">
                            Done
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1 min-w-0 text-xs">
                        <div>
                          <span className="text-[#64748B] dark:text-[#8B949E] block text-[11px]">
                            Questions Completed
                          </span>
                          <span className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                            {completedQuestionsCount} / {questions.length}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* B. PERFORMANCE ANALYTICS (REAL EVALUATED DATA ONLY) */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Performance Analytics</span>
                      </h3>
                      <span className="text-[11px] font-medium text-[#64748B] dark:text-[#8B949E] tabular-nums">
                        {committedList.length} evaluated
                      </span>
                    </div>

                    {committedList.length === 0 ? (
                      <p className="text-xs text-[#64748B] dark:text-[#8B949E] bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl p-3.5 leading-relaxed">
                        Submit your first answer to view live evaluation metrics across answer quality and technical keyword coverage.
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs tabular-nums">
                            <span className="text-[#64748B] dark:text-[#8B949E] font-medium">
                              Answer Quality Score
                            </span>
                            <span className="font-bold text-[#F59E0B]">{avgPerfScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
                              style={{ width: `${avgPerfScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs tabular-nums">
                            <span className="text-[#64748B] dark:text-[#8B949E] font-medium">
                              Communication Depth
                            </span>
                            <span className="font-bold text-[#16A34A] dark:text-[#3FB950]">
                              {avgCommittedWords} avg words
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((avgCommittedWords / 60) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-between text-xs tabular-nums">
                          <span className="text-[#64748B] dark:text-[#8B949E]">Keywords Matched</span>
                          <span className="font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                            {totalKeywordsMatched} matched
                          </span>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* C. SESSION INFORMATION */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Session Information</span>
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Category</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          {interviewType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Target Role</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] truncate max-w-[160px]">
                          {projectMock?.projectTitle || user?.target_role || "Software Engineer"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Difficulty</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          {currentQ.difficulty || "Standard"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 tabular-nums">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Duration / Question</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          03:00 ({formatTime(timeLeft)} left)
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 tabular-nums">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Remaining Questions</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          {remainingQuestionsCount}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* D. RESPONSE STATUS */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Response Status</span>
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-3 tabular-nums">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Word Count</span>
                        <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          {liveWords} words
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Voice Transcription</span>
                        <span
                          className={
                            isAnswering
                              ? "text-[#DC2626] dark:text-[#F85149] font-semibold inline-flex items-center gap-1.5"
                              : isSpeechSupported
                              ? "text-[#16A34A] dark:text-[#3FB950] font-medium"
                              : "text-[#D97706] font-medium"
                          }
                        >
                          {isAnswering ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                              Listening Live
                            </>
                          ) : isSpeechSupported ? (
                            "Ready"
                          ) : (
                            "Manual Typing"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Microphone</span>
                        <span
                          className={`font-semibold ${
                            isAnswering
                              ? "text-[#DC2626] dark:text-[#F85149]"
                              : micActive
                              ? "text-[#16A34A] dark:text-[#3FB950]"
                              : "text-[#64748B] dark:text-[#8B949E]"
                          }`}
                        >
                          {isAnswering ? "Recording" : micActive ? "Connected" : "Muted / Off"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] dark:text-[#8B949E]">Camera</span>
                        <span
                          className={`font-semibold ${
                            cameraActive
                              ? "text-[#16A34A] dark:text-[#3FB950]"
                              : "text-[#64748B] dark:text-[#8B949E]"
                          }`}
                        >
                          {cameraActive ? "Active" : "Off"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* E. QUESTION QUEUE (FILLS RIGHT WORKSPACE BALANCED WITH LEFT COLUMN) */}
                  <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                        Question Queue
                      </h3>
                      <span className="text-[11px] text-[#64748B] dark:text-[#8B949E] tabular-nums">
                        {questions.length} total
                      </span>
                    </div>

                    <div className="space-y-2">
                      {questions.map((qItem, qIdx) => {
                        const isCurrent = qIdx === currentQuestion;
                        const committed = answers[qIdx];
                        const hasText =
                          (isCurrent && answer.trim().length > 0) ||
                          Boolean(committed?.answer?.trim().length > 0);
                        const qWords = isCurrent
                          ? liveWords
                          : committed?.wordCount || 0;

                        return (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleJumpQuestion(qIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                              isCurrent
                                ? "bg-[#FFFBEB] dark:bg-[#F59E0B]/12 border-[#F59E0B]/50"
                                : hasText
                                ? "bg-[#F0FDF4]/60 dark:bg-[#16A34A]/10 border-[#16A34A]/25 hover:border-[#16A34A]/50"
                                : "bg-[#F8FAFC] dark:bg-[#0D1117]/60 border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B]/40"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                isCurrent
                                  ? "bg-[#F59E0B] text-white"
                                  : hasText
                                  ? "bg-[#16A34A] text-white"
                                  : "bg-[#E2E8F0] dark:bg-[#21262D] text-[#64748B] dark:text-[#8B949E]"
                              }`}
                            >
                              {hasText && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : qIdx + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-[#1E293B] dark:text-[#E6EDF3] line-clamp-1">
                                {qItem.question}
                              </p>
                              <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-[#64748B] dark:text-[#8B949E] tabular-nums">
                                <span>{qItem.difficulty || "Standard"}</span>
                                <span
                                  className={
                                    isCurrent
                                      ? "font-semibold text-[#D97706] dark:text-[#FBBF24]"
                                      : hasText
                                      ? "font-semibold text-[#16A34A] dark:text-[#3FB950]"
                                      : ""
                                  }
                                >
                                  {isCurrent
                                    ? "Current"
                                    : hasText
                                    ? `${qWords} words`
                                    : "Pending"}
                                </span>
                              </div>
                            </div>
                          </button>
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

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value }) {
  return (
    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
      <p className="text-xs uppercase font-semibold text-[#64748B]">{title}</p>
      <p className="text-2xl font-extrabold text-[#262626] mt-1">{value}</p>
    </div>
  );
}

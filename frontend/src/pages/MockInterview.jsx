import React, { useEffect, useRef, useState } from "react";
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
  Clock,
  MessageSquare,
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
   MAIN COMPONENT
========================================================= */

export default function MockInterviewPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const [interviewType, setInterviewType] =
    useState("Technical");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answer, setAnswer] = useState("");

  const [answers, setAnswers] = useState([]);

  const [isAnswering, setIsAnswering] =
    useState(false);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [micActive, setMicActive] =
    useState(false);

  const [timeLeft, setTimeLeft] = useState(180);

  const [results, setResults] = useState(null);

  const questions =
    INTERVIEW_QUESTIONS[interviewType];

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (
      !started ||
      finished ||
      !isAnswering
    ) {
      return;
    }

    if (timeLeft <= 0) {
      submitAnswer();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    started,
    finished,
    isAnswering,
    timeLeft,
  ]);

  /* =======================================================
     CAMERA VIDEO ATTACHMENT FIX
  ======================================================= */

  useEffect(() => {
    if (
      cameraActive &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((error) => {
          console.log(
            "Video autoplay error:",
            error
          );
        });
    }
  }, [cameraActive, started]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      stopCamera();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, []);

  /* =======================================================
     FORMAT TIMER
  ======================================================= */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  /* =======================================================
     START CAMERA + MICROPHONE
  ======================================================= */

  const startCamera = async () => {
    try {
      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        alert(
          "Camera and microphone are not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: true,
          }
        );

      streamRef.current = stream;

      setCameraActive(true);
      setMicActive(true);
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      if (
        error.name === "NotAllowedError"
      ) {
        alert(
          "Camera/Microphone permission was denied. Please allow camera and microphone access in your browser."
        );
      } else if (
        error.name === "NotFoundError"
      ) {
        alert(
          "No camera or microphone was found on this device."
        );
      } else {
        alert(
          `Unable to access camera/microphone: ${error.message}`
        );
      }
    }
  };

  /* =======================================================
     STOP CAMERA
  ======================================================= */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setMicActive(false);
  };

  /* =======================================================
     START SPEECH RECOGNITION
  ======================================================= */

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(error);
      }
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log(
        "Speech recognition started"
      );

      setIsAnswering(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      if (transcript.trim()) {
        setAnswer((previous) => {
          const existing =
            previous.trim();

          if (!existing) {
            return transcript.trim();
          }

          return `${existing} ${transcript.trim()}`;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error === "not-allowed"
      ) {
        alert(
          "Microphone permission was denied. Please allow microphone access."
        );
      }

      if (
        event.error === "no-speech"
      ) {
        console.log(
          "No speech detected."
        );
      }
    };

    recognition.onend = () => {
      console.log(
        "Speech recognition ended"
      );
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error
      );
    }
  };

  /* =======================================================
     STOP SPEECH RECOGNITION
  ======================================================= */

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(error);
      }

      recognitionRef.current = null;
    }

    setIsAnswering(false);
  };

  /* =======================================================
     START INTERVIEW
  ======================================================= */

  const startInterview = async () => {
    setStarted(true);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setAnswer("");
    setResults(null);
    setTimeLeft(180);

    await startCamera();
  };

  /* =======================================================
     START ANSWERING
  ======================================================= */

  const startAnswering = () => {
    setTimeLeft(180);

    startSpeechRecognition();
  };

  /* =======================================================
     STOP ANSWERING
  ======================================================= */

  const stopAnswering = () => {
    stopSpeechRecognition();
  };

  /* =======================================================
     EVALUATE ANSWER
  ======================================================= */

  const evaluateAnswer = (
    answerText,
    question
  ) => {
    const normalizedAnswer =
      answerText.toLowerCase();

    const words =
      normalizedAnswer
        .split(/\s+/)
        .filter(Boolean);

    const wordCount =
      words.length;

    const matchedKeywords =
      question.keywords.filter(
        (keyword) =>
          normalizedAnswer.includes(
            keyword.toLowerCase()
          )
      );

    const keywordScore =
      question.keywords.length > 0
        ? Math.round(
            (matchedKeywords.length /
              question.keywords.length) *
              50
          )
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
      answerText.includes(".") ||
      answerText.includes(",")
        ? 20
        : 10;

    const score = Math.min(
      100,
      keywordScore +
        lengthScore +
        structureScore
    );

    return {
      score,
      wordCount,
      matchedKeywords,
    };
  };

  /* =======================================================
     SUBMIT ANSWER
  ======================================================= */

  const submitAnswer = () => {
    stopAnswering();

    const question =
      questions[currentQuestion];

    const evaluation =
      evaluateAnswer(
        answer,
        question
      );

    const newAnswer = {
      question:
        question.question,

      answer,

      score:
        evaluation.score,

      wordCount:
        evaluation.wordCount,

      matchedKeywords:
        evaluation.matchedKeywords,
    };

    const updatedAnswers = [
      ...answers,
      newAnswer,
    ];

    setAnswers(updatedAnswers);

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );

      setAnswer("");
      setTimeLeft(180);
    } else {
      finishInterview(
        updatedAnswers
      );
    }
  };

  /* =======================================================
     FINISH INTERVIEW
  ======================================================= */

  const finishInterview = (
    completedAnswers
  ) => {
    stopCamera();
    stopSpeechRecognition();

    const totalScore =
      completedAnswers.length > 0
        ? Math.round(
            completedAnswers.reduce(
              (total, item) =>
                total + item.score,
              0
            ) /
              completedAnswers.length
          )
        : 0;

    const strengths = [];

    const improvements = [];

    const averageWords =
      completedAnswers.length > 0
        ? Math.round(
            completedAnswers.reduce(
              (total, item) =>
                total +
                item.wordCount,
              0
            ) /
              completedAnswers.length
          )
        : 0;

    if (totalScore >= 75) {
      strengths.push(
        "Strong overall interview performance."
      );
    }

    if (averageWords >= 50) {
      strengths.push(
        "Answers contain reasonable detail."
      );
    } else {
      improvements.push(
        "Try to provide more detailed answers."
      );
    }

    const keywordMatches =
      completedAnswers.reduce(
        (total, item) =>
          total +
          item.matchedKeywords
            .length,
        0
      );

    if (keywordMatches >= 10) {
      strengths.push(
        "Good use of relevant interview terminology."
      );
    } else {
      improvements.push(
        "Use more relevant technical or role-specific terminology."
      );
    }

    if (totalScore < 60) {
      improvements.push(
        "Practice structuring answers before speaking."
      );
    }

    if (totalScore >= 80) {
      strengths.push(
        "Your answers show good confidence and structure."
      );
    }

    if (
      improvements.length === 0
    ) {
      improvements.push(
        "Continue practicing to make your answers more concise and impactful."
      );
    }

    setResults({
      score: totalScore,
      strengths,
      improvements,
      averageWords,
    });

    setFinished(true);
    setStarted(false);
    setIsAnswering(false);
  };

  /* =======================================================
     RESTART INTERVIEW
  ======================================================= */

  const restartInterview = () => {
    stopCamera();
    stopSpeechRecognition();

    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setResults(null);
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

              <div className="text-center">

                <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <h1 className="text-3xl font-extrabold text-white mt-5">
                  Interview Completed
                </h1>

                <p className="text-sm text-slate-400 mt-2">
                  Here's your performance report.
                </p>

              </div>

              {/* SCORE */}

              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">

                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Overall Score
                </p>

                <div className="text-7xl font-extrabold text-indigo-400 mt-3">
                  {results.score}%
                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {results.score >= 80
                    ? "Excellent performance"
                    : results.score >= 65
                    ? "Good performance"
                    : results.score >= 50
                    ? "Needs improvement"
                    : "Keep practicing"}
                </p>

              </div>

              {/* SUMMARY */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <StatCard
                  title="Questions"
                  value={answers.length}
                />

                <StatCard
                  title="Average Words"
                  value={results.averageWords}
                />

                <StatCard
                  title="Interview Type"
                  value={interviewType}
                />

              </div>

              {/* STRENGTHS / IMPROVEMENTS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h3>

                  <ul className="space-y-3 text-sm text-slate-300">

                    {results.strengths.map(
                      (strength, index) => (
                        <li
                          key={index}
                          className="flex gap-2"
                        >
                          <span className="text-emerald-400">
                            ✓
                          </span>

                          {strength}
                        </li>
                      )
                    )}

                  </ul>

                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Improve
                  </h3>

                  <ul className="space-y-3 text-sm text-slate-300">

                    {results.improvements.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex gap-2"
                        >
                          <span className="text-amber-400">
                            !
                          </span>

                          {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>

              </div>

              {/* QUESTION RESULTS */}

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                <h3 className="text-sm font-bold text-white mb-5">
                  Question-by-Question Analysis
                </h3>

                <div className="space-y-4">

                  {answers.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-xs text-indigo-400 font-bold">
                              Question{" "}
                              {index + 1}
                            </p>

                            <p className="text-sm font-semibold text-white mt-1">
                              {item.question}
                            </p>

                          </div>

                          <span className="text-sm font-bold text-emerald-400">
                            {item.score}%
                          </span>

                        </div>

                        <p className="text-xs text-slate-400 mt-3">
                          {item.answer ||
                            "No answer provided."}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

              <button
                onClick={
                  restartInterview
                }
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition"
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
     MAIN PAGE
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

      <Sidebar activeRoute="mock-interview" />

      <div className="flex-1 flex flex-col min-w-0">

        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <h1 className="text-2xl font-extrabold text-white">
                AI Interactive Mock Interview Room
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Practice technical, HR and behavioral interviews.
              </p>

            </div>

            {!started && (
              <button
                onClick={
                  startInterview
                }
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
              >
                <Play className="w-4 h-4 fill-white" />

                Start Interview
              </button>
            )}

          </div>

          {/* INTERVIEW TYPE */}

          {!started && (
            <div className="max-w-3xl">

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                <h2 className="text-base font-bold text-white">
                  Choose Interview Type
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Select the type of interview you want to practice.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                  {Object.keys(
                    INTERVIEW_QUESTIONS
                  ).map((type) => (

                    <button
                      key={type}
                      onClick={() =>
                        setInterviewType(
                          type
                        )
                      }
                      className={`p-5 rounded-xl border text-left transition ${
                        interviewType ===
                        type
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                      }`}
                    >

                      <Sparkles
                        className={`w-5 h-5 ${
                          interviewType ===
                          type
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }`}
                      />

                      <p className="text-sm font-bold text-white mt-3">
                        {type}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        5 questions
                      </p>

                    </button>

                  ))}

                </div>

              </div>

            </div>
          )}

          {/* INTERVIEW ROOM */}

          {started && (

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT SIDE */}

              <div className="lg:col-span-2 space-y-6">

                {/* CAMERA */}

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

                    <div className="text-center">

                      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">

                        <User className="w-8 h-8" />

                      </div>

                      <p className="text-sm font-semibold text-slate-300 mt-3">
                        Camera is off
                      </p>

                    </div>

                  )}

                  {/* AI INTERVIEWER */}

                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl flex items-center gap-3 w-64 shadow-lg">

                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      AI
                    </div>

                    <div>

                      <h4 className="text-xs font-bold text-slate-200">
                        AI Senior Interviewer
                      </h4>

                      <p className="text-[10px] text-indigo-400">

                        {isAnswering
                          ? "Listening to your response..."
                          : "Waiting for your answer"}

                      </p>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="absolute bottom-4 left-4 flex gap-2">

                    <span
                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        cameraActive
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                      }`}
                    >

                      {cameraActive ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <VideoOff className="w-3.5 h-3.5" />
                      )}

                      {cameraActive
                        ? "Camera Active"
                        : "Camera Off"}

                    </span>

                    <span
                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        micActive
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                      }`}
                    >

                      {micActive ? (
                        <Mic className="w-3.5 h-3.5" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5" />
                      )}

                      {micActive
                        ? "Mic Active"
                        : "Mic Off"}

                    </span>

                  </div>

                </div>

                {/* QUESTION PANEL */}

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">

                      Question{" "}
                      {currentQuestion +
                        1}{" "}
                      of{" "}
                      {questions.length}

                    </span>

                    <span
                      className={`text-xs font-mono flex items-center gap-1 ${
                        timeLeft <= 30
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >

                      <Clock className="w-3.5 h-3.5" />

                      {formatTime(
                        timeLeft
                      )}

                    </span>

                  </div>

                  <h3 className="text-lg font-bold text-white leading-relaxed">

                    {questions[
                      currentQuestion
                    ].question}

                  </h3>

                  {/* ANSWER BOX */}

                  <div>

                    <textarea
                      value={answer}
                      onChange={(e) =>
                        setAnswer(
                          e.target.value
                        )
                      }
                      placeholder={
                        isAnswering
                          ? "Speak your answer. It will appear here automatically..."
                          : "You can type your answer here..."
                      }
                      className="w-full h-32 resize-none rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 p-4 outline-none focus:border-indigo-500"
                    />

                    <div className="text-[11px] text-slate-500 mt-2">
                      {
                        answer
                          .split(
                            /\s+/
                          )
                          .filter(
                            Boolean
                          ).length
                      }{" "}
                      words
                    </div>

                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-wrap items-center gap-3">

                    {!isAnswering ? (

                      <button
                        onClick={
                          startAnswering
                        }
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                      >

                        <Mic className="w-4 h-4" />

                        Start Answering

                      </button>

                    ) : (

                      <button
                        onClick={
                          stopAnswering
                        }
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                      >

                        <MicOff className="w-4 h-4" />

                        Stop Answering

                      </button>

                    )}

                    <button
                      onClick={
                        submitAnswer
                      }
                      disabled={
                        !answer.trim()
                      }
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                    >

                      {currentQuestion ===
                      questions.length -
                        1 ? (
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
                        stopCamera();
                        stopAnswering();
                        setStarted(false);
                      }}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                    >

                      <Square className="w-4 h-4" />

                      End Session

                    </button>

                  </div>

                </div>

              </div>

              {/* RIGHT SIDE */}

              <div className="space-y-6">

                {/* ANALYTICS */}

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">

                  <h3 className="text-base font-bold text-white flex items-center gap-2">

                    <Sparkles className="w-4 h-4 text-indigo-400" />

                    Interview Analytics

                  </h3>

                  {/* PERFORMANCE */}

                  <div>

                    <div className="flex justify-between text-xs font-semibold mb-2">

                      <span className="text-slate-400">
                        Current Performance
                      </span>

                      <span className="text-indigo-400">

                        {answers.length > 0
                          ? Math.round(
                              answers.reduce(
                                (
                                  total,
                                  item
                                ) =>
                                  total +
                                  item.score,
                                0
                              ) /
                                answers.length
                            )
                          : 0}
                        %

                      </span>

                    </div>

                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">

                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                        style={{
                          width: `${
                            answers.length >
                            0
                              ? Math.round(
                                  answers.reduce(
                                    (
                                      total,
                                      item
                                    ) =>
                                      total +
                                      item.score,
                                    0
                                  ) /
                                    answers.length
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

                      <span className="text-slate-400">
                        Interview Progress
                      </span>

                      <span className="text-emerald-400">

                        {Math.round(
                          (answers.length /
                            questions.length) *
                            100
                        )}
                        %

                      </span>

                    </div>

                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">

                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{
                          width: `${
                            (answers.length /
                              questions.length) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* TYPE */}

                  <div className="pt-4 border-t border-slate-800">

                    <p className="text-[10px] uppercase font-bold text-slate-500">
                      Interview Type
                    </p>

                    <p className="text-sm font-bold text-white mt-1">
                      {interviewType}
                    </p>

                  </div>

                </div>

                {/* ANSWER STATUS */}

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                  <h3 className="text-sm font-bold text-white flex items-center gap-2">

                    <MessageSquare className="w-4 h-4 text-indigo-400" />

                    Answer Status

                  </h3>

                  <div className="mt-4 space-y-3">

                    <div className="flex justify-between text-xs">

                      <span className="text-slate-400">
                        Answer length
                      </span>

                      <span className="text-white font-semibold">

                        {
                          answer
                            .split(
                              /\s+/
                            )
                            .filter(
                              Boolean
                            ).length
                        }{" "}
                        words

                      </span>

                    </div>

                    <div className="flex justify-between text-xs">

                      <span className="text-slate-400">
                        Recording
                      </span>

                      <span
                        className={
                          isAnswering
                            ? "text-rose-400"
                            : "text-slate-500"
                        }
                      >

                        {isAnswering
                          ? "Listening..."
                          : "Not recording"}

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

function StatCard({
  title,
  value,
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <p className="text-xs uppercase font-bold text-slate-500">
        {title}
      </p>

      <p className="text-2xl font-extrabold text-white mt-2">
        {value}
      </p>

    </div>
  );
}
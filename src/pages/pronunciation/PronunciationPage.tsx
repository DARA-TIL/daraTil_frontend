import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useTranslation } from "react-i18next";
import { useSpeechTestStore } from "@/features/speechTest/store/useSpeechTestStore";
import {
  formatRecordingDuration,
  getSpeechDifficultyColor,
  getSpeechDifficultyLabel,
  getSpeechSessionAccuracy,
  getSpeechTextForLanguage,
} from "@/features/speechTest/model/presentation";

const MAX_RECORDING_SECONDS = 90;

const PronunciationPage: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("pronunciation");

  const session = useSpeechTestStore((state) => state.session);
  const currentTest = useSpeechTestStore((state) => state.currentTest);
  const checkResult = useSpeechTestStore((state) => state.checkResult);
  const finalResult = useSpeechTestStore((state) => state.finalResult);
  const step = useSpeechTestStore((state) => state.step);
  const loading = useSpeechTestStore((state) => state.loading);
  const checking = useSpeechTestStore((state) => state.checking);
  const ending = useSpeechTestStore((state) => state.ending);
  const startSession = useSpeechTestStore((state) => state.startSession);
  const loadNextTest = useSpeechTestStore((state) => state.loadNextTest);
  const setRecorded = useSpeechTestStore((state) => state.setRecorded);
  const resetRecordingState = useSpeechTestStore(
    (state) => state.resetRecordingState,
  );
  const checkPronounce = useSpeechTestStore((state) => state.checkPronounce);
  const endSession = useSpeechTestStore((state) => state.endSession);
  const reset = useSpeechTestStore((state) => state.reset);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const attemptsCount = session?.speech_tests.length ?? 0;
  const accuracy = getSpeechSessionAccuracy(
    session?.correct_count ?? 0,
    attemptsCount,
  );
  const localizedTranslation = getSpeechTextForLanguage(currentTest, i18n.language);
  const canCheck = Boolean(currentTest && audioBlob && !checking && !checkResult);

  const recorderSupported = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== "undefined",
    [],
  );

  useEffect(() => {
    return () => {
      stopTimers();
      cleanupStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function stopTimers() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function resetAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    resetRecordingState();
  }

  async function handleStartPractice() {
    resetAudio();
    await startSession();
  }

  async function handleStartRecording() {
    if (!recorderSupported) {
      setRecordingError(
        t("recording.unsupported", {
          defaultValue: "Audio recording is not supported in this browser.",
        }),
      );
      return;
    }

    try {
      resetAudio();
      setRecordingError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopTimers();
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setRecorded();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((current) =>
          Math.min(MAX_RECORDING_SECONDS, current + 1),
        );
      }, 1000);

      autoStopRef.current = window.setTimeout(() => {
        handleStopRecording();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      cleanupStream();
      setIsRecording(false);
      setRecordingError(
        t("recording.permissionError", {
          defaultValue:
            "Microphone access failed. Allow microphone permission and try again.",
        }),
      );
    }
  }

  function handleStopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }
    stopTimers();
    cleanupStream();
    setIsRecording(false);
  }

  async function handleCheck() {
    if (!audioBlob) return;
    await checkPronounce(audioBlob);
  }

  async function handleNext() {
    resetAudio();
    await loadNextTest();
  }

  async function handleFinish() {
    handleStopRecording();
    resetAudio();
    await endSession();
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 1.5, pb: 3 }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            overflow: "hidden",
            position: "relative",
            backgroundImage:
              "radial-gradient(circle at 88% 18%, rgba(14,165,233,0.28), transparent 24%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.34), rgba(76,29,149,0.52))",
            color: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack spacing={1} sx={{ maxWidth: 820 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <GraphicEqRoundedIcon />
                <Typography variant="h4" fontWeight={900}>
                  {t("page.title", { defaultValue: "Pronunciation practice" })}
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.86 }}>
                {t("page.subtitle", {
                  defaultValue:
                    "Read the Kazakh phrase aloud, record your voice, and get AI feedback on pronunciation.",
                })}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowRoundedIcon />}
                disabled={loading || isRecording}
                onClick={handleStartPractice}
                sx={{
                  bgcolor: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
                }}
              >
                {session
                  ? t("actions.restart", { defaultValue: "Restart practice" })
                  : t("actions.start", { defaultValue: "Start practice" })}
              </Button>

              {session && !session.is_ended ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={ending ? <CircularProgress size={18} /> : <EmojiEventsRoundedIcon />}
                  disabled={ending || isRecording}
                  onClick={handleFinish}
                  sx={{
                    borderColor: "rgba(255,255,255,0.34)",
                    color: "#fff",
                  }}
                >
                  {t("actions.finish", { defaultValue: "Finish session" })}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>

        {finalResult ? (
          <Paper
            sx={{
              p: { xs: 2, md: 2.6 },
              border: "1px solid",
              borderColor: theme.palette.success.main,
              backgroundImage:
                "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(37,99,235,0.14))",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={900}>
                  {t("result.title", { defaultValue: "Session complete" })}
                </Typography>
                <Typography color="text.secondary">
                  {t("result.subtitle", {
                    defaultValue:
                      "Your pronunciation practice was saved and the reward was applied.",
                  })}
                </Typography>
              </Stack>

              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                <Chip
                  color="success"
                  icon={<CheckCircleRoundedIcon />}
                  label={t("result.correct", {
                    defaultValue: "{{count}} correct",
                    count: finalResult.session.correct_count,
                  })}
                />
                <Chip
                  color="primary"
                  icon={<EmojiEventsRoundedIcon />}
                  label={t("result.reward", {
                    defaultValue: "+{{reward}} XP",
                    reward: finalResult.reward,
                  })}
                />
              </Stack>
            </Stack>
          </Paper>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(320px, 0.65fr)" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Paper
            sx={{
              p: { xs: 2, md: 2.6 },
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              minHeight: 520,
            }}
          >
            {!session ? (
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: 440, textAlign: "center" }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    backgroundImage:
                      "linear-gradient(135deg, #2563eb, #7c3aed)",
                    boxShadow: "0 18px 40px rgba(37,99,235,0.32)",
                  }}
                >
                  <MicRoundedIcon sx={{ fontSize: 44 }} />
                </Box>
                <Typography variant="h5" fontWeight={900}>
                  {t("empty.title", { defaultValue: "Train your pronunciation" })}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
                  {t("empty.subtitle", {
                    defaultValue:
                      "Start a session to receive a Kazakh phrase, record your voice, and compare your pronunciation with AI feedback.",
                  })}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  disabled={loading}
                  onClick={handleStartPractice}
                >
                  {t("actions.start", { defaultValue: "Start practice" })}
                </Button>
              </Stack>
            ) : loading && !currentTest ? (
              <Stack spacing={2}>
                <LinearProgress />
                <Typography color="text.secondary">
                  {t("states.loadingTest", {
                    defaultValue: "Loading pronunciation task...",
                  })}
                </Typography>
              </Stack>
            ) : currentTest ? (
              <Stack spacing={2.4}>
                <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    color={getSpeechDifficultyColor(currentTest.difficulty)}
                    label={getSpeechDifficultyLabel(currentTest.difficulty, t)}
                  />
                  <Chip
                    label={t("session.task", {
                      defaultValue: "Task #{{id}}",
                      id: currentTest.id,
                    })}
                  />
                </Stack>

                <Box
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.35),
                    backgroundImage:
                      "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(168,85,247,0.16))",
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{
                      lineHeight: 1.25,
                      letterSpacing: "-0.02em",
                      mb: 2,
                    }}
                  >
                    {currentTest.kz_text}
                  </Typography>
                  <Typography color="text.secondary">
                    {localizedTranslation || currentTest.ru_text || currentTest.en_text}
                  </Typography>
                </Box>

                {recordingError ? (
                  <Alert severity="warning">{recordingError}</Alert>
                ) : null}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    borderColor: theme.customColors.sidebarBorder,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "stretch", md: "center" }}
                      gap={1.5}
                    >
                      <Stack spacing={0.5}>
                        <Typography fontWeight={900}>
                          {isRecording
                            ? t("recording.recording", {
                                defaultValue: "Recording...",
                              })
                            : t("recording.title", {
                                defaultValue: "Record your voice",
                              })}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {t("recording.hint", {
                            defaultValue:
                              "Speak clearly and keep the phrase in one natural sentence.",
                          })}
                        </Typography>
                      </Stack>

                      <Typography variant="h5" fontWeight={900}>
                        {formatRecordingDuration(recordingSeconds)}
                      </Typography>
                    </Stack>

                    {isRecording ? (
                      <LinearProgress
                        variant="determinate"
                        value={(recordingSeconds / MAX_RECORDING_SECONDS) * 100}
                      />
                    ) : null}

                    {audioUrl ? (
                      <Box
                        component="audio"
                        controls
                        src={audioUrl}
                        sx={{ width: "100%" }}
                      />
                    ) : null}

                    <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                      {!isRecording ? (
                        <Button
                          variant="contained"
                          startIcon={<MicRoundedIcon />}
                          disabled={checking || ending}
                          onClick={handleStartRecording}
                        >
                          {audioBlob
                            ? t("actions.rerecord", {
                                defaultValue: "Record again",
                              })
                            : t("actions.record", { defaultValue: "Record" })}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<StopRoundedIcon />}
                          onClick={handleStopRecording}
                        >
                          {t("actions.stop", { defaultValue: "Stop" })}
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        startIcon={<RefreshRoundedIcon />}
                        disabled={!audioBlob || checking}
                        onClick={resetAudio}
                      >
                        {t("actions.clearAudio", {
                          defaultValue: "Clear audio",
                        })}
                      </Button>

                      <Button
                        variant="contained"
                        color="success"
                        startIcon={checking ? <CircularProgress size={18} /> : <SendRoundedIcon />}
                        disabled={!canCheck}
                        onClick={handleCheck}
                      >
                        {t("actions.check", {
                          defaultValue: "Check pronunciation",
                        })}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>

                {checkResult ? (
                  <Paper
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: checkResult.is_correct
                        ? theme.palette.success.main
                        : theme.palette.warning.main,
                      backgroundColor: alpha(
                        checkResult.is_correct
                          ? theme.palette.success.main
                          : theme.palette.warning.main,
                        0.08,
                      ),
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {checkResult.is_correct ? (
                          <CheckCircleRoundedIcon color="success" />
                        ) : (
                          <CancelRoundedIcon color="warning" />
                        )}
                        <Typography variant="h6" fontWeight={900}>
                          {checkResult.is_correct
                            ? t("feedback.correct", {
                                defaultValue: "Pronunciation looks good",
                              })
                            : t("feedback.incorrect", {
                                defaultValue: "Needs more practice",
                              })}
                        </Typography>
                      </Stack>

                      <Typography color="text.secondary">
                        {checkResult.ai_response ||
                          t("feedback.empty", {
                            defaultValue:
                              "The backend did not return detailed feedback.",
                          })}
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardRoundedIcon />}
                          onClick={handleNext}
                          disabled={loading}
                        >
                          {t("actions.next", { defaultValue: "Next test" })}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<EmojiEventsRoundedIcon />}
                          onClick={handleFinish}
                          disabled={ending}
                        >
                          {t("actions.finish", { defaultValue: "Finish session" })}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            ) : (
              <Stack spacing={2} alignItems="flex-start">
                <Typography variant="h5" fontWeight={900}>
                  {t("empty.noTaskTitle", {
                    defaultValue: "No task available",
                  })}
                </Typography>
                <Typography color="text.secondary">
                  {t("empty.noTaskSubtitle", {
                    defaultValue:
                      "The session is active, but the backend did not return a new speech test.",
                  })}
                </Typography>
                <Button variant="contained" onClick={() => void loadNextTest()}>
                  {t("actions.tryNext", { defaultValue: "Try again" })}
                </Button>
              </Stack>
            )}
          </Paper>

          <Stack spacing={2.5}>
            <Paper
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
              }}
            >
              <Stack spacing={1.5}>
                <Typography fontWeight={900}>
                  {t("session.title", { defaultValue: "Session progress" })}
                </Typography>

                <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={t("session.correctCount", {
                      defaultValue: "{{count}} correct",
                      count: session?.correct_count ?? 0,
                    })}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={t("session.attempts", {
                      defaultValue: "{{count}} attempts",
                      count: attemptsCount,
                    })}
                  />
                  <Chip
                    label={t("session.accuracy", {
                      defaultValue: "{{value}}% accuracy",
                      value: accuracy,
                    })}
                  />
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={accuracy}
                  sx={{ height: 8, borderRadius: 999 }}
                />

                <Typography variant="body2" color="text.secondary">
                  {t("session.sourceOfTruth", {
                    defaultValue:
                      "Final score and reward are calculated by the backend when you finish the session.",
                  })}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
              }}
            >
              <Stack spacing={1.4}>
                <Typography fontWeight={900}>
                  {t("tips.title", { defaultValue: "Recording tips" })}
                </Typography>
                {["read", "quiet", "natural"].map((key, index) => (
                  <Stack key={key} direction="row" spacing={1.25}>
                    <Chip size="small" label={index + 1} color="primary" />
                    <Typography color="text.secondary">
                      {t(`tips.${key}`, {
                        defaultValue:
                          key === "read"
                            ? "Read the Kazakh phrase before recording."
                            : key === "quiet"
                              ? "Try to record in a quiet place."
                              : "Speak naturally, not too fast.",
                      })}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {step !== "idle" ? (
              <Paper
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundImage: theme.gradients.cardSoft,
                }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={900}>
                    {t("states.current", { defaultValue: "Current state" })}
                  </Typography>
                  <Chip
                    color={step === "finished" ? "success" : "primary"}
                    label={t(`states.${step}`, {
                      defaultValue: step,
                    })}
                    sx={{ alignSelf: "flex-start" }}
                  />
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      handleStopRecording();
                      resetAudio();
                      reset();
                    }}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {t("actions.resetPage", { defaultValue: "Reset page" })}
                  </Button>
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default PronunciationPage;

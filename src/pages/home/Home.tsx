import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import MapIcon from "@mui/icons-material/Map";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import daratilIcon from "@/shared/assets/image/daratil_icon.jpg";

/* ───────────────── helpers ───────────────── */

const FEATURES = [
  { key: "lessons",       icon: AutoStoriesIcon,      gradient: "linear-gradient(135deg,#2563eb,#3b82f6)" },
  { key: "ai",            icon: SmartToyIcon,          gradient: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { key: "pronunciation", icon: RecordVoiceOverIcon,   gradient: "linear-gradient(135deg,#059669,#10b981)" },
  { key: "dictionary",    icon: MenuBookIcon,          gradient: "linear-gradient(135deg,#d97706,#f59e0b)" },
  { key: "folklore",      icon: TheaterComedyIcon,     gradient: "linear-gradient(135deg,#dc2626,#f87171)" },
  { key: "map",           icon: MapIcon,               gradient: "linear-gradient(135deg,#0891b2,#22d3ee)" },
] as const;

const STEPS = [
  { key: "step1", icon: PersonAddIcon,  num: "01" },
  { key: "step2", icon: SchoolIcon,     num: "02" },
  { key: "step3", icon: TrendingUpIcon, num: "03" },
] as const;

/* ───────────────── animated counter ───────────────── */

const AnimatedNumber: React.FC<{ target: number }> = ({ target }) => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1600;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setValue(start);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}+</span>;
};

/* ───────────────── main component ───────────────── */

const Home: React.FC = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const theme = useTheme();
  const isAuth = useAuthStore((s) => s.isAuth);
  const isDark = theme.palette.mode === "dark";

  const handleCtaClick = () => {
    navigate(isAuth ? "/app" : "/register");
  };

  /* ─── section-level common styles ─── */
  const sectionSx = {
    py: { xs: 8, md: 12 },
  };

  return (
    <Box
      sx={{
        // offset from the fixed NavBar (74px toolbar)
        pt: "74px",
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
        // break out of RootLayout padding to span full width
        mx: { xs: -2, md: -4 },
        px: 0,
      }}
    >
      {/* ════════════════════════ HERO ════════════════════════ */}
      <Box
        sx={{
          position: "relative",
          ...sectionSx,
          py: { xs: 10, md: 16 },
          textAlign: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)"
              : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        {/* decorative floating orbs */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 60 },
            left: { xs: -40, md: "8%" },
            width: { xs: 140, md: 260 },
            height: { xs: 140, md: 260 },
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(147,51,234,0.20) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: -20, md: 40 },
            right: { xs: -30, md: "6%" },
            width: { xs: 120, md: 220 },
            height: { xs: 120, md: 220 },
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          {/* logo badge */}
          <Box
            sx={{
              display: "inline-flex",
              mb: 3,
              p: 0.8,
              borderRadius: "22px",
              bgcolor: isDark
                ? "rgba(37,99,235,0.14)"
                : "rgba(37,99,235,0.08)",
              border: `1px solid ${isDark ? "rgba(37,99,235,0.28)" : "rgba(37,99,235,0.16)"}`,
            }}
          >
            <Box
              component="img"
              src={daratilIcon}
              alt="Daratil"
              sx={{
                width: 54,
                height: 54,
                borderRadius: "16px",
                objectFit: "cover",
              }}
            />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
              lineHeight: 1.15,
              mb: 1,
              color: "text.primary",
            }}
          >
            {t("hero.title")}
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
              lineHeight: 1.15,
              mb: 3,
              background: "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("hero.titleAccent")}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
              maxWidth: 640,
              mx: "auto",
              mb: 5,
              fontSize: { xs: "0.95rem", md: "1.15rem" },
              lineHeight: 1.7,
            }}
          >
            {t("hero.subtitle")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleCtaClick}
              sx={{
                px: 4.5,
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: 999,
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                boxShadow: "0 14px 34px rgba(37,99,235,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#1d4ed8,#4338ca)",
                  boxShadow: "0 18px 40px rgba(37,99,235,0.45)",
                  transform: "translateY(-2px)",
                },
                transition: "all 260ms ease",
              }}
            >
              {t("hero.cta")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                document
                  .getElementById("features-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 999,
                borderColor: isDark
                  ? "rgba(148,163,184,0.3)"
                  : "rgba(148,163,184,0.5)",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: isDark
                    ? "rgba(37,99,235,0.08)"
                    : "rgba(37,99,235,0.05)",
                  transform: "translateY(-2px)",
                },
                transition: "all 260ms ease",
              }}
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ════════════════════════ STATS ════════════════════════ */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: isDark
            ? "rgba(15,23,42,0.6)"
            : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${isDark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.9)"}`,
          borderBottom: `1px solid ${isDark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.9)"}`,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 3, sm: 0 }}
            justifyContent="space-around"
            alignItems="center"
          >
            {[
              { label: t("stats.lessons"), value: 50 },
              { label: t("stats.users"), value: 1200 },
              { label: t("stats.words"), value: 5000 },
              { label: t("stats.regions"), value: 16 },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <AnimatedNumber target={stat.value} />
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ════════════════════════ FEATURES ════════════════════════ */}
      <Box id="features-section" sx={sectionSx}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                mb: 2,
                color: "text.primary",
              }}
            >
              {t("features.sectionTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 560,
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            >
              {t("features.sectionSubtitle")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {FEATURES.map(({ key, icon: Icon, gradient }) => (
              <Paper
                key={key}
                elevation={0}
                sx={{
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 5,
                  border: `1px solid ${isDark ? "rgba(51,65,85,0.35)" : "rgba(226,232,240,0.9)"}`,
                  bgcolor: isDark
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  transition: "all 300ms ease",
                  cursor: "default",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.5)"
                      : "0 20px 50px rgba(15,23,42,0.12)",
                    borderColor: isDark
                      ? "rgba(99,102,241,0.4)"
                      : "rgba(99,102,241,0.3)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: gradient,
                    boxShadow: `0 8px 24px ${gradient.includes("#2563eb") ? "rgba(37,99,235,0.3)" : "rgba(0,0,0,0.15)"}`,
                    mb: 2.5,
                  }}
                >
                  <Icon sx={{ color: "#fff", fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: "1.05rem",
                    color: "text.primary",
                  }}
                >
                  {t(`features.${key}.title`)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.7,
                  }}
                >
                  {t(`features.${key}.desc`)}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <Box
        sx={{
          ...sectionSx,
          bgcolor: isDark
            ? "rgba(15,23,42,0.5)"
            : "rgba(248,250,252,1)",
          position: "relative",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                mb: 2,
                color: "text.primary",
              }}
            >
              {t("howItWorks.sectionTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 480,
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            >
              {t("howItWorks.sectionSubtitle")}
            </Typography>
          </Box>

          <Stack spacing={{ xs: 4, md: 5 }}>
            {STEPS.map(({ key, icon: Icon, num }, index) => (
              <Paper
                key={key}
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 2, sm: 3 },
                  p: { xs: 3, md: 4 },
                  borderRadius: 5,
                  border: `1px solid ${isDark ? "rgba(51,65,85,0.35)" : "rgba(226,232,240,0.9)"}`,
                  bgcolor: isDark
                    ? "rgba(15,23,42,0.7)"
                    : "#fff",
                  transition: "all 300ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isDark
                      ? "0 16px 40px rgba(0,0,0,0.4)"
                      : "0 16px 40px rgba(15,23,42,0.10)",
                  },
                }}
              >
                {/* number circle */}
                <Box
                  sx={{
                    position: "relative",
                    width: 72,
                    height: 72,
                    minWidth: 72,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      index === 0
                        ? "linear-gradient(135deg,#2563eb,#3b82f6)"
                        : index === 1
                          ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                          : "linear-gradient(135deg,#059669,#10b981)",
                    boxShadow:
                      index === 0
                        ? "0 10px 28px rgba(37,99,235,0.35)"
                        : index === 1
                          ? "0 10px 28px rgba(124,58,237,0.35)"
                          : "0 10px 28px rgba(5,150,105,0.35)",
                  }}
                >
                  <Icon sx={{ color: "#fff", fontSize: 32 }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: isDark ? "#0f172a" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(226,232,240,1)"}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, fontSize: 11, color: "text.primary" }}
                    >
                      {num}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: "1.1rem",
                      color: "text.primary",
                    }}
                  >
                    {t(`howItWorks.${key}.title`)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.7 }}
                  >
                    {t(`howItWorks.${key}.desc`)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <Box sx={{ ...sectionSx, py: { xs: 10, md: 14 } }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              borderRadius: 6,
              position: "relative",
              overflow: "hidden",
              background: isDark
                ? "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.12))"
                : "linear-gradient(135deg,rgba(37,99,235,0.06),rgba(124,58,237,0.06))",
              border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)"}`,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -80,
                right: -80,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: isDark
                  ? "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "1.5rem", md: "2rem" },
                color: "text.primary",
              }}
            >
              {t("cta.title")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 4,
                maxWidth: 400,
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              {t("cta.subtitle")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleCtaClick}
              sx={{
                px: 5,
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: 999,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                boxShadow: "0 14px 34px rgba(37,99,235,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#1d4ed8,#6d28d9)",
                  boxShadow: "0 18px 40px rgba(37,99,235,0.45)",
                  transform: "translateY(-2px)",
                },
                transition: "all 260ms ease",
              }}
            >
              {t("cta.button")}
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <Box
        component="footer"
        sx={{
          py: { xs: 4, md: 5 },
          borderTop: `1px solid ${isDark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.9)"}`,
          bgcolor: isDark
            ? "rgba(15,23,42,0.5)"
            : "rgba(248,250,252,1)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "center", md: "flex-start" }}
            spacing={3}
          >
            <Box sx={{ textAlign: { xs: "center", md: "left" }, maxWidth: 360 }}>
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                justifyContent={{ xs: "center", md: "flex-start" }}
                mb={1.5}
              >
                <Box
                  component="img"
                  src={daratilIcon}
                  alt="Daratil"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "11px",
                    objectFit: "cover",
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Daratil
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                {t("footer.description")}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                pt: { md: 5 },
              }}
            >
              {t("footer.rights")}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

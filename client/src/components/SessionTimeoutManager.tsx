import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { signOut } from "../lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Clock, Lock, LogIn, AlertCircle } from "lucide-react";

/**
 * Inactivity Session Configuration
 * Total Timeout: 60 seconds (1 minute) as requested by user.
 * Warning Dialog appears at 45 seconds (15-second countdown).
 */
const IDLE_TIMEOUT_MS = 60 * 1000;
const WARNING_THRESHOLD_MS = 45 * 1000;
const WARNING_COUNTDOWN_SECONDS = 15;

export default function SessionTimeoutManager() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_COUNTDOWN_SECONDS);
  const [isSessionClosed, setIsSessionClosed] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  /**
   * Terminate session, invalidate auth, attempt window.close, and lock UI
   */
  const handleSignOutAndClose = useCallback(async () => {
    setIsSessionClosed(true);
    setShowWarning(false);

    try {
      await signOut();
    } catch (e) {
      console.warn("Sign-out error on timeout:", e);
    }

    // Attempt to close the browser window/tab
    try {
      window.close();
    } catch {
      // Ignored if browser security blocks closing unscripted tabs
    }

    // Auto-redirect to login after 5 seconds if tab remains open
    setTimeout(() => {
      navigate("/login?reason=timeout", { replace: true });
    }, 5000);
  }, [navigate]);

  /**
   * Reset idle activity timer on user interaction
   */
  const resetTimer = useCallback(() => {
    if (isSessionClosed) return;
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsLeft(WARNING_COUNTDOWN_SECONDS);
    }
  }, [isSessionClosed, showWarning]);

  // Track user events across entire window
  useEffect(() => {
    if (isSessionClosed) return;

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];

    let throttleTimeout: any = null;

    const onUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimer();
          throttleTimeout = null;
        }, 500);
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, onUserActivity, { passive: true })
    );

    // Interval to check inactivity every 1 second
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        clearInterval(timerRef.current);
        handleSignOutAndClose();
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        const remaining = Math.max(
          0,
          Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000)
        );
        setSecondsLeft(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, onUserActivity)
      );
      if (timerRef.current) clearInterval(timerRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [handleSignOutAndClose, isSessionClosed, resetTimer]);

  // Full-screen Session Closed & Locked Screen
  if (isSessionClosed) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in-page">
        <div className="max-w-md w-full bg-card border border-destructive/40 rounded-2xl p-8 shadow-2xl text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Session Closed (1 Min Inactivity)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Website par 1 minute tak koi activity na milne ki wajah se security ke liye session automatically close aur logout kar diya gaya hai.
            </p>
          </div>

          <div className="p-3 bg-muted/60 rounded-lg text-xs text-muted-foreground flex items-center justify-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Automatic idle logout triggered (60s inactivity)</span>
          </div>

          <Button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign in Again
          </Button>
        </div>
      </div>
    );
  }

  // 15-second Countdown Warning Modal
  return (
    <Dialog open={showWarning} onOpenChange={(open) => !open && resetTimer()}>
      <DialogContent
        className="sm:max-w-[420px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Inactivity Warning
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Aapki website par koi response ya activity nahi mili hai. 1 minute complete hone par website automatically close aur logout ho jayegi:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-1">
          <div className="text-5xl font-extrabold font-mono text-amber-500 tracking-wider">
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </div>
          <span className="text-xs text-muted-foreground">
            seconds remaining before auto-close
          </span>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSignOutAndClose}
            className="w-full sm:w-auto"
          >
            Close / Sign Out
          </Button>
          <Button onClick={resetTimer} className="w-full sm:w-auto">
            I'm Still Here (Extend)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

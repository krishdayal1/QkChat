import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Loader2, Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const VerifyResetOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }

    try {
      setIsVerifying(true);

      await axiosInstance.post("/auth/verify-reset-otp", {
        email,
        otp,
      });

      toast.success("OTP verified successfully");

      navigate("/reset-password", {
        state: {
          email,
          otp,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);

      await axiosInstance.post("/auth/forgot-password", {
        email,
      });

      toast.success("New OTP sent successfully");
      setOtp("");
      setCountdown(30);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

      <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-xl p-8 space-y-6 border border-base-300">

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">

          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold">
            Verify OTP
          </h1>

          <p className="text-base-content/60 text-sm">
            Enter the password reset code sent to your email.
          </p>

        </div>

        {/* Email */}
        <div className="bg-base-200 rounded-2xl p-4 flex items-center gap-3">

          <Mail className="size-5 text-primary" />

          <div>
            <p className="text-xs text-base-content/60">
              OTP sent to
            </p>

            <p className="font-medium break-all">
              {email}
            </p>
          </div>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>

            <label className="label">
              <span className="label-text font-medium">
                Enter OTP
              </span>
            </label>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              className="input input-bordered w-full text-center text-lg tracking-[0.5em] font-semibold"
              maxLength={6}
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="size-5" />
                Verify OTP
              </>
            )}
          </button>

          <button
            type="button"
            disabled={countdown > 0 || isResending}
            onClick={handleResendOtp}
            className="btn btn-outline w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending OTP...
              </>
            ) : countdown > 0 ? (
              <>
                Resend OTP in {countdown}s
              </>
            ) : (
              "Resend OTP"
            )}
          </button>

        </form>

        {/* Back */}
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="link link-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyResetOtpPage;
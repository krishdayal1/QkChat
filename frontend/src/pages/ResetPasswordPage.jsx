import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setIsLoading(true);

      await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successfully");

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-xl p-8 space-y-6 border border-base-300">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="size-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold">Reset Password</h1>

          <p className="text-base-content/60 text-sm">
            Create a new password for your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full pl-10 pr-10"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Confirm Password</span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full pl-10 pr-10"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <CheckCircle className="size-5" />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="link link-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

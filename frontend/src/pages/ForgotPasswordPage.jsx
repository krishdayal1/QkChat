import { useState } from "react";
import { Mail, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import AuthImagePattern from "../components/AuthImagePattern";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email");
    }

    try {
      setIsLoading(true);

      await axiosInstance.post("/auth/forgot-password", {
        email,
      });

      toast.success("Reset OTP sent to your email");

      navigate("/verify-reset-otp", {
        state: { email },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">

              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>

              <h1 className="text-2xl font-bold mt-2">
                Forgot Password?
              </h1>

              <p className="text-base-content/60">
                Enter your email to receive a password reset OTP
              </p>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Email
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>

                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>

          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="link link-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

        </div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
        title={"Reset your password"}
        subtitle={"We'll send a verification code to your email so you can securely reset your password."}
      />
    </div>
  );
};

export default ForgotPasswordPage;
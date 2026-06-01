import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const VerifyOtpPage = () => {

    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(30);

    const location = useLocation();
    const navigate = useNavigate();

    const { verifyOtp, resendOtp } = useAuthStore();

    const email = location.state?.email;

    useEffect(() => {

        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [countdown]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        await verifyOtp(
            {
                email,
                otp
            },
            navigate
        );
    };


    const handleResendOtp = async () => {

        await resendOtp({ email });

        setCountdown(30);
    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

            <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-xl p-8 space-y-6 border border-base-300">

                <div className="flex flex-col items-center text-center space-y-3">

                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="size-8 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold">
                        Verify OTP
                    </h1>

                    <p className="text-base-content/60 text-sm">
                        Enter the verification code sent to your email.
                    </p>

                </div>


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


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="label">
                            <span className="label-text font-medium">
                                Enter OTP
                            </span>
                        </label>

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="input input-bordered w-full text-center text-lg tracking-[0.5em] font-semibold"
                            maxLength={6}
                        />

                    </div>


                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                    >
                        <ShieldCheck className="size-5" />
                        Verify OTP
                    </button>


                    <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleResendOtp}
                        className="btn btn-outline w-full"
                    >

                        {countdown > 0 ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Resend OTP in {countdown}s
                            </>
                        ) : (
                            "Resend OTP"
                        )}

                    </button>

                </form>

            </div>

        </div>
    );
};

export default VerifyOtpPage;
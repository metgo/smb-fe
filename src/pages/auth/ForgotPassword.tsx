import { toast } from "sonner";
import { useState } from "react";
import { Globe } from "lucide-react";
import { useForgotPasswordMutation } from "@/store/api/authApi";

interface ForgotPasswordProps {
  setCurrentTab: (v: string) => void;
}

export function ForgotPassword({ setCurrentTab }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await forgotPassword({ email, purpose: "forgetPassword" }).unwrap();
      toast.success("OTP sent to your email");

      // Redirect to OTP entry page
      setCurrentTab("otp");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-start mb-8">
            {/* <button
              onClick={() => setCurrentTab("login")}
              className="text-white hover:text-gray-300 text-2xl transition-colors"
            >
              ←
            </button> */}
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="">
            {/* Title */}
            <h1 className="text-4xl text-white mb-2">Forgot Password</h1>

            {/* Signup Link */}
            <p className="text-white/80 text-left mb-6">
              Don't have an Account?{" "}
              <button
                onClick={() => setCurrentTab("register")}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-4 transition-colors"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

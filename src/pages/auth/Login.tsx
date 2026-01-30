import { toast } from "sonner";
import { useState } from "react";
import { Globe } from "lucide-react";

import { routes } from "@/lib/routes";
import { useLoginMutation } from "@/store/api/authApi";
import ContinueWithGoogle from "./ContinueWithGoogle";
import { SubmitButton } from "@/components/btns";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";

interface LoginProps {
  setCurrentTab: (v: string) => void;
}

export function Login({ setCurrentTab }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await login({ email: username, password }).unwrap();

      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(data));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("dmoId");
        localStorage.removeItem("authorityId");
      }

      dispatch(loginSuccess(data.user));

      navigate(routes.dashboard, { replace: true });
      toast.success(`Welcome ${data.user.firstName} ${data.user.lastName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            {/* <img src={logoImage} alt="Logo" className="w-16 h-16" /> */}
          </div>

          {/* Title */}
          <h1 className="text-4xl text-white mb-4">Sign In</h1>

          {/* Subtitle */}
          <p className="text-white/80 mb-8">
            Don't have an Account?{" "}
            <button
              onClick={() => setCurrentTab("register")}
              className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              Sign up here
            </button>
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username/Email Input */}
            <input
              type="text"
              placeholder="username@email.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Error Message */}
            {error && <p className="text-red-300 text-sm">{error}</p>}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <SubmitButton
              loading={isLoading}
              label="Sign In"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-7"
            />

            {/* Divider */}
            <div className="text-center text-white/80">Or</div>
          </form>
          {/* Google Sign In */}
          <ContinueWithGoogle />
        </div>
      </div>
    </div>
  );
}

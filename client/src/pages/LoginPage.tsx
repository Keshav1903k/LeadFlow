import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export function LoginPage() {
  const [email, setEmail] = useState("keshav@leadflow.app")
  const [password, setPassword] = useState("password123")
  const { login, token, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token || localStorage.getItem("leadflow_token")) {
      navigate("/leads", { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const effectiveEmail = email.trim() || "keshav@leadflow.app"
    const effectivePassword = password || "password123"

    await login(effectiveEmail, effectivePassword)
    navigate("/leads", { replace: true })
  }

  const handleDemoLogin = async () => {
    setEmail("keshav@leadflow.app")
    setPassword("password123")
    await login("keshav@leadflow.app", "password123")
    navigate("/leads", { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo-icon.png"
            alt="LeadFlow"
            className="w-12 h-12 rounded-xl object-contain mb-3 drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold font-heading text-[#1A1A17] tracking-tight">
            Sign in to LeadFlow
          </h1>
          <p className="mt-1 text-sm text-[#5C5A54]">
            Manage and track your sales leads with ease
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-[#E7E3DB] p-8 shadow-sm">
          {/* Quick Demo Credentials Info Pill */}
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
            <span className="font-semibold block text-emerald-950 mb-0.5">Quick Demo Access:</span>
            Default account: <code className="bg-emerald-100/70 px-1 py-0.5 rounded text-[11px] font-mono">keshav@leadflow.app</code> / <code className="bg-emerald-100/70 px-1 py-0.5 rounded text-[11px] font-mono">password123</code>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <Input
                type="email"
                placeholder="keshav@leadflow.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0E7C66] hover:bg-[#0B6654] text-white font-medium h-10 mt-2 transition-all shadow-sm"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo User Quick Button */}
          <div className="mt-4 pt-4 border-t border-[#E7E3DB]">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleDemoLogin}
              className="w-full text-xs font-medium text-[#0E7C66] border-[#0E7C66]/30 hover:bg-emerald-50/50"
            >
              One-Click Demo Sign In (Keshav Sharma)
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-[#5C5A54]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#0E7C66] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

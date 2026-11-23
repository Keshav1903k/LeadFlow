import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export function SignupPage() {
  const [name, setName] = useState("Keshav Sharma")
  const [email, setEmail] = useState("keshav@leadflow.app")
  const [password, setPassword] = useState("password123")
  const { signup, token, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token || localStorage.getItem("leadflow_token")) {
      navigate("/leads", { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const effectiveName = name.trim() || "Keshav Sharma"
    const effectiveEmail = email.trim() || "keshav@leadflow.app"
    const effectivePassword = password || "password123"

    await signup(effectiveName, effectiveEmail, effectivePassword)
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#5C5A54]">
            Start managing your leads in minutes
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-[#E7E3DB] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Keshav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

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
                placeholder="Minimum 6 characters"
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
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5C5A54]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#0E7C66] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

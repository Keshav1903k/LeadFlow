import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    const fieldErrors: Record<string, string> = {}

    if (!email.trim()) fieldErrors.email = "Email is required"
    if (!password) fieldErrors.password = "Password is required"

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    try {
      await login(email, password)
      navigate("/leads")
    } catch (err: any) {
      if (err.fields) {
        setErrors(err.fields)
      } else {
        setGeneralError(err.error || "Invalid email or password")
      }
    }
  }

  const handleDemoLogin = async () => {
    setEmail("keshav@leadflow.app")
    setPassword("password123")
    setGeneralError("")
    try {
      await login("keshav@leadflow.app", "password123")
      navigate("/leads")
    } catch (err: any) {
      setGeneralError(err.error || "Demo login failed")
    }
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
          {generalError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                }}
                error={errors.email}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                }}
                error={errors.password}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0E7C66] hover:bg-[#0B6654] text-white font-medium h-10 mt-2"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo User Quick Button */}
          <div className="mt-4 pt-4 border-t border-[#E7E3DB]">
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full text-xs font-medium text-[#0E7C66] border-[#0E7C66]/30 hover:bg-emerald-50/50"
            >
              Auto-fill Demo Account (Keshav Sharma)
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

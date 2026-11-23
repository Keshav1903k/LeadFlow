import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { TrendingUp } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    const fieldErrors: Record<string, string> = {}

    if (!name.trim()) fieldErrors.name = "Name is required"
    if (!email.trim()) fieldErrors.email = "Email is required"
    if (password.length < 6)
      fieldErrors.password = "Password must be at least 6 characters"

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    try {
      await signup(name, email, password)
      navigate("/leads")
    } catch (err: any) {
      if (err.fields) {
        setErrors(err.fields)
      } else {
        setGeneralError(err.error || "Could not complete signup")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0E7C66] flex items-center justify-center text-white shadow-sm mb-3">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#1A1A17] tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#5C5A54]">
            Start managing your leads in minutes
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
                Full Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Keshav Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                }}
                error={errors.name}
                disabled={isLoading}
              />
            </div>

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
                placeholder="Minimum 6 characters"
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

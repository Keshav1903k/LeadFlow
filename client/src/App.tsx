import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { Layout } from "./components/Layout"
import { LeadsPage } from "./pages/LeadsPage"
import { OverviewPage } from "./pages/OverviewPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const location = useLocation()
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("leadflow_token") : null

  if (!token && !storedToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("leadflow_token") : null
  if (token || storedToken) {
    return <Navigate to="/leads" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnly>
                <SignupPage />
              </PublicOnly>
            }
          />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/leads" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/leads" element={<LeadsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

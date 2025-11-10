import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Sparkles, 
  ChevronDown,
  Heart,
  Loader2
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, demoLogin, isLoading, error, isAuthenticated, user } = useAuth();
  
  const initialRole = searchParams.get("role") || "patient";
  const redirectPath = searchParams.get("redirect") || null;
  
  const [role, setRole] = useState<"patient" | "pharmacy">(initialRole as "patient" | "pharmacy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Handle navigation after successful authentication OR if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const targetPath = redirectPath || 
        (user.role === 'pharmacy' ? '/pharmacy/dashboard' : '/patient/modern');
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, redirectPath, navigate]);

  // Show loading state if authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F7F9FC] to-[#FFFFFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B6CA8] mx-auto mb-4"></div>
          <p className="text-[#1B6CA8] font-semibold text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      // Register new user
      await register({
        email,
        password,
        firstName,
        lastName,
        role: role === 'pharmacy' ? 'pharmacy' : 'user'
      });
    } else {
      // Login existing user
      await login(email, password);
    }
    // Navigation will be handled by the useEffect when authentication state changes
  };

  const handleDemoLogin = async (demoRole: 'patient' | 'pharmacy') => {
    await demoLogin(demoRole);
    // Navigation will be handled by the useEffect when authentication state changes
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen premium-login-gradient flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ x: [-50, 50, -50], y: [-50, 50, -50], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.div 
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ThemeToggle />
      </motion.div>

      {/* Main Login Card - Landscape Layout */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
        className="w-full max-w-6xl relative z-10"
      >
        <Card className="premium-glass-card backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            {/* Left Side - Branding & Info */}
            <motion.div 
              className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="space-y-6">
                {/* Logo and Title */}
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg"
                    >
                      <Heart className="h-6 w-6 text-white fill-white" />
                    </motion.div>
                    <h1 className="text-5xl font-bold premium-gradient-text">
                      MediTatva
                    </h1>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSignup ? "Join Us Today" : "Welcome Back"}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Your trusted medicine companion. Connect with nearby pharmacies and find medicines instantly.
                  </p>
                </motion.div>

                {/* Features List */}
                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-base font-medium">AI-Powered Medicine Search</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-base font-medium">Real-Time Pharmacy Network</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-pink-400" />
                    </div>
                    <span className="text-base font-medium">Instant Medicine Availability</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {isSignup ? "Create Account" : "Sign In"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isSignup ? "Fill in your details to get started" : "Enter your credentials to continue"}
                  </p>
                </div>

                {/* Role Selector Tabs */}
                <div className="relative bg-muted/30 rounded-xl p-1 backdrop-blur-sm">
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-lg premium-tab-indicator shadow-lg"
                    initial={false}
                    animate={{
                      left: role === "patient" ? "0.25rem" : "50%",
                      right: role === "patient" ? "50%" : "0.25rem",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="relative grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setRole("patient")}
                      className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                        role === "patient" ? "text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Patient</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("pharmacy")}
                      className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                        role === "pharmacy" ? "text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">Pharmacy</span>
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Fields (only for signup) */}
                  <AnimatePresence>
                    {isSignup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              onFocus={() => setFocusedField("firstName")}
                              onBlur={() => setFocusedField(null)}
                              className={`h-12 premium-input ${
                                focusedField === "firstName" ? "ring-2 ring-primary/50" : ""
                              }`}
                              required={isSignup}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Doe"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              onFocus={() => setFocusedField("lastName")}
                              onBlur={() => setFocusedField(null)}
                              className={`h-12 premium-input ${
                                focusedField === "lastName" ? "ring-2 ring-primary/50" : ""
                              }`}
                              required={isSignup}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={role === "patient" ? "patient@meditatva.com" : "pharmacy@meditatva.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`pl-12 h-12 premium-input ${
                          focusedField === "email" ? "ring-2 ring-primary/50" : ""
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        className={`pl-12 h-12 premium-input ${
                          focusedField === "password" ? "ring-2 ring-primary/50" : ""
                        }`}
                        required
                      />
                    </div>
                    {isSignup && (
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 premium-button text-base font-semibold relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSignup ? "Create Account" : "Login to Dashboard"}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      />
                    </Button>
                  </motion.div>
                </form>

                {/* Demo Credentials - Collapsible */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDemo(!showDemo)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-300/20 hover:border-purple-300/40 transition-all"
                  >
                    <span className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Demo Accounts
                    </span>
                    <motion.div
                      animate={{ rotate: showDemo ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4 text-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showDemo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 rounded-lg bg-muted/30 backdrop-blur-sm space-y-3 border border-border/50">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-primary" />
                              <p className="font-semibold text-sm text-foreground">Patient Demo</p>
                            </div>
                            <div className="space-y-2 pl-6">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoLogin('patient')}
                                disabled={isLoading}
                                className="w-full justify-start text-xs"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                ) : null}
                                Quick Login as Patient
                              </Button>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p className="font-mono bg-background/50 px-2 py-1 rounded">
                                  patient@demo.com
                                </p>
                                <p className="font-mono bg-background/50 px-2 py-1 rounded">
                                  demo123
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-4 w-4 text-secondary" />
                              <p className="font-semibold text-sm text-foreground">Pharmacy Demo</p>
                            </div>
                            <div className="space-y-2 pl-6">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoLogin('pharmacy')}
                                disabled={isLoading}
                                className="w-full justify-start text-xs"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                ) : null}
                                Quick Login as Pharmacy
                              </Button>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p className="font-mono bg-background/50 px-2 py-1 rounded">
                                  pharmacy@demo.com
                                </p>
                                <p className="font-mono bg-background/50 px-2 py-1 rounded">
                                  demo123
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Signup Toggle & Back to Home */}
                <div className="space-y-3 pt-2">
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignup(!isSignup)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {isSignup ? "Already have an account?" : "Don't have an account?"}
                      <span className="text-primary font-medium hover:underline">
                        {isSignup ? "Login" : "Sign up"}
                      </span>
                    </button>
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate("/")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Home
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-6 left-0 right-0 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} MediTatva — Your Trusted Medicine Companion
        </p>
      </motion.footer>
    </div>
  );
};

export default Login;

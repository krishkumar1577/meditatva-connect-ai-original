import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  MessageCircle, 
  Bot, 
  Shield, 
  Clock,
  Pill,
  Sparkles,
  ChevronRight,
  Star,
  Quote,
  ArrowRight,
  Heart,
  Activity,
  Zap,
  TrendingUp
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { scrollY } = useScroll();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Patient",
      initials: "PS",
      text: "MediTatva helped me find emergency medicines at 2 AM. The AI search is incredibly fast and accurate!",
      rating: 5,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Pharmacy Owner",
      initials: "RK",
      text: "Since joining MediTatva, our pharmacy visibility has increased by 300%. The platform is a game-changer!",
      rating: 5,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Anita Desai",
      role: "Patient",
      initials: "AD",
      text: "The real-time availability feature saved me hours of calling different pharmacies. Highly recommended!",
      rating: 5,
      gradient: "from-teal-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        cursorX.set(x);
        cursorY.set(y);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B1220]">
      {/* Premium Background with Gradient Mesh */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220]" />
        
        {/* Animated Gradient Lines */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"
          animate={{ x: [1000, -1000] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Radial Glows - Precise, Not Blurry */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Premium Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{
          background: 'rgba(11, 18, 32, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Pill className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-md opacity-40" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MediTatva
            </span>
          </motion.div>
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* Hero Section - Premium Enterprise Design */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Rotating Ring Animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/30" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-blue-500/20" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-purple-500/20" />
        </motion.div>

        <motion.div 
          className="container mx-auto text-center relative z-10"
          style={{ opacity }}
        >
          {/* 3D Floating Bot Icon */}
          <motion.div
            className="flex justify-center mb-8"
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl border border-cyan-400/30"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="h-12 w-12 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Title with Gradient Stroke */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 relative inline-block">
              <span 
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  WebkitTextStroke: '1px rgba(20, 184, 166, 0.3)',
                  paintOrder: 'stroke fill',
                }}
              >
                MediTatva
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                style={{
                  WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                  maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                }}
              />
            </h1>
          </motion.div>

          <motion.p 
            className="text-2xl md:text-4xl font-semibold mb-4 text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find Your Medicines Instantly
          </motion.p>

          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            AI-powered platform connecting you with nearby pharmacies — anytime, anywhere
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link to="/login?role=patient">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="group relative text-lg px-10 py-7 h-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    <Heart className="h-5 w-5" />
                    Login as Patient
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                </Button>
              </motion.div>
            </Link>

            <Link to="/login?role=pharmacy">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="group relative text-lg px-10 py-7 h-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 border border-purple-400/50 shadow-lg shadow-purple-500/30">
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    <Activity className="h-5 w-5" />
                    Login as Pharmacy
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Refined Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-5 h-8 border border-current rounded-full flex justify-center p-1">
              <motion.div 
                className="w-1 h-2 bg-current rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Enterprise Grade Cards */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to find and manage medicines efficiently
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Search,
                title: "Smart AI Search",
                description: "Find medicines instantly with AI-powered search across all nearby pharmacies with real-time availability.",
                gradient: "from-cyan-500 to-blue-600",
                borderGradient: "from-cyan-500/50 to-blue-600/50"
              },
              {
                icon: MapPin,
                title: "Live Location",
                description: "Interactive map showing nearby pharmacies with distance, ratings, and opening hours in real-time.",
                gradient: "from-purple-500 to-pink-600",
                borderGradient: "from-purple-500/50 to-pink-600/50"
              },
              {
                icon: MessageCircle,
                title: "Direct Chat",
                description: "Chat directly with pharmacies to check availability, reserve medicines, and get instant responses.",
                gradient: "from-teal-500 to-emerald-600",
                borderGradient: "from-teal-500/50 to-emerald-600/50"
              },
              {
                icon: Bot,
                title: "AI Assistant",
                description: "24/7 AI-powered chatbot to help you find medicines, compare prices, and get health advice.",
                gradient: "from-orange-500 to-red-600",
                borderGradient: "from-orange-500/50 to-red-600/50"
              },
              {
                icon: Shield,
                title: "Verified Pharmacies",
                description: "All pharmacies are verified and licensed. Your health and safety are our top priorities.",
                gradient: "from-indigo-500 to-blue-600",
                borderGradient: "from-indigo-500/50 to-blue-600/50"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Access the platform anytime, anywhere. Emergency medicine searches available round the clock.",
                gradient: "from-pink-500 to-rose-600",
                borderGradient: "from-pink-500/50 to-rose-600/50"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card 
                  className="h-full relative overflow-hidden group"
                  style={{
                    background: 'rgba(17, 24, 39, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                  }}
                >
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.borderGradient}`} />
                  
                  <div className="p-8">
                    {/* Icon with Reduced Glow */}
                    <motion.div 
                      className="relative inline-block mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`relative h-16 w-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md`}>
                        <feature.icon className="h-8 w-8 text-white relative z-10" />
                      </div>
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} blur-lg opacity-20 group-hover:opacity-30 transition-opacity`} />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Gradient Border on Hover */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${feature.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} style={{ padding: '1px', margin: '-1px' }}>
                    <div className="w-full h-full rounded-lg" style={{ background: 'rgba(17, 24, 39, 0.8)' }} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Premium Dark Design */}
      <section className="py-32 relative overflow-hidden">
        {/* Deep Gradient Mesh Background with Slow Hue Shift */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(20, 184, 166, 0.08) 100%)',
            y: y1 
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our users have to say about MediTatva
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card 
                  className="p-12 relative"
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Quote className="absolute top-8 left-8 h-12 w-12 text-cyan-500/20" />
                  
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with Gradient Border */}
                    <motion.div 
                      className={`relative h-24 w-24 rounded-full p-0.5 bg-gradient-to-br ${testimonials[currentTestimonial].gradient} mb-6 shadow-2xl`}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-full w-full rounded-full bg-[#111827] flex items-center justify-center text-2xl font-bold text-white">
                        {testimonials[currentTestimonial].initials}
                      </div>
                    </motion.div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">
                      "{testimonials[currentTestimonial].text}"
                    </p>

                    {/* Author */}
                    <div>
                      <p className="font-bold text-lg text-white mb-1">
                        {testimonials[currentTestimonial].name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? "w-12 bg-gradient-to-r from-cyan-500 to-blue-600" 
                      : "w-2 bg-gray-700 hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Premium Glass + Neon Borders */}
      <section className="py-32 relative overflow-hidden">
        {/* Rotating Ring Background */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/10" />
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-[600px] h-[600px] rounded-full border border-blue-500/10" />
        </motion.div>

        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Card 
            className="p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              boxShadow: '0 0 40px rgba(20, 184, 166, 0.1), inset 0 0 40px rgba(20, 184, 166, 0.05)',
            }}
          >
            {/* Light Sweep Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-6"
              >
                <Sparkles className="h-16 w-16 text-cyan-400" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of users who trust MediTatva for their medicine needs
              </p>

              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block"
                >
                  <Button 
                    size="lg"
                    className="text-xl px-12 py-8 h-auto group relative overflow-hidden"
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(20, 184, 166, 0.5)',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
                    }}
                  >
                    {/* Hover Sweep Light */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    <span className="flex items-center gap-3 text-white relative z-10">
                      Get Started Now
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-6 w-6" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer - Premium Dark Navy with Gradient Accents */}
      <footer className="relative py-16 bg-[#0B1220] border-t border-cyan-500/20">
        {/* Slow Floating Icons Background - Subtle Parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <motion.div
            className="absolute top-10 left-10"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="h-10 w-10 text-cyan-400" />
          </motion.div>
          <motion.div
            className="absolute top-20 right-20"
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <MapPin className="h-10 w-10 text-purple-400" />
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-1/3"
            animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <MessageCircle className="h-10 w-10 text-pink-400" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  MediTatva
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted medicine companion, powered by AI.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {["About Us", "Features", "Pricing", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Patients */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Find Medicines", "Track Orders", "Emergency", "Support"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Pharmacies */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">For Pharmacies</h4>
              <ul className="space-y-3">
                {["Register", "Dashboard", "Analytics", "Help Center"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright with Thin Gradient Separator */}
          <div className="border-t border-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediTatva. All rights reserved. Made with{" "}
              <motion.span
                className="inline-block text-pink-500"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ❤️
              </motion.span>{" "}
              for better healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

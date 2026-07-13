import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Sparkles, 
  Cpu, 
  Layers, 
  Terminal, 
  ArrowLeft, 
  ArrowUpRight, 
  Award, 
  Activity, 
  ExternalLink,
  Code2,
  Database
} from 'lucide-react';

const Github = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="1.2em"
    height="1.2em"
    stroke="currentColor"
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="1.2em"
    height="1.2em"
    stroke="currentColor"
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Custom Intersection Observer Hook/Component for Scroll Reveal
function ScrollReveal({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function About() {
  // Scroll progress for subtle visual cues
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef5f3] text-[#2d4a43] font-sans selection:bg-brand-orange/20 selection:text-[#ca9428] relative overflow-x-hidden">
      
      {/* Decorative ambient lighting following scroll */}
      <div 
        className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-300"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div 
        className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-300"
        style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
      />

      {/* Floating Back Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 bg-[#2d4a43] border-b border-white/10 flex items-center justify-between shadow-md">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-all bg-white/10 border border-white/10 hover:bg-white/20 px-4 py-2 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to App
        </Link>
        <div className="flex items-center gap-2">
          <span className="p-1 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-md text-[#2d4a43]">
            <Sparkles size={12} />
          </span>
          <span className="text-xs font-black tracking-wider text-white">
            Grow <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent">Together</span>
          </span>
        </div>
      </header>

      {/* Section 1: The Hero Landing */}
      <section className="relative h-screen flex flex-col justify-center items-center px-6 text-center select-none overflow-hidden">
        <div className="z-10 max-w-4xl space-y-6 animate-fade-in">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#2d4a43]">
            Engineering <span className="bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-blue bg-clip-text text-transparent font-extrabold">scalable systems.</span>
            <br />
            Designing <span className="underline decoration-brand-orange decoration-4 underline-offset-8">pixel-perfect</span> experiences.
          </h1>
          <p className="text-base sm:text-xl text-[#6b7280] max-w-xl mx-auto font-medium tracking-wide">
            I build software that doesn't just work—it feels effortless.
          </p>
        </div>

        {/* Dynamic down-arrow indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#6b7280]">Scroll to Explore</span>
          <div className="w-1 h-12 bg-gradient-to-b from-brand-orange to-transparent rounded-full animate-bounce" />
        </div>
      </section>

      {/* Section 2: The Introduction */}
      <section className="py-24 md:py-36 max-w-5xl mx-auto px-6 relative">
        <ScrollReveal>
          <div className="space-y-6 md:space-y-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
              The Developer
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#2d4a43]">
              I am Aniket Pawar.
            </h2>
            <p className="text-lg sm:text-2xl text-[#6b7280] font-normal leading-relaxed max-w-4xl">
              With a B.Tech in Computer Science and Engineering, I operate at the intersection of robust backend logic and intuitive frontend design. I believe that complex system architecture and beautiful UI/UX are not mutually exclusive—they are the standard.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Section 2.5: The Project Description */}
      <section className="py-24 bg-white border-y border-[#e2eae7] relative">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading and Summary */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                  Live Proof of Concept
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d4a43] tracking-tight leading-snug">
                  Co-engineering productivity. Synchronizing teamwork.
                </h2>
                <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed">
                  <strong className="text-[#2d4a43]">Grow Together</strong> is the platform you are currently exploring. It is a premium, real-time collaborative workspace engineered to synchronize tasks, goals, progress analytics, and candidate applications between developers in perfect synchrony.
                </p>
                <div className="flex gap-4">
                  <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-[#2d4a43] hover:bg-[#2d4a43]/90 px-4 py-2.5 rounded-xl transition-all shadow-md">
                    Launch Workspace Dashboard <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Key Architectural Pillars */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pillar 1 */}
                <div className="premium-card p-6 space-y-3 hover:border-brand-orange/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-bold text-[#2d4a43] text-sm">Real-Time WebSockets</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Powered by a Socket.io socket pipeline, syncing goal updates, active statuses, and board actions instantly across sessions.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="premium-card p-6 space-y-3 hover:border-brand-blue/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-bold text-[#2d4a43] text-sm">Interactive Analytics</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Uses Recharts to construct live, interactive progress curves of teammate goals completed to encourage collective momentum.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="premium-card p-6 space-y-3 hover:border-brand-purple/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                    <Terminal size={18} />
                  </div>
                  <h3 className="font-bold text-[#2d4a43] text-sm">Activity Heatmap</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Tracks full developer commits and activity logs over a rolling 365-day period in a GitHub-inspired contribution calendar.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="premium-card p-6 space-y-3 hover:border-brand-yellow/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-orange">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="font-bold text-[#2d4a43] text-sm">Premium Aesthetics</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Built using an elegant, responsive glassmorphic design language featuring custom animations and a gold-highlighted palette.
                  </p>
                </div>

              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 3: The Architecture */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Side: Typography */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                Experience & Scale
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-[#2d4a43] leading-tight">
                Built for Scale.
                <br />
                Engineered for Concurrency.
              </h2>
              <p className="text-[#6b7280] text-base sm:text-lg leading-relaxed font-light">
                Performance is a feature. Whether it is distributing network traffic with load balancers for an Infosys Springboard job portal, or ensuring high availability for an e-commerce platform at Horizon Flare, I build systems designed to handle the pressure of peak user loads.
              </p>
            </div>

            {/* Right Side: Sleek Glassmorphic Stack Cards */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Card 1: MERN */}
              <div className="premium-card p-8 hover:translate-x-2 transition-transform duration-300 relative overflow-hidden group bg-white border border-[#e2eae7]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/10 transition-colors" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2d4a43]/5 border border-[#e2eae7] flex items-center justify-center text-brand-orange">
                      <Code2 size={20} />
                    </div>
                    <h3 className="font-extrabold text-[#2d4a43] text-lg tracking-tight">MERN Full-Stack</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-brand-orange tracking-widest bg-brand-orange/10 px-2.5 py-1 rounded-md">Expert</span>
                </div>
                <p className="text-[#6b7280] text-xs leading-relaxed mb-4">
                  Architecting dynamic web portals, secure RESTful APIs, and websocket servers. Specializing in high-performance React frontends and scalable MongoDB schemas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'WebSockets'].map((tech) => (
                    <span key={tech} className="text-[10px] font-semibold text-[#2d4a43] bg-slate-50 border border-[#e2eae7] px-2 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 2: C++ */}
              <div className="premium-card p-8 hover:translate-x-2 transition-transform duration-300 relative overflow-hidden group bg-white border border-[#e2eae7]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2d4a43]/5 border border-[#e2eae7] flex items-center justify-center text-brand-blue">
                      <Terminal size={20} />
                    </div>
                    <h3 className="font-extrabold text-[#2d4a43] text-lg tracking-tight">C++ Systems</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-brand-blue tracking-widest bg-brand-blue/10 px-2.5 py-1 rounded-md">Low Latency</span>
                </div>
                <p className="text-[#6b7280] text-xs leading-relaxed mb-4">
                  Writing optimized algorithms and resource-efficient code. Experienced in object-oriented structures, memory management, and concurrent computing solutions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['C++17', 'STL', 'Multi-threading', 'Data Structures', 'OOP'].map((tech) => (
                    <span key={tech} className="text-[10px] font-semibold text-[#2d4a43] bg-slate-50 border border-[#e2eae7] px-2 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 3: Python */}
              <div className="premium-card p-8 hover:translate-x-2 transition-transform duration-300 relative overflow-hidden group bg-white border border-[#e2eae7]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full blur-2xl group-hover:bg-brand-purple/10 transition-colors" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2d4a43]/5 border border-[#e2eae7] flex items-center justify-center text-[#ca9428]">
                      <Database size={20} />
                    </div>
                    <h3 className="font-extrabold text-[#2d4a43] text-lg tracking-tight">Python & Data</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#ca9428] tracking-widest bg-[#ca9428]/10 px-2.5 py-1 rounded-md">AI Integration</span>
                </div>
                <p className="text-[#6b7280] text-xs leading-relaxed mb-4">
                  Developing machine learning scripts, data processing microservices, automated pipelines, and intelligent backends for generative text workflows.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Python 3', 'Django/Flask', 'NumPy/Pandas', 'NLP Integration', 'FastAPI'].map((tech) => (
                    <span key={tech} className="text-[10px] font-semibold text-[#2d4a43] bg-slate-50 border border-[#e2eae7] px-2 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* Section 4: The Innovation */}
      <section className="py-28 relative overflow-hidden bg-white border-y border-[#e2eae7]">
        {/* Futuristic Glowing Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Radial Purple Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                <Cpu size={14} className="text-brand-blue animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-brand-blue uppercase">Oracle Certified GenAI Professional</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-[#2d4a43]">
                Oracle Generative AI Certified.
              </h2>
              
              <p className="text-lg sm:text-xl text-[#6b7280] font-light leading-relaxed">
                I integrate machine learning models and NLP directly into web workflows, creating experiences where raw data transforms into dynamic, intelligent behavior.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Bullet 1 */}
                <div className="premium-card p-6 bg-white border border-[#e2eae7] hover:border-brand-blue/35 transition-all">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold">01</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#2d4a43] text-sm">Centralized ERP & Study Guides</h4>
                      <p className="text-[#6b7280] text-xs leading-relaxed">
                        Developed <strong>AI-Campus</strong>, a centralized ERP system featuring dynamic study guide generation tailored to curriculum objectives.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="premium-card p-6 bg-white border border-[#e2eae7] hover:border-brand-blue/35 transition-all">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold">02</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#2d4a43] text-sm">Automated Operations Workload</h4>
                      <p className="text-[#6b7280] text-xs leading-relaxed">
                        Reduced daily operational workloads for faculty by 20% through automated administrative workflows and dynamic reporting utilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 5: The Aesthetics */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="space-y-12">
            
            {/* Header info */}
            <div className="max-w-3xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                Awards & Design
              </span>
              <h2 className="text-4xl font-black text-[#2d4a43] tracking-tight">
                Award-Winning Interfaces.
              </h2>
              <p className="text-[#6b7280] text-base sm:text-lg font-light leading-relaxed">
                A powerful backend deserves a flawless frontend. My obsession with human-centered design, sleek motion aesthetics, and custom interactivity has been recognized on national stages:
              </p>
            </div>

            {/* Gallery showcasing generated UI mockups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Gallery Item 1 */}
              <div className="group relative premium-card overflow-hidden hover:border-brand-orange/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative">
                  <img 
                    src="/ui_mockup_one.png" 
                    alt="Sleek Dashboard UI Design mockup" 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-brand-orange tracking-widest bg-brand-orange/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Award size={10} /> 3rd Place
                    </span>
                    <span className="text-[10px] text-[#6b7280] font-bold">200+ Competitors</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2d4a43]">NIT Silchar UI/UX Hackathon</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Designed an intuitive collaborative portal layout optimized for responsive screen scaling, leveraging micro-interactions and dark theme gradients.
                  </p>
                </div>
              </div>

              {/* Gallery Item 2 */}
              <div className="group relative premium-card overflow-hidden hover:border-brand-blue/30 transition-all duration-300 bg-white border border-[#e2eae7]">
                <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative">
                  <img 
                    src="/ui_mockup_two.png" 
                    alt="Futuristic Generative AI App UI design mockup" 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-brand-blue tracking-widest bg-brand-blue/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Award size={10} /> 7th Place
                    </span>
                    <span className="text-[10px] text-[#6b7280] font-bold">National Stage</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2d4a43]">IIT Guwahati Design Hackathon</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">
                    Engineered an AI-native interface focusing on workflow generation. Built custom controls, clean widgets, and high-performance interactive states.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* Section 6: The Footer */}
      <footer className="py-24 bg-slate-50 border-t border-[#e2eae7] relative overflow-hidden">
        {/* Glow behind contact */}
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[300px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <ScrollReveal>
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black text-[#2d4a43] tracking-tight leading-none">
                Let’s build something
                <br />
                <span className="bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-blue bg-clip-text text-transparent font-extrabold">extraordinary.</span>
              </h2>
              <p className="text-[#6b7280] text-sm sm:text-base max-w-md mx-auto">
                Reach out for collaborative workspaces, full-stack developments, or system design architectures.
              </p>
            </div>
          </ScrollReveal>

          {/* Social Links / Buttons */}
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto flex-wrap">
              
              <a 
                href="https://github.com/ANIKET0102" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-[#2d4a43] bg-white border border-[#c9d5d1] hover:bg-slate-50 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Github size={16} /> GitHub
              </a>

              <a 
                href="https://www.linkedin.com/in/aniketpawar25/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-[#2d4a43] bg-white border border-[#c9d5d1] hover:bg-slate-50 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Linkedin size={16} /> LinkedIn
              </a>

              <a 
                href="https://aniket0102.github.io/portfolio-2026/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-[#2d4a43] bg-white border border-[#c9d5d1] hover:bg-slate-50 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <ExternalLink size={16} className="text-brand-blue" /> Portfolio
              </a>

              <a 
                href="mailto:anipawar9028@gmail.com" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-extrabold text-white bg-brand-orange hover:bg-brand-orange/90 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
              >
                <Mail size={16} /> Email Me
              </a>

            </div>
          </ScrollReveal>

          {/* Back to App Link */}
          <ScrollReveal>
            <div className="pt-8 border-t border-[#e2eae7] flex justify-center items-center text-xs text-[#6b7280]/60 gap-4">
              <div className="flex gap-4">
                <Link to="/dashboard" className="hover:text-[#2d4a43] transition-colors font-bold">Workspace Dashboard</Link>
                <span>&bull;</span>
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#2d4a43] transition-colors font-bold">Back to Top</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </footer>

    </div>
  );
}

export default About;

import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";

const initialValues = {
  GC_Content: "",
  AT_Content: "",
  Num_A: "",
  Num_T: "",
  Num_C: "",
  Num_G: "",
  kmer_3_freq: "",
  Mutation_Flag: "0",
  Class_Label: "1",
};

export default function App() {
  return (
    <div className="min-h-dvh text-slate-200 relative overflow-hidden site-bg">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes subtle-rotate { 0% { transform: translateX(-50%) rotate(0deg);} 100% { transform: translateX(-50%) rotate(360deg);} }
        .dna-background-animation { animation: subtle-rotate 240s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .dna-background-animation { animation: none; }
        }
        /* Global site gradient background to match the provided design */
        .site-bg { 
          background: radial-gradient(120% 120% at 50% 0%, #0b0f1f 0%, #0c1226 35%, #0e1630 65%, #0f1937 85%, #101c3d 100%);
        }
        /* Enhance DNA overlay visibility on dark gradient */
        .dna-visual { filter: brightness(1.2) contrast(1.05) saturate(1.1); mix-blend-mode: screen; }
      `}</style>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">DNA Predictor</Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({isActive})=>isActive?"text-white":"text-slate-400 hover:text-slate-200"}>Home</NavLink>
            <NavLink to="/how-it-works" className={({isActive})=>isActive?"text-white":"text-slate-400 hover:text-slate-200"}>How It Works</NavLink>
            <NavLink to="/about" className={({isActive})=>isActive?"text-white":"text-slate-400 hover:text-slate-200"}>About Us</NavLink>
          </nav>
        </div>
      </header>

      {/* Global subtle DNA background for all pages */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-100">
        <img
          alt="DNA background"
          className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[160%] max-w-none h-auto opacity-25 dna-background-animation dna-visual"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWFD_AD_8NWcwpLpWX16WXu9zmfQmBx5P2qD04-ivbEgDShMKiWsaU5eNuaxmJ72HHhlIXJbLJqHu7-SJgHVXjQphdlrKrhyR2bvh78hxiadSOA_Jsxc9w0dHr-6POB7QthAcHTCySsNIjbtz_wkz069wev-5Ku395yXnUoHakwS4TvpYItLAc-B3wELD9ooc2Bvv2IssRU5ySURrLIcodt-YivsaRmfQv1ngTR-li-VHm0b0bxNOCNLyTmR5qDrNw42J_21OUQjE"
        />
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[140%] opacity-15 dna-background-animation dna-visual">
          <svg className="w-full h-auto text-gray-500" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <path d="M25,10 C50,25 50,75 25,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M75,10 C50,25 50,75 75,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="20" x2="70" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="32" y1="30" x2="68" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="32" y1="70" x2="68" y2="70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="30" y1="80" x2="70" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/10 mt-12">
        © 2024 Health Insights. All rights reserved.
      </footer>
    </div>
  );
}

function Dashboard() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [meta, setMeta] = useState(null);
  const apiBase = useMemo(() => "", []);

  useEffect(() => {
    fetch(`${apiBase}/meta`).then(async (r) => {
      if (r.ok) setMeta(await r.json());
    }).catch(() => {});
  }, [apiBase]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === "" ? null : Number(v)])
      );
      const res = await fetch(`${apiBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setPrediction(json);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes dna-spinner { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .loading-dna { animation: dna-spinner 2s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">DNA Disease Risk Predictor</h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400">AI-powered DNA risk analysis with FastAPI + React</p>
        </div>

        <section className="bg-[#1c1f27]/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary-color)]">genetics</span>
                Input Your DNA Data
              </h2>
              <p className="text-gray-400 mt-2">Enter the DNA sequence features below to get a risk prediction.</p>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FieldDark icon="percent" label="GC_Content (%)" name="GC_Content" value={values.GC_Content} onChange={onChange} step="0.01" placeholder="e.g., 45.5" />
              <FieldDark icon="percent" label="AT_Content (%)" name="AT_Content" value={values.AT_Content} onChange={onChange} step="0.01" placeholder="e.g., 54.5" />
              <FieldDark icon="looks_one" label="Num_A" name="Num_A" value={values.Num_A} onChange={onChange} step="1" placeholder="e.g., 120" />
              <FieldDark icon="looks_two" label="Num_T" name="Num_T" value={values.Num_T} onChange={onChange} step="1" placeholder="e.g., 130" />
              <FieldDark icon="looks_3" label="Num_C" name="Num_C" value={values.Num_C} onChange={onChange} step="1" placeholder="e.g., 110" />
              <FieldDark icon="looks_4" label="Num_G" name="Num_G" value={values.Num_G} onChange={onChange} step="1" placeholder="e.g., 115" />
              <FieldDark icon="grain" label="kmer_3_freq" name="kmer_3_freq" value={values.kmer_3_freq} onChange={onChange} step="0.0001" placeholder="e.g., 0.0123" />
              <FieldDark icon="flag" label="Mutation_Flag (0/1)" name="Mutation_Flag" value={values.Mutation_Flag} onChange={onChange} step="1" min="0" max="1" placeholder="0 or 1" />
              <FieldDark icon="category" label="Class_Label (0/1/2)" name="Class_Label" value={values.Class_Label} onChange={onChange} step="1" min="0" max="2" placeholder="0, 1, or 2" />

              <div className="sm:col-span-2 lg:col-span-3 flex justify-center gap-3">
                <button type="submit" disabled={loading} className="flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-[var(--primary-color)] text-white text-base font-bold tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] focus:ring-offset-[#1c1f27] transition-all duration-300 transform hover:scale-105">
                  <span className="material-symbols-outlined mr-2">bolt</span>
                  {loading ? "Predicting..." : "Predict Risk"}
                </button>
                <button type="button" onClick={() => { setValues(initialValues); setPrediction(null); setError(""); }} className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 hover:bg-white/5">
                  Reset
                </button>
              </div>

              {error && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-red-400/20 bg-red-900/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--primary-color)]">science</span>
            Prediction Result
          </h2>
          <div className="mt-6 bg-gray-800/60 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[144px]">
            {!prediction ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <svg className="loading-dna h-12 w-12 text-[var(--primary-color)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4C8 8 8 16 4 20"></path>
                  <path d="M20 4c-4 4-4 12 0 16"></path>
                  <path d="M6.5 6.5h11"></path>
                  <path d="M6.5 17.5h11"></path>
                  <path d="M8 9.5h8"></path>
                  <path d="M8 14.5h8"></path>
                  <path d="M9.5 12h5"></path>
                </svg>
                <p className="text-lg text-gray-400">Processing your DNA data...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-white">Diabetes Risk: {prediction.prediction}</div>
                {prediction.classes && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Risk Categories</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {prediction.classes.map((c, i) => (
                        <span key={c} className={`inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-sm ${prediction.class_index === i ? "bg-blue-600 text-white" : "bg-slate-900/40 text-slate-300"}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <details className="bg-[#111318]/50 rounded-xl border border-gray-800 group" open>
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary-color)]">model_training</span>
                Model Details
              </h3>
              <div className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </summary>
            <div className="border-t border-gray-800 p-4">
              {!meta ? (
                <div className="text-slate-500 text-sm">Loading...</div>
              ) : (
                <div className="text-gray-400">
                  This model uses a deep learning algorithm trained on a large dataset of DNA sequence features and associated disease risks. It provides a probabilistic risk assessment based on the input data. The architecture is a multi-layer perceptron (MLP) optimized for tabular data.
                  <div className="mt-3 text-sm text-slate-400 space-y-1">
                    <div>Target: <span className="font-medium text-white">{meta.target}</span></div>
                    <div className="truncate">Features: <span className="font-medium text-white">{meta.features?.join(", ")}</span></div>
                  </div>
                </div>
              )}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function Welcome() {
  const navigate = useNavigate();
  return (
    <main className="relative min-h-[calc(100dvh-64px-96px)] flex items-center justify-center text-white">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes pulse-glow { 0%,100%{ box-shadow:0 0 .5rem 0 rgba(19,91,236,.5);} 50%{ box-shadow:0 0 1rem .25rem rgba(19,91,236,.7);} }
        .cta-button-animation { animation: pulse-glow 3s infinite ease-in-out; }
        @keyframes fade-in { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
        .fade-in-title { animation: fade-in 1s ease-out forwards; }
        .fade-in-description { animation: fade-in 1s ease-out .5s forwards; opacity:0; }
      `}</style>
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-20 text-center max-w-3xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white fade-in-title">Welcome to DNA Predictor</h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto fade-in-description">Our AI-powered tool analyzes your DNA sequence data to provide insights into your potential genetic predispositions to certain diseases. Empower your health journey with knowledge.</p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-[var(--primary-color)] text-white text-base font-bold tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] focus:ring-offset-[#1d1f3d] transition-all duration-300 transform hover:scale-105 cta-button-animation">
            <span className="material-symbols-outlined mr-2">bolt</span>
            <span className="truncate">Proceed to Predictor</span>
          </button>
        </div>
        <div className="mt-8 flex justify-center gap-6">
          <Link to="/how-it-works" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">Learn More</Link>
          <span className="text-gray-600">|</span>
          <Link to="/about" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">About Us</Link>
        </div>
      </div>
    </main>
  );
}

function HowItWorks() {
  // Reveal cards on scroll
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.flow-card'));
    const handleScroll = () => {
      const triggerBottom = window.innerHeight * 0.85;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < triggerBottom) {
          card.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="text-gray-300 relative overflow-x-hidden">
      <style>{`
        :root { --primary-color: #135bec; }
        
        .flow-card { opacity: .3; transform: translateY(20px); transition: opacity .6s ease-out, transform .6s ease-out; }
        .flow-card.active { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="relative min-h-[70dvh] w-full">
        <div className="relative z-10 flex h-full grow flex-col px-6 sm:px-10 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-4">A Dynamic Path to Your Health</h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">Our process is a secure, interactive flow designed for clarity and insight. Scroll to discover how we transform your DNA data into a personalized health report.</p>
            </div>

            <div className="space-y-24 md:space-y-32">
              <div className="flow-card active grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"><span className="text-fuchsia-400">Step 1:</span> Secure Data Input</h2>
                  <p className="text-gray-400 text-lg mb-6">Your privacy is paramount. Securely upload your raw DNA data file. We use end-to-end encryption, ensuring your information remains confidential and anonymized.</p>
                  <ul className="space-y-2 text-gray-300 text-left list-none inline-block">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-fuchsia-400">check_circle</span><span>Upload from 23andMe or AncestryDNA</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-fuchsia-400">check_circle</span><span>End-to-End Encryption</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-fuchsia-400">check_circle</span><span>Anonymized Data Processing</span></li>
                  </ul>
                </div>
                <div className="order-1 md:order-2 flex justify-center items-center">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <div className="absolute inset-0 bg-fuchsia-500/10 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-fuchsia-500/20 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-7xl md:text-8xl text-fuchsia-400 transform transition-transform duration-500 hover:scale-110">cloud_upload</span>
                  </div>
                </div>
              </div>

              <div className="flow-card grid md:grid-cols-2 gap-12 items-center">
                <div className="order-1 md:order-2 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"><span className="text-blue-400">Step 2:</span> AI-Powered Analysis</h2>
                  <p className="text-gray-400 text-lg mb-6">Our proprietary AI analyzes your data against a vast database of scientific research. We scan for millions of genetic variants (SNPs) for a comprehensive risk assessment.</p>
                  <ul className="space-y-2 text-gray-300 text-left list-none inline-block">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400">check_circle</span><span>Polygenic Risk Score Calculation</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400">check_circle</span><span>Cross-referenced with Latest Studies</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400">check_circle</span><span>Multi-gene Analysis for Nuance</span></li>
                  </ul>
                </div>
                <div className="order-2 md:order-1 flex justify-center items-center">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-7xl md:text-8xl text-blue-400 transform transition-transform duration-500 hover:rotate-6">psychology</span>
                  </div>
                </div>
              </div>

              <div className="flow-card grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"><span className="text-teal-400">Step 3:</span> Personalized Insights</h2>
                  <p className="text-gray-400 text-lg mb-6">Receive your easy-to-understand report. We translate complex genetic data into clear, actionable insights, empowering you to take proactive health steps.</p>
                  <ul className="space-y-2 text-gray-300 text-left list-none inline-block">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-teal-400">check_circle</span><span>Intuitive Risk Score Visualizations</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-teal-400">check_circle</span><span>Plain-language Explanations</span></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-teal-400">check_circle</span><span>Actionable Preventative Measures</span></li>
                  </ul>
                </div>
                <div className="order-1 md:order-2 flex justify-center items-center">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-teal-500/20 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-7xl md:text-8xl text-teal-400 transform transition-transform duration-500 hover:scale-110">assessment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">© 2024 HealthGenetics. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="relative text-white">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity:1; transform: translateY(0);} }
        .fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        .fade-in-up-delay-1 { animation: fade-in-up 1s ease-out .3s forwards; opacity:0; }
        .fade-in-up-delay-2 { animation: fade-in-up 1s ease-out .6s forwards; opacity:0; }
      `}</style>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white">About Our Mission</h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">We are dedicated to democratizing genetic information. Our goal is to provide accessible, AI-driven insights into genetic predispositions, empowering individuals to take proactive steps towards a healthier future. We believe that understanding your DNA is the first step to personalized wellness.</p>
          </div>

          <div className="fade-in-up-delay-1">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Technology</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">Our platform is built on a robust, modern technology stack. We utilize a <span className="font-semibold text-cyan-400">FastAPI</span> backend for high-performance AI-powered DNA risk analysis and a dynamic <span className="font-semibold text-sky-400">React</span> frontend for a seamless user experience. This combination ensures rapid, secure, and reliable analysis, delivering complex genetic insights in an intuitive interface.</p>
          </div>

          <div className="fade-in-up-delay-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Vision</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">We envision a world where genetic awareness is a cornerstone of public health. By continuing to innovate at the intersection of artificial intelligence and genomics, we aim to pioneer new ways for people to engage with their genetic data, fostering a future of preventative, personalized medicine for everyone.</p>
          </div>
        </div>
      </div>

      <footer className="hidden" />
    </main>
  );
}

function Field({ label, name, value, onChange, ...rest }) {
  return (
    <label className="col-span-2 sm:col-span-1 text-sm">
      <span className="mb-1 block text-slate-600">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="number"
        className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-slate-400 focus:bg-white bg-slate-50"
        {...rest}
      />
    </label>
  );
}

function FieldDark({ icon, label, name, value, onChange, placeholder, ...rest }) {
  return (
    <label className="flex flex-col">
      <span className="font-medium text-gray-300 mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="number"
        placeholder={placeholder}
        className="form-input flex w-full min-w-0 flex-1 rounded-lg text-white bg-[#111318] border border-gray-700 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] placeholder:text-gray-500 p-3 text-base font-normal leading-relaxed transition-all duration-300"
        {...rest}
      />
    </label>
  );
}

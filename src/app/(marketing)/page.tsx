import Link from "next/link";
import {
  Calendar,
  FileText,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  MessageSquare,
  LayoutDashboard,
  UserCheck,
  Bell,
  Pill,
  ArrowRight,
  Check,
  Activity,
  ArrowUpRight,
  Shield,
  Layers,
} from "lucide-react";
import { HeroIllustration } from "@/components/marketing/hero-illustration";
import {
  MotionFadeUp,
  MotionStaggerContainer,
  MotionStaggerItem,
} from "@/components/marketing/motion-wrapper";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#FAF7F2]">
      {/* ── Background Ambient Neutral Blobs ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#F5EFE6]/70 blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-16 pb-24 lg:pt-28 lg:pb-36 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-6 space-y-8 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DED2] shadow-xs text-xs font-medium text-[#111111]">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                <span>Next-Generation Healthcare Architecture</span>
              </div>

              {/* Large Heading: Pure Black */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111111] leading-[1.1]">
                Healthcare, <br />
                Smarter Together.
              </h1>

              {/* Description */}
              <p className="font-sans text-base sm:text-lg text-[#555555] max-w-xl font-normal leading-relaxed">
                SmartCare is a secure healthcare platform that helps patients and doctors manage appointments, medical records and consultations in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href="/signup"
                  className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/doctors"
                  className="btn-secondary text-sm px-8 py-3.5 w-full sm:w-auto"
                >
                  <span>Find Doctor</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Vector Illustration */}
            <div className="lg:col-span-6">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. HOW SMARTCARE WORKS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 border-t border-[#E8DED2] bg-white relative z-10">
        <div className="container mx-auto max-w-6xl space-y-16">
          <MotionFadeUp className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
              How SmartCare Works
            </h2>
            <p className="text-sm sm:text-base text-[#555555]">
              A simplified, four-step clinical pathway built for seamless patient and physician interaction.
            </p>
          </MotionFadeUp>

          <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <MotionStaggerItem className="card-saas p-6 sm:p-7 rounded-[22px] bg-white border border-[#E8DED2] space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#777777] font-bold uppercase tracking-wider">Step 01</span>
                  <h3 className="font-serif text-lg font-bold text-[#111111]">Book Appointment</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Search accredited specialists, select consultation times, and instantly confirm your session.
                </p>
              </div>
            </MotionStaggerItem>

            {/* Step 2 */}
            <MotionStaggerItem className="card-saas p-6 sm:p-7 rounded-[22px] bg-white border border-[#E8DED2] space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#777777] font-bold uppercase tracking-wider">Step 02</span>
                  <h3 className="font-serif text-lg font-bold text-[#111111]">Consult Doctor</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Meet with your attending physician and receive structured diagnosis and clinical encounter notes.
                </p>
              </div>
            </MotionStaggerItem>

            {/* Step 3 */}
            <MotionStaggerItem className="card-saas p-6 sm:p-7 rounded-[22px] bg-white border border-[#E8DED2] space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#777777] font-bold uppercase tracking-wider">Step 03</span>
                  <h3 className="font-serif text-lg font-bold text-[#111111]">Access Medical Records</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Securely view, download, and manage your complete diagnostic lab reports and medical history.
                </p>
              </div>
            </MotionStaggerItem>

            {/* Step 4 */}
            <MotionStaggerItem className="card-saas p-6 sm:p-7 rounded-[22px] bg-white border border-[#E8DED2] space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#777777] font-bold uppercase tracking-wider">Step 04</span>
                  <h3 className="font-serif text-lg font-bold text-[#111111]">AI Health Assistant</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Leverage intelligent symptom analysis and automated health briefings tailored to your care plan.
                </p>
              </div>
            </MotionStaggerItem>
          </MotionStaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. WHY CHOOSE SMARTCARE
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 bg-[#FAF7F2] relative z-10 border-t border-[#E8DED2]">
        <div className="container mx-auto max-w-6xl space-y-16">
          <MotionFadeUp className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
              Why Choose SmartCare
            </h2>
            <p className="text-sm sm:text-base text-[#555555]">
              Built on verified security standards, intuitive usability, and genuine clinical workflows.
            </p>
          </MotionFadeUp>

          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <MotionStaggerItem className="card-saas p-8 rounded-[22px] bg-white border border-[#E8DED2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  Secure Medical Records
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed pl-11">
                Your medical files and lab reports are stored in encrypted cloud storage with database row-level security and temporary signed tokens.
              </p>
            </MotionStaggerItem>

            {/* Card 2 */}
            <MotionStaggerItem className="card-saas p-8 rounded-[22px] bg-white border border-[#E8DED2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  Fast Appointment Booking
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed pl-11">
                Real-time physician schedule synchronization eliminates phone holds and prevents overlapping appointment reservations automatically.
              </p>
            </MotionStaggerItem>

            {/* Card 3 */}
            <MotionStaggerItem className="card-saas p-8 rounded-[22px] bg-white border border-[#E8DED2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  AI Powered Assistance
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed pl-11">
                Intelligent clinical briefings prepare patients before consultations and assist physicians with structured encounter documentation.
              </p>
            </MotionStaggerItem>

            {/* Card 4 */}
            <MotionStaggerItem className="card-saas p-8 rounded-[22px] bg-white border border-[#E8DED2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  Easy Doctor-Patient Communication
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed pl-11">
                Direct channels for consultation status updates, prescription renewals, and comprehensive care follow-up notes.
              </p>
            </MotionStaggerItem>
          </MotionStaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. PLATFORM FEATURES
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 bg-white border-t border-[#E8DED2] relative z-10">
        <div className="container mx-auto max-w-6xl space-y-16">
          <MotionFadeUp className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
              Platform Features
            </h2>
            <p className="text-sm sm:text-base text-[#555555]">
              An all-in-one healthcare infrastructure built with precision and clarity.
            </p>
          </MotionFadeUp>

          <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "Appointment Scheduling",
                desc: "Live calendar slots with conflict prevention and automated confirmations.",
              },
              {
                icon: FileText,
                title: "Medical Records",
                desc: "Encrypted electronic health record storage with on-demand preview and download.",
              },
              {
                icon: Sparkles,
                title: "AI Health Assistant",
                desc: "Intelligent triage summaries and symptom prep to support clinical decisions.",
              },
              {
                icon: MessageSquare,
                title: "Secure Messaging",
                desc: "Protected communication between verified patients and their active care team.",
              },
              {
                icon: Stethoscope,
                title: "Doctor Dashboard",
                desc: "Daily schedule manager, patient charts, and encounter documentation queue.",
              },
              {
                icon: UserCheck,
                title: "Patient Dashboard",
                desc: "Centralized view of upcoming visits, prescriptions, and diagnostic lab reports.",
              },
              {
                icon: Bell,
                title: "Notifications",
                desc: "Real-time alerts for appointment confirmations, notes, and care updates.",
              },
              {
                icon: Pill,
                title: "Prescription Management",
                desc: "Digital prescriptions issued directly by attending physicians upon visit.",
              },
            ].map((feature, i) => (
              <MotionStaggerItem
                key={i}
                className="card-saas p-6 rounded-[22px] bg-white border border-[#E8DED2] space-y-3 hover:-translate-y-1 transition-all group"
              >
                <div className="w-11 h-11 rounded-[14px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center group-hover:bg-[#F5EFE6] transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#111111]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  {feature.desc}
                </p>
              </MotionStaggerItem>
            ))}
          </MotionStaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. PATIENT & DOCTOR SECTION (Illustration Cards)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 bg-[#FAF7F2] relative z-10 border-t border-[#E8DED2]">
        <div className="container mx-auto max-w-6xl space-y-16">
          <MotionFadeUp className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
              Tailored Portals for Every Role
            </h2>
            <p className="text-sm sm:text-base text-[#555555]">
              Purpose-built environments ensuring clarity for patients and high efficiency for healthcare providers.
            </p>
          </MotionFadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Patient Portal Card */}
            <MotionFadeUp className="card-saas p-8 sm:p-10 rounded-[24px] bg-white border border-[#E8DED2] flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="badge-neutral">Patient Experience</span>
                  <h3 className="font-serif text-2xl font-bold text-[#111111]">
                    Patient Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    Manage appointments, download diagnostic records, and track health history in one secure interface.
                  </p>
                </div>

                {/* Patient Portal UI Illustration */}
                <div className="p-4 rounded-[18px] bg-[#FAF7F2] border border-[#E8DED2] space-y-3">
                  {/* Mock item 1: Calendar */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">Upcoming: Annual Physical</span>
                    </div>
                    <span className="text-[10px] text-[#111111] bg-[#FAF7F2] border border-[#E8DED2] px-2 py-0.5 rounded-full font-medium">Tomorrow, 9:00 AM</span>
                  </div>

                  {/* Mock item 2: Medical History */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">Lipid Diagnostic Panel</span>
                    </div>
                    <span className="text-[10px] text-[#777777]">Verified &bull; Oct 10</span>
                  </div>

                  {/* Mock item 3: Health Graph */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#111111]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#111111]" />
                        Vitals Steady
                      </span>
                      <span className="text-[#111111] font-mono text-[10px]">Optimal</span>
                    </div>
                    <div className="w-full bg-[#E8DED2] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#111111] h-full w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/signup"
                className="btn-primary text-xs w-full py-3 justify-center"
              >
                <span>Explore Patient Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MotionFadeUp>

            {/* Right: Doctor Portal Card */}
            <MotionFadeUp delay={0.2} className="card-saas p-8 sm:p-10 rounded-[24px] bg-white border border-[#E8DED2] flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="badge-neutral">Physician Workstation</span>
                  <h3 className="font-serif text-2xl font-bold text-[#111111]">
                    Doctor Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    Review patient appointments, document clinical consultations, and manage medical charts effortlessly.
                  </p>
                </div>

                {/* Doctor Portal UI Illustration */}
                <div className="p-4 rounded-[18px] bg-[#FAF7F2] border border-[#E8DED2] space-y-3">
                  {/* Mock item 1: Dashboard */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">Today&apos;s Schedule</span>
                    </div>
                    <span className="text-[10px] text-[#111111] bg-[#FAF7F2] border border-[#E8DED2] px-2 py-0.5 rounded-full font-medium">4 Scheduled</span>
                  </div>

                  {/* Mock item 2: Patient List */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">Patient Intake Queue</span>
                    </div>
                    <span className="text-[10px] text-[#777777]">Active Records</span>
                  </div>

                  {/* Mock item 3: Consultation Summary */}
                  <div className="p-3 rounded-[12px] bg-white border border-[#E8DED2] space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#111111]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#111111]" />
                        Encounter Documentation
                      </span>
                      <span className="text-[10px] text-[#777777] font-mono">SOAP Note</span>
                    </div>
                    <p className="text-[10px] text-[#555555] line-clamp-1">Assessment &bull; Normal recovery trajectory recorded</p>
                  </div>
                </div>
              </div>

              <Link
                href="/signup"
                className="btn-primary text-xs w-full py-3 justify-center"
              >
                <span>Explore Doctor Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MotionFadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. CTA SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 bg-white border-t border-[#E8DED2] relative z-10">
        <div className="container mx-auto max-w-4xl">
          <MotionFadeUp className="p-8 sm:p-14 rounded-[24px] bg-[#FAF7F2] border border-[#E8DED2] text-center space-y-6 shadow-sm">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#111111] max-w-2xl mx-auto leading-tight">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-sm sm:text-base text-[#555555] max-w-xl mx-auto leading-relaxed">
              Create your SmartCare account and securely manage your healthcare from anywhere.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto shadow-md"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="btn-secondary text-sm px-8 py-3.5 w-full sm:w-auto"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </MotionFadeUp>
        </div>
      </section>
    </div>
  );
}

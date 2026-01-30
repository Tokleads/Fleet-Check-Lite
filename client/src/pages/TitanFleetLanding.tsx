import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  MapPin,
  Clock,
  ClipboardCheck,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  Phone,
  Star,
  Shield,
  Truck,
  Users,
  Building2,
  Zap,
  Instagram,
  Facebook,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function TitanFleetLandingPage() {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6"
            >
              <Truck className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                Built by a Class 1 Driver
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Fleet Compliance,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                Driver Hours & GPS
              </span>{" "}
              — All in One Platform
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            >
              DVSA-compliant vehicle inspections, geofenced clock in/out, live
              tracking, and timesheet exports. Purpose-built for UK transport
              operators.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center h-14 px-8 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                data-testid="button-view-pricing"
              >
                View Pricing Plans
              </button>
              <Link href="/manager/login">
                <span className="inline-flex items-center justify-center h-14 px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300">
                  Login
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium">DVSA-Aligned Framework</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Built by a Class 1 Driver</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">UK-Built</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            >
              Everything You Need to Run a Compliant Fleet
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              From daily inspections to payroll-ready timesheets, Titan Fleet
              handles the heavy lifting.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MapPin,
                title: "GPS Tracking & Live Dashboard",
                description:
                  "Real-time location tracking with stagnation alerts. Know where every vehicle is, always.",
              },
              {
                icon: Clock,
                title: "Driver Clock In/Out with Geofencing",
                description:
                  "Automatic clock in/out when drivers enter designated depot zones. No manual entry required.",
              },
              {
                icon: ClipboardCheck,
                title: "Digital Vehicle Inspections",
                description:
                  "DVSA-compliant walk-around checks with photo capture and instant defect reporting.",
              },
              {
                icon: FileSpreadsheet,
                title: "Timesheet & Wage Exports",
                description:
                  "Export payroll-ready CSV files with calculated hours, breaks, and overtime.",
              },
              {
                icon: AlertTriangle,
                title: "Defect Management",
                description:
                  "Track, assign, and resolve vehicle defects with full audit trail and status updates.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                data-testid={`feature-card-${index}`}
              >
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              18-month contract. No hidden fees. Cancel anytime after commitment
              period.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {/* Starter Plan */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300"
              data-testid="pricing-card-starter"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Starter</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">£49</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Perfect for small transport companies and owner-operators
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 5 drivers",
                  "Up to 10 vehicles",
                  "Basic GPS tracking",
                  "Geofenced clock in/out",
                  "Digital inspections (DVSA compliant)",
                  "Defect management",
                  "Email support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full h-12 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                data-testid="button-starter-trial"
              >
                Start Free Trial
              </button>
            </motion.div>

            {/* Professional Plan */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-2xl p-8 shadow-xl relative overflow-hidden"
              data-testid="pricing-card-professional"
            >
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3" />
                MOST POPULAR
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-blue-200" />
                <h3 className="text-xl font-bold text-white">Professional</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">£149</span>
                <span className="text-blue-200">/month</span>
              </div>
              <p className="text-sm text-blue-100 mb-6">
                Ideal for mid-sized fleet operators
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 25 drivers",
                  "Up to 50 vehicles",
                  "Everything in Starter, plus:",
                  "Live tracking dashboard",
                  "Stagnation alerts (30-min threshold)",
                  "Timesheet CSV export (payroll ready)",
                  "Document management",
                  "Titan Intelligence alerts",
                  "Priority email support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-white text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full h-12 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                data-testid="button-professional-subscribe"
              >
                Subscribe Now
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300"
              data-testid="pricing-card-enterprise"
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Enterprise</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">£349</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Built for large fleet operators
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited drivers",
                  "Unlimited vehicles",
                  "Everything in Professional, plus:",
                  "Driver safety scoring",
                  "Advanced analytics",
                  "Custom depot locations (unlimited)",
                  "API access",
                  "Dedicated account manager",
                  "Phone support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full h-12 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                data-testid="button-enterprise-subscribe"
              >
                Subscribe Now
              </button>
            </motion.div>
          </motion.div>

          {/* Add-ons Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
              Optional Add-ons
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Mobile Driver App",
                  price: "+£29/month",
                  description: "Native iOS & Android apps for drivers",
                },
                {
                  name: "Advanced Reporting",
                  price: "+£49/month",
                  description: "Custom reports & analytics dashboards",
                },
                {
                  name: "SMS Notifications",
                  price: "£0.05 per SMS",
                  description: "Real-time alerts via text message",
                },
                {
                  name: "Training & Onboarding",
                  price: "£299 one-time",
                  description: "Hands-on setup and team training",
                },
              ].map((addon, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-xl bg-slate-50"
                  data-testid={`addon-card-${i}`}
                >
                  <p className="font-semibold text-slate-900">{addon.name}</p>
                  <p className="text-blue-600 font-bold my-1">{addon.price}</p>
                  <p className="text-sm text-slate-500">{addon.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Direct Line Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden">
                <img 
                  src="/attached_assets/thumbnail_1768666431038.png" 
                  alt="Jon - Founder" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.textContent = 'JC'; }}
                  data-testid="founder-image"
                />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Questions? Talk to the Founder.
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              I'm Jon, a Class 1 driver who built Titan Fleet because I knew
              transport operators deserved better tools.
            </p>
            <a
              href="tel:07496188541"
              className="inline-flex items-center gap-2 h-14 px-8 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              data-testid="button-call-jon"
            >
              <Phone className="h-5 w-5" />
              Call Jon
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                TF
              </div>
              <span className="text-xl">
                <span className="font-bold text-white">Titan</span>
                <span className="font-normal text-slate-400 ml-1">Fleet</span>
              </span>
            </div>

            <div className="flex gap-6 text-sm">
              <Link href="/privacy">
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy
                </span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms
                </span>
              </Link>
              <Link href="/contact">
                <span className="hover:text-white transition-colors cursor-pointer">
                  Contact
                </span>
              </Link>
            </div>

            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            <p>© {new Date().getFullYear()} Titan Fleet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

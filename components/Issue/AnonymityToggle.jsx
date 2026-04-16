import {
  Shield,
  Mail,
  AlertCircle,
  Lock,
  Bell,
  Award,
  Lightbulb,
  EyeOff,
} from "lucide-react";

const AnonymityToggle = ({ formData, setFormData, errors }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">

      {/* ── Gradient top accent ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

      {/* ── Subtle inner glow ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-cyan-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 pointer-events-none" />

      <div className="relative p-6 sm:p-8 space-y-6">

        {/* ── Heading ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              Privacy &amp; Contact
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Control how your identity appears on this report
            </p>
          </div>
        </div>

        {/* ── Anonymity toggle card ── */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/70 dark:border-emerald-700/40 bg-gradient-to-br from-teal-50/80 to-emerald-50/60 dark:from-slate-800/80 dark:to-slate-700/50">
          {/* Left accent strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500" />

          <div className="pl-5 pr-5 py-5 flex items-center justify-between gap-4" data-tutorial="anonymity-toggle">
            {/* Left: info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-700/60 border border-emerald-200 dark:border-emerald-700/40 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                  Report Anonymously
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your identity stays private while CityPoints are still credited to your account.
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <Shield size={11} />
                  Your privacy is protected
                </div>
              </div>
            </div>

            {/* Right: Toggle */}
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isAnonymous: !formData.isAnonymous })
              }
              aria-pressed={formData.isAnonymous}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-200/60 dark:focus:ring-emerald-800/40 ${
                formData.isAnonymous
                  ? "bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 border-emerald-500 shadow-md shadow-emerald-500/30"
                  : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              }`}
            >
              <span
                className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out mt-px ${
                  formData.isAnonymous ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contact</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Email input ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide"
            >
              Additional Email Address
            </label>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>

          <div className="relative" data-tutorial="anonymity-email">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              size={16}
            />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, additionalEmail: e.target.value })
              }
              placeholder="your.email@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                errors.additionalEmail
                  ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30 dark:bg-red-950/10"
                  : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
              } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
            />
          </div>
          {errors.additionalEmail && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
              <AlertCircle size={13} />
              {errors.additionalEmail}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Receive status updates and resolution notifications
          </p>
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Why CityCare?</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Lock,
              label: "Secure",
              desc: "Your data is encrypted and never shared",
              gradFrom: "from-blue-500",
              gradTo: "to-blue-600",
              shadow: "shadow-blue-500/25",
              border: "border-blue-200/60 dark:border-blue-700/30",
              bg: "from-blue-50/70 dark:from-blue-950/20",
            },
            {
              icon: Bell,
              label: "Updates",
              desc: "Get notified on progress and resolution",
              gradFrom: "from-emerald-500",
              gradTo: "to-emerald-600",
              shadow: "shadow-emerald-500/25",
              border: "border-emerald-200/60 dark:border-emerald-700/30",
              bg: "from-emerald-50/70 dark:from-emerald-950/20",
            },
            {
              icon: Award,
              label: "Recognition",
              desc: "Earn CityPoints and badges for helping",
              gradFrom: "from-cyan-500",
              gradTo: "to-cyan-600",
              shadow: "shadow-cyan-500/25",
              border: "border-cyan-200/60 dark:border-cyan-700/30",
              bg: "from-cyan-50/70 dark:from-cyan-950/20",
            },
          ].map(({ icon: Icon, label, desc, gradFrom, gradTo, shadow, border, bg }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${bg} via-transparent to-white/60 dark:to-slate-900/60 p-5 hover:shadow-lg ${shadow} hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center mb-3 shadow-md ${shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{label}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Amber tip banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 dark:border-amber-700/40 bg-amber-50/70 dark:bg-amber-900/15">
          {/* Left accent strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400" />
          <div className="flex gap-3 items-start pl-5 pr-4 py-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                Why provide contact info?
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-400/80 leading-relaxed">
                While optional, sharing your email helps us reach out for clarification
                and keeps you informed about resolution. It also builds community trust
                and accountability.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnonymityToggle;

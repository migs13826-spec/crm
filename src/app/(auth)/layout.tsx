export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">MailCRM</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Your marketing<br />campaigns,<br />simplified.
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-sm">
              Manage contacts, create beautiful email campaigns, set up automations, and track your results -- all in one place.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {["#6366F1", "#8B5CF6", "#EC4899", "#3B82F6"].map((color, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-700 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: color }}>
                    {["SL", "JD", "MK", "AW"][i]}
                  </div>
                ))}
              </div>
              <p className="text-indigo-200 text-xs">
                Trusted by 2,000+ marketing teams
              </p>
            </div>
          </div>
          <p className="text-indigo-300 text-xs">
            Powered by Brevo
          </p>
        </div>
      </div>
      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}

type LandingPreloaderProps = {
  label: string;
};

export function LandingPreloader({ label }: LandingPreloaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex min-h-screen items-center justify-center bg-[#07080d] px-6 text-center text-white"
    >
      <div className="flex flex-col items-center">
        <p className="text-xl font-black tracking-[-0.045em] text-slate-100 sm:text-2xl">
          Courier
          <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Dash
          </span>
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">{label}</p>
        <span
          aria-hidden="true"
          className="landing-preloader-spinner mt-5 block size-8 rounded-full"
        />
      </div>
    </div>
  );
}

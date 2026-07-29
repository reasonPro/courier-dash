import type { LandingV1Copy } from "../../../lib/landing-translations";

type LandingFooterProps = {
  copy: LandingV1Copy;
  onRegister: () => void;
  onSignIn: () => void;
};

export function FinalCta({ copy, onRegister, onSignIn }: LandingFooterProps) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-sky-500/10 via-violet-500/10 to-fuchsia-500/10 px-6 py-14 text-center shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:px-12 sm:py-20">
        <div aria-hidden="true" className="absolute inset-0 landing-grid-mask opacity-30" />
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="relative">
          <h2 className="mx-auto max-w-4xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">{copy.cta.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty leading-7 text-slate-300">{copy.cta.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={onRegister} className="landing-primary-button min-h-12 px-7">{copy.cta.primary}<span aria-hidden="true">→</span></button>
            <button type="button" onClick={onSignIn} className="landing-secondary-button min-h-12 px-7">{copy.cta.secondary}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter({ copy }: { copy: LandingV1Copy }) {
  return (
    <footer className="border-t border-white/8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <p className="text-xl font-black tracking-tight text-white">Courier<span className="landing-gradient-text">Dash</span></p>
          <p className="mt-3 text-sm leading-6 text-slate-500">{copy.footer.description}</p>
        </div>
        <nav aria-label={copy.footer.ariaLabel} className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400">
          <a href="#product" className="transition hover:text-white">{copy.footer.product}</a>
          <a href="#features" className="transition hover:text-white">{copy.footer.features}</a>
          <a href="#how-it-works" className="transition hover:text-white">{copy.footer.howItWorks}</a>
          <a href="#faq" className="transition hover:text-white">{copy.footer.faq}</a>
        </nav>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/6 pt-6 text-xs text-slate-600 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} CourierDash.</p>
        <p>{copy.footer.rights}</p>
      </div>
    </footer>
  );
}

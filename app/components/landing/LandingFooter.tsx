import type { LandingV2Copy } from "../../../lib/landing-translations";
import { ScrollReveal } from "./LandingMotion";

export function FinalCta({ copy, onRegister, onSignIn }: { copy: LandingV2Copy; onRegister: () => void; onSignIn: () => void }) {
  return (
    <section className="px-4 pb-16 pt-5 sm:px-6 sm:pb-20 lg:px-8">
      <ScrollReveal className="mx-auto max-w-7xl">
        <div className="night-cta relative overflow-hidden rounded-[2rem] border border-cyan-300/12 bg-[#0a0d16]/82 px-5 py-12 text-center shadow-[0_32px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:px-8 sm:py-14">
          <div aria-hidden="true" className="absolute inset-x-[12%] -top-24 h-48 rounded-full bg-violet-500/18 blur-[80px]" />
          <div className="relative mx-auto max-w-3xl"><p className="landing-eyebrow">CourierDash</p><h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-5xl">{copy.cta.title}</h2><p className="mx-auto mt-4 max-w-xl text-pretty leading-7 text-slate-400">{copy.cta.description}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={onRegister} className="landing-primary-button min-h-12 px-6">{copy.cta.primary}<span aria-hidden="true">→</span></button><button type="button" onClick={onSignIn} className="landing-secondary-button min-h-12 px-6">{copy.cta.secondary}</button></div></div>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function LandingFooter({ copy }: { copy: LandingV2Copy }) {
  return (
    <footer className="relative z-10 border-t border-white/[0.065] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md"><a href="#top" className="text-lg font-black tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Courier<span className="night-gradient-text">Dash</span></a><p className="mt-1.5 text-xs leading-5 text-slate-600">{copy.footer.description}</p></div>
        <nav aria-label={copy.footer.ariaLabel} className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500"><a className="hover:text-white" href="#product">{copy.footer.product}</a><a className="hover:text-white" href="#features">{copy.footer.features}</a><a className="hover:text-white" href="#how-it-works">{copy.footer.howItWorks}</a><a className="hover:text-white" href="#faq">{copy.footer.faq}</a></nav>
      </div>
      <div className="mx-auto mt-5 flex max-w-7xl items-center justify-between border-t border-white/[0.05] pt-4 text-[10px] text-slate-700"><span>© {new Date().getFullYear()} CourierDash</span><span>{copy.footer.rights}</span></div>
    </footer>
  );
}

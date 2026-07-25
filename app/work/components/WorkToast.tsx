import type { ToastMessage } from "../work-page.types";

type WorkToastProps = {
  toast: ToastMessage | null;
};

export function WorkToast({ toast }: WorkToastProps) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${toast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
      {toast && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md font-medium text-sm text-white
          ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50' :
            toast.type === 'warning' ? 'bg-yellow-900/80 border-yellow-500/50 text-yellow-100' :
            'bg-green-900/80 border-green-500/50'}
        `}>
          <span className="text-xl">{toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '🔒' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

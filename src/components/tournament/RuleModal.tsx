"use client";
export default function RulesModal({ isOpen, onClose, rules }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
      <div className="bg-gray-900 border border-yellow-500/30 p-6 rounded-3xl w-full max-w-sm">
        <h2 className="text-xl font-black text-yellow-500 italic mb-4 uppercase">Battle Rules</h2>
        <div className="text-gray-300 text-sm space-y-3 mb-6 max-h-60 overflow-y-auto italic">
          {rules || "No Cheating, No Hacks. Violation results in permanent ban without refund."}
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl uppercase tracking-tighter"
        > I UNDERSTAND </button>
      </div>
    </div>
  );
}


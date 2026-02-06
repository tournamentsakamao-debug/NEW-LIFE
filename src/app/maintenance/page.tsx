"use client";
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
      >
        <span className="text-black text-3xl font-black italic">!</span>
      </motion.div>
      <h1 className="text-2xl font-black italic text-white uppercase mb-2 tracking-tighter">System Upgrade</h1>
      <p className="text-gray-500 text-xs uppercase tracking-widest leading-loose">
        Admin is optimizing the arena for a better experience. <br/> We will be back shortly.
      </p>
    </div>
  );
}


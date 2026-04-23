'use client'

import React from 'react';
import { ShieldCheck, Award, CheckCircle2, UserCheck, Star, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CounsellorTrustCardProps {
  onPay?: () => void;
  onSchedule?: () => void;
  showButtons?: boolean;
}

const CounsellorTrustCard: React.FC<CounsellorTrustCardProps> = ({ onPay, onSchedule, showButtons = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] group">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px] group-hover:bg-red-500/10 transition-colors duration-700" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Content Side */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-full border border-red-100/50 shadow-sm">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-red-100 flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-black text-red-700 uppercase tracking-widest">Trust & Quality Program</span>
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  Get Certified & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                    Build Student Trust
                  </span>
                </h2>
                
                <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
                  To maintain quality and trust on our platform, counselors are required to take a simple assessment test. 
                  Once you successfully complete the test, you will receive a 
                  <span className="text-slate-900 font-bold px-1.5 py-0.5 bg-red-50 rounded-md mx-1 border border-red-100/50">Verified Badge</span> 
                  on your profile and a 
                  <span className="text-slate-900 font-bold px-1.5 py-0.5 bg-orange-50 rounded-md mx-1 border border-orange-100/50">certificate</span> 
                  recognizing you as a Certified Counselor on Eduroutez.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: ShieldCheck, title: "Verified Badge", desc: "Digital trust mark", color: "text-red-600", bg: "bg-red-50" },
                  { icon: Award, title: "Certified Expert", desc: "Official certification", color: "text-orange-600", bg: "bg-orange-50" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 transition-all hover:shadow-lg hover:border-white hover:bg-white group/item">
                    <div className={`p-3 ${item.bg} rounded-2xl shadow-sm group-hover/item:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-slate-700 text-sm font-semibold">
                    This helps students to interact freely with trusted and qualified experts.
                  </p>
                </div>

                {showButtons && (
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Button
                      onClick={onPay}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 border-none transition-all hover:translate-y-[-4px] active:translate-y-0 h-14 px-8 rounded-2xl font-black text-lg group/btn"
                    >
                      Pay & Give Test Now
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                    <Button
                      onClick={onSchedule}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 transition-all font-black h-14 px-8 rounded-2xl border-2 flex items-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Pay & Schedule
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Side */}
            <div className="shrink-0 w-full lg:w-[400px] flex justify-center relative">
              <div className="relative group/visual">
                {/* Main Card Mockup */}
                <div className="relative w-72 h-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 flex flex-col items-center justify-between z-20 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-orange-500" />
                  
                  <div className="space-y-6 flex flex-col items-center w-full">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center relative overflow-hidden border-4 border-white shadow-inner">
                      <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                      <img 
                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffdfbf" 
                        alt="Counselor Avatar"
                        className="w-full h-full object-cover relative z-10 scale-125"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="h-3 w-3/4 bg-slate-100 rounded-full mx-auto" />
                      <div className="h-3 w-1/2 bg-slate-50 rounded-full mx-auto" />
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg shadow-red-200">
                      <ShieldCheck className="w-4 h-4" />
                      VERIFIED COUNSELOR
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <Award className="w-3 h-3" />
                      Eduroutez Certified
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 animate-bounce duration-[4000ms]">
                   <Award className="w-8 h-8 text-orange-500" />
                </div>
                <div className="absolute top-1/2 -left-12 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 z-10 rotate-[-15deg] animate-pulse">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white fill-white" />
                     </div>
                     <div className="text-[10px] font-black text-slate-900 uppercase">TOP RATED</div>
                   </div>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-50 rounded-full blur-[60px] opacity-50" />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CounsellorTrustCard;

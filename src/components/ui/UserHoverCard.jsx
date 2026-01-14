import { Link } from "react-router-dom";
import { Trophy, Calendar, Star, User } from "lucide-react";
import UserAvatar from "./UserAvatar";

import { useLanguage } from "../../context/LanguageContext";

const UserHoverCard = ({ user, children }) => {
  const { t } = useLanguage();

  if (!user) return <>{children}</>;

  // Data fallback
  const level = user.level || 1;
  const xp = user.xp || 0;
  const joinDate = user.created_at || new Date();
  const name = user.name || "User";
  const username = user.username || "username";

  return (
    <div className="relative inline-block group/card max-w-full">
      {/* Trigger Element */}
      <div className="cursor-pointer relative z-10 block">{children}</div>

      {/* --- POP-UP CARD --- */}
      <div
        className="
          invisible opacity-0 group-hover/card:visible group-hover/card:opacity-100 
          transition-all duration-200 ease-out 
          z-[100] pointer-events-none group-hover/card:pointer-events-auto
          
          /* MOBILE: Fixed di tengah layar */
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72
          
          /* DESKTOP (md ke atas): Absolute di bawah elemen */
          md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:translate-y-0
          md:mt-2
      "
      >
        {/* Bridge (Area transparan di ATAS kartu agar hover tidak putus - Desktop Only) */}
        <div className="hidden md:block absolute w-full h-4 -top-4 left-0 bg-transparent"></div>

        {/* Arrow Pointer (SEGITIGA DI ATAS - Desktop Only) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-200 z-20"></div>

        {/* Overlay Background (Mobile Only - Optional biar fokus) */}
        <div className="md:hidden fixed inset-0 bg-black/20 -z-10 rounded-xl"></div>

        {/* Card Content */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/10 text-left relative z-10">
          {/* Banner */}
          <div
            className={`h-16 w-full bg-gradient-to-r ${
              name.length % 2 === 0
                ? "from-indigo-500 via-purple-500 to-pink-500"
                : "from-blue-500 via-cyan-500 to-teal-500"
            }`}
          ></div>

          <div className="px-4 pb-4 relative">
            {/* Avatar (Floating Over Banner) */}
            {/* Perbaikan posisi top: -top-10 agar pas setengah di banner */}
            <div className="absolute -top-20 left-4  bg-white rounded-full shadow-sm">
              <UserAvatar user={user} size="lg" />
              {/* Online Indicator */}
              <div className="absolute bottom-0 z-20 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="mt-8 mb-3">
              <h3 className="text-lg font-bold text-slate-800 leading-tight truncate">
                {name}
              </h3>
              <p className="text-slate-500 font-medium text-xs truncate">
                @{username}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {t("dashboard.level")}
                </span>
                <span className="text-sm font-black text-slate-700">
                  {level}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {t("globalLeaderboard.xp")}
                </span>
                <span className="text-sm font-black text-slate-700">{xp}</span>
              </div>
            </div>

            {/* Footer Button */}
            <Link
              to={`/@${username}`}
              className="block w-full py-2 bg-slate-800 text-white text-center rounded-lg font-bold text-xs hover:bg-slate-900 transition shadow-md"
            >
              {t("navbar.viewProfile")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHoverCard;

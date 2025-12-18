import React from "react";
import { Crown, Sparkles } from "lucide-react";

const UserAvatar = ({ user, size = "md", className = "" }) => {
  // 1. Konfigurasi Ukuran
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-20 h-20 text-2xl",
    xl: "w-28 h-28 text-4xl",
    "2xl": "w-36 h-36 text-5xl",
  };

  // 2. Logic Cari Frame
  const getFrameId = () => {
    if (!user?.equipped_items || user.equipped_items.length === 0)
      return "none";

    const foundFrame = user.equipped_items.find((entry) => {
      if (entry.item && entry.item.type === "avatar_frame") return true;
      if (entry.type === "avatar_frame") return true;
      return false;
    });

    if (!foundFrame) return "none";
    return foundFrame.item?.asset_url || foundFrame.asset_url || "none";
  };

  const frameId = getFrameId();

  // 3. Style Frame yang DIPERBAIKI dengan efek 3D
  const getFrameStyles = (id) => {
    const baseStyle = "relative w-full h-full rounded-full flex items-center justify-center overflow-visible z-10 transform-gpu";
    
    switch (id) {
      case "frame_wooden":
        return `${baseStyle} 
          p-[5px]
          bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#8B4513]
          border-[4px] border-[#5D4037]
          shadow-[inset_0_3px_6px_rgba(255,255,255,0.2),
                  inset_0_-3px_6px_rgba(0,0,0,0.4),
                  0_8px_20px_rgba(93,64,55,0.6)]
          relative before:absolute before:inset-0 before:rounded-full before:border-[1px] before:border-[#D7CCC8]/30
          after:absolute after:inset-[-2px] after:rounded-full after:border-[1px] after:border-[#3E2723]/40
          animate-wood-grain`;

      case "frame_silver":
        return `${baseStyle}
          p-[4px]
          bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400
          border-[3px] border-gray-400
          shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),
                  inset_0_-2px_8px_rgba(0,0,0,0.1),
                  0_8px_25px_rgba(148,163,184,0.7),
                  0_0_0_1px_rgba(255,255,255,0.3)]
          animate-metallic-shine`;

      case "frame_gold":
        return `${baseStyle}
          p-[5px]
          bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600
          border-[3px] border-yellow-700
          shadow-[inset_0_4px_12px_rgba(255,255,255,0.5),
                  inset_0_-4px_12px_rgba(180,83,9,0.4),
                  0_12px_35px_rgba(234,179,8,0.7),
                  0_0_0_2px_rgba(255,215,0,0.4)]
          animate-gold-glow
          relative before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8)_0%,transparent_70%)] before:opacity-30`;

      case "frame_neon_blue":
        return `${baseStyle}
          p-[4px]
          bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600
          border-[2px] border-cyan-300
          shadow-[inset_0_0_15px_rgba(6,182,212,0.6),
                  0_0_35px_#06b6d4,
                  0_0_70px_rgba(59,130,246,0.8)]
          animate-neon-pulse
          relative before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8)_0%,transparent_70%)] before:opacity-40`;

      case "frame_neon_red":
        return `${baseStyle}
          p-[4px]
          bg-gradient-to-br from-red-500 via-pink-600 to-red-400
          border-[2px] border-red-400
          shadow-[inset_0_0_15px_rgba(239,68,68,0.6),
                  0_0_40px_#ef4444,
                  0_0_80px_rgba(219,39,119,0.7)]
          animate-neon-pulse
          relative before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8)_0%,transparent_70%)] before:opacity-40`;

      case "frame_glitch":
        return `${baseStyle}
          p-[3px]
          bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600
          border-[2px] border-dashed border-emerald-300
          shadow-[0_8px_25px_rgba(16,185,129,0.5),
                  0_0_0_1px_rgba(236,72,153,0.3)]
          animate-glitch-3d
          relative before:absolute before:inset-[-1px] before:rounded-full before:bg-[conic-gradient(from_0deg,transparent_0deg,#06b6d4_90deg,transparent_180deg,#ec4899_270deg)] before:opacity-60 before:animate-conic-spin`;

      case "frame_galaxy":
        return `${baseStyle}
          p-[4px]
          bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600
          border-[1px] border-transparent
          shadow-[inset_0_0_20px_rgba(139,92,246,0.5),
                  0_0_45px_rgba(168,85,247,0.7),
                  0_0_90px_rgba(236,72,153,0.4)]
          animate-galaxy-3d
          relative before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_70%)] before:animate-pulse`;

      case "frame_crown":
        return `${baseStyle}
          p-[4px]
          bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600
          border-[3px] border-yellow-700
          shadow-[inset_0_3px_10px_rgba(255,255,255,0.4),
                  inset_0_-3px_10px_rgba(180,83,9,0.3),
                  0_10px_30px_rgba(234,179,8,0.6),
                  0_0_0_2px_rgba(255,215,0,0.3)]
          animate-crown-royal`;

      default:
        return `${baseStyle} 
          p-[2px]
          bg-gradient-to-br from-gray-100 to-gray-200
          border-[2px] border-gray-300/60
          shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),
                  0_4px_12px_rgba(0,0,0,0.1)]`;
    }
  };

  const renderExtras = (id) => {
    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
      "2xl": 40,
    };

    if (id === "frame_crown") {
      return (
        <>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-xl z-30">
            <Crown 
              size={iconSizes[size]} 
              className="fill-yellow-500/40 animate-crown-float"
            />
          </div>
          <div className="absolute inset-0 rounded-full border border-yellow-300/30 animate-ping-slow pointer-events-none" />
        </>
      );
    }
    if (id === "frame_galaxy") {
      return (
        <>
          <div className="absolute -top-2 -left-2 text-purple-300 animate-orbit-1 z-30">
            <Sparkles size={iconSizes[size] * 0.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 text-pink-300 animate-orbit-2 z-30">
            <Sparkles size={iconSizes[size] * 0.5} />
          </div>
        </>
      );
    }
    if (id === "frame_gold") {
      return (
        <div className="absolute -top-1 -right-1 text-yellow-400 animate-bounce z-30">
          <Sparkles size={iconSizes[size] * 0.4} />
        </div>
      );
    }
    if (id === "frame_neon_blue") {
      return (
        <div className="absolute -bottom-1 -left-1 text-cyan-300 animate-bounce-slow z-30">
          <Sparkles size={iconSizes[size] * 0.4} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      <div className={getFrameStyles(frameId)}>
        {/* Avatar Content - Tetap Bulat Sempurna */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-bold border-2 border-white/40 relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div className={`${user?.avatar_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
            <span className="select-none font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
          
          {/* Highlight 3D */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-white/10 pointer-events-none" />
        </div>
      </div>
      {renderExtras(frameId)}
    </div>
  );
};

// CSS Animations untuk efek 3D
const GlobalStyles = () => (
  <style jsx global>{`
    /* Efek 3D untuk Wooden */
    @keyframes wood-grain {
      0% { background-position: 0% 0%; }
      100% { background-position: 100px 100px; }
    }
    .animate-wood-grain {
      background-size: 100px 100px;
      background-image: repeating-linear-gradient(
        45deg,
        rgba(139, 69, 19, 0.1) 0px,
        rgba(139, 69, 19, 0.1) 1px,
        transparent 1px,
        transparent 10px
      );
      animation: wood-grain 20s linear infinite;
    }

    /* Efek logam berkilau */
    @keyframes metallic-shine {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.2); }
    }
    .animate-metallic-shine {
      animation: metallic-shine 3s ease-in-out infinite;
    }

    /* Glow emas */
    @keyframes gold-glow {
      0%, 100% { 
        box-shadow: inset 0 4px 12px rgba(255,255,255,0.5),
                    inset 0 -4px 12px rgba(180,83,9,0.4),
                    0 12px 35px rgba(234,179,8,0.7),
                    0 0 0 2px rgba(255,215,0,0.4);
      }
      50% { 
        box-shadow: inset 0 4px 12px rgba(255,255,255,0.6),
                    inset 0 -4px 12px rgba(180,83,9,0.5),
                    0 15px 45px rgba(234,179,8,0.9),
                    0 0 0 3px rgba(255,215,0,0.6);
      }
    }
    .animate-gold-glow {
      animation: gold-glow 2s ease-in-out infinite;
    }

    /* Pulse neon */
    @keyframes neon-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    .animate-neon-pulse {
      animation: neon-pulse 1.5s ease-in-out infinite;
    }

    /* Efek glitch 3D */
    @keyframes glitch-3d {
      0%, 100% { 
        transform: translate(0, 0) rotate(0deg);
        filter: hue-rotate(0deg);
      }
      33% { 
        transform: translate(1px, -1px) rotate(0.5deg);
        filter: hue-rotate(90deg);
      }
      66% { 
        transform: translate(-1px, 1px) rotate(-0.5deg);
        filter: hue-rotate(180deg);
      }
    }
    .animate-glitch-3d {
      animation: glitch-3d 2s ease-in-out infinite;
    }

    /* Galaxy 3D effect */
    @keyframes galaxy-3d {
      0% { 
        background-position: 0% 0%;
        transform: rotate(0deg);
      }
      100% { 
        background-position: 200% 200%;
        transform: rotate(360deg);
      }
    }
    .animate-galaxy-3d {
      background-size: 200% 200%;
      animation: galaxy-3d 20s linear infinite;
    }

    /* Crown royal effect */
    @keyframes crown-royal {
      0%, 100% { 
        filter: drop-shadow(0 10px 30px rgba(234,179,8,0.6));
      }
      50% { 
        filter: drop-shadow(0 15px 40px rgba(234,179,8,0.9));
      }
    }
    .animate-crown-royal {
      animation: crown-royal 2s ease-in-out infinite;
    }

    /* Conic spin */
    @keyframes conic-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-conic-spin {
      animation: conic-spin 3s linear infinite;
    }

    /* Ping slow */
    @keyframes ping-slow {
      0%, 100% { 
        opacity: 0.3;
        transform: scale(1);
      }
      50% { 
        opacity: 0.1;
        transform: scale(1.05);
      }
    }
    .animate-ping-slow {
      animation: ping-slow 3s ease-in-out infinite;
    }

    /* Crown float */
    @keyframes crown-float {
      0%, 100% { transform: translate(-50%, 0) rotate(0deg); }
      50% { transform: translate(-50%, -4px) rotate(5deg); }
    }
    .animate-crown-float {
      animation: crown-float 3s ease-in-out infinite;
    }

    /* Orbit animations */
    @keyframes orbit-1 {
      0% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
    }
    @keyframes orbit-2 {
      0% { transform: rotate(180deg) translateX(15px) rotate(-180deg); }
      100% { transform: rotate(540deg) translateX(15px) rotate(-540deg); }
    }
    .animate-orbit-1 { animation: orbit-1 8s linear infinite; }
    .animate-orbit-2 { animation: orbit-2 8s linear infinite; }

    /* Bounce animations */
    .animate-bounce-slow { animation: bounce 3s ease-in-out infinite; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    /* Pulse animation */
    @keyframes pulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.4; }
    }
    .animate-pulse {
      animation: pulse 3s ease-in-out infinite;
    }

    /* Pastikan semua elemen benar-benar bulat */
    .rounded-full {
      border-radius: 9999px !important;
    }
  `}</style>
);

export default UserAvatar;
export { GlobalStyles };
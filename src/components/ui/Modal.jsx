import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  noCloseButton = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Container Modal */}
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} p-6 relative shadow-2xl`}
      >
        {/* Tombol Close (Pojok Kanan Atas) */}
        {!noCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}

        {/* Header / Title (Opsional) */}
        {title && (
          <div className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
            {title}
          </div>
        )}

        {/* Konten Utama */}
        {children}
      </div>
    </div>
  );
};

export default Modal;

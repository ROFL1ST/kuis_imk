import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Megaphone, X, Info, AlertTriangle, CheckCircle } from "lucide-react";

export default function AnnouncementModal({ isOpen, onClose, announcement }) {
  if (!announcement) return null;

  const getStyle = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={32} className="text-white animate-pulse" />,
          bg: "from-green-500 to-green-600",
          shadow: "shadow-green-200",
          btn: "bg-green-600 hover:bg-green-700 shadow-green-200",
        };
      case "warning":
        return {
          icon: (
            <AlertTriangle size={32} className="text-white animate-pulse" />
          ),
          bg: "from-orange-500 to-orange-600",
          shadow: "shadow-orange-200",
          btn: "bg-orange-600 hover:bg-orange-700 shadow-orange-200",
        };
      case "danger":
        return {
          icon: <Megaphone size={32} className="text-white animate-pulse" />,
          bg: "from-red-500 to-red-600",
          shadow: "shadow-red-200",
          btn: "bg-red-600 hover:bg-red-700 shadow-red-200",
        };
      default:
        return {
          icon: <Megaphone size={32} className="text-white animate-pulse" />,
          bg: "from-indigo-500 to-indigo-600",
          shadow: "shadow-indigo-200",
          btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
        };
    }
  };

  const style = getStyle(announcement.type || "info");

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-100 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-tr ${style.bg} rounded-full flex items-center justify-center mb-4 shadow-lg ${style.shadow}`}
                  >
                    {style.icon}
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-slate-800"
                  >
                    {announcement.title}
                  </Dialog.Title>

                  <div className="mt-3">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>

                  <div className="mt-6 w-full">
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-xl border border-transparent px-4 py-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition shadow-lg ${style.btn}`}
                      onClick={onClose}
                    >
                      Saya Mengerti
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-4">
                    {new Date(announcement.CreatedAt).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

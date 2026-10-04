import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type NotificationType = 'success' | 'info' | 'error';

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
}

interface NotificationProps {
  notifications: NotificationMessage[];
  removeNotification: (id: string) => void;
}

export default function NotificationBar({ notifications, removeNotification }: NotificationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 w-full max-w-sm px-4 md:px-0">
      <AnimatePresence>
        {notifications.map((notif) => {
          const isSuccess = notif.type === 'success';
          const isError = notif.type === 'error';

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="bg-[#1e2022] border border-[#acadaf]/20 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-start gap-3 w-full relative overflow-hidden group"
            >
              {/* Left Accent Neon Light Strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isSuccess ? 'bg-[#cafd00]' : isError ? 'bg-[#ff3b3b]' : 'bg-[#00d2ff]'
                }`}
              />

              {/* Status Icon */}
              <div className="mt-0.5">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-[#cafd00]" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5 text-[#ff3b3b]" />
                ) : (
                  <Info className="w-5 h-5 text-[#00d2ff]" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h5 className="text-white font-headline font-bold text-sm tracking-tight">
                  {notif.title}
                </h5>
                {notif.body && (
                  <p className="text-xs font-body text-[#acadaf] mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-[#757779] hover:text-white cursor-pointer self-start p-1 -mt-1 -mr-1 rounded-lg hover:bg-[#2d2f31]/50 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

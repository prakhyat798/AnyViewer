import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from '../../App';

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const IconComp = iconMap[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              className={`toast toast--${toast.type || 'info'}`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              layout
            >
              <IconComp size={20} className={`toast__icon--${toast.type || 'info'}`} />
              <div className="toast__content">
                {toast.title && <div className="toast__title">{toast.title}</div>}
                {toast.message && <div className="toast__message">{toast.message}</div>}
              </div>
              <button className="toast__close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

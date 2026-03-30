"use client";

import { createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";

type ToastItem = { id: number; message: string };
type ToastContextValue = {
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  function push(message: string) {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <aside className="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="card w-72 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p>{item.message}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              >
                닫기
              </Button>
            </div>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}


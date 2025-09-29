import { createContext, useContext, useState } from "react";

const ReservationContext = createContext();

export function useReservation() {
  return useContext(ReservationContext);
}

export function ReservationProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Simpan snapshot queue & history ke stack
  const pushUndo = () => {
    setUndoStack((prev) => [
      ...prev,
      { queue: [...queue], history: [...history] }
    ]);
    setRedoStack([]); // redoStack direset setiap aksi baru
  };

  const addReservation = (reservation) => {
    pushUndo();
    setQueue((prev) => [
      ...prev,
      { ...reservation, status: "Menunggu" }
    ]);
  };

  const callNext = () => {
    if (queue.length === 0) return;
    pushUndo();
    const next = { ...queue[0], status: "Dipanggil" };
    setHistory((prev) => [{ ...next, status: "Selesai" }, ...prev]);
    setQueue((prev) => prev.slice(1));
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    setRedoStack((prev) => [
      { queue: [...queue], history: [...history] },
      ...prev
    ]);
    const last = undoStack[undoStack.length - 1];
    setQueue(last.queue);
    setHistory(last.history);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setUndoStack((prev) => [
      ...prev,
      { queue: [...queue], history: [...history] }
    ]);
    const next = redoStack[0];
    setQueue(next.queue);
    setHistory(next.history);
    setRedoStack((prev) => prev.slice(1));
  };

  const clearHistory = () => {
    setUndoStack([]);
    setRedoStack([]);
    setQueue([]);
    setHistory([]);
  };

  return (
    <ReservationContext.Provider
      value={{
        queue,
        history,
        addReservation,
        callNext,
        undo,
        redo,
        clearHistory,
        undoStack,
        redoStack,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}
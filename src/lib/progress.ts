type Listener = () => void;

const startListeners = new Set<Listener>();
const doneListeners = new Set<Listener>();

export const onProgressStart = (fn: Listener) => {
  startListeners.add(fn);
  return () => startListeners.delete(fn);
};

export const onProgressDone = (fn: Listener) => {
  doneListeners.add(fn);
  return () => doneListeners.delete(fn);
};

let pending = 0;

export const progressStart = () => {
  pending++;
  if (pending === 1) startListeners.forEach((fn) => fn());
};

export const progressDone = () => {
  pending = Math.max(0, pending - 1);
  if (pending === 0) doneListeners.forEach((fn) => fn());
};

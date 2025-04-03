
interface RequestIdleCallbackOptions {
  timeout: number;
}

interface RequestIdleCallbackDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface Window {
  requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions
  ) => number;
  cancelIdleCallback: (handle: number) => void;
}

export {};

declare global {
  interface Window {
    App: {
      next: () => void;
      prev: () => void;
      save: (data: any) => Promise<void>;
    };
  }
}

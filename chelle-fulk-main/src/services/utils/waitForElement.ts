export function waitForElement(id: string, timeout = 2000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const interval = 50; // check every 50ms
    let elapsed = 0;

    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject(new Error(`Element with id "${id}" not found within ${timeout}ms`));
      }
    }, interval);
  });
}
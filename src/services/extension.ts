/**
 * Utility to check if the app is running as a browser extension
 */
export const isExtension = () => {
  return typeof chrome !== 'undefined' && !!chrome.tabs && !!chrome.tabs.captureVisibleTab;
};

/**
 * Captures a screenshot of the currently active tab or screen.
 * Works seamlessly in both Chrome Extension mode and Web browser mode.
 */
export const captureCurrentTab = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 1. Chrome Extension context
    if (isExtension()) {
      chrome.tabs.captureVisibleTab(undefined, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!dataUrl) {
          reject(new Error('Failed to capture active tab.'));
        } else {
          resolve(dataUrl);
        }
      });
      return;
    }

    // 2. Web context fallback via Screen/Window/Tab Capture API
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' } as any,
          audio: false,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          stream.getTracks().forEach((track) => track.stop());
          reject(new Error('Failed to create canvas rendering context.'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        // Stop all media tracks immediately
        stream.getTracks().forEach((track) => track.stop());
        resolve(dataUrl);
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          reject(new Error('Screen capture was cancelled.'));
        } else {
          reject(new Error(err.message || 'Screen capture failed.'));
        }
      }
      return;
    }

    reject(new Error('Screen capture is not supported in this browser. Please upload an image directly.'));
  });
};

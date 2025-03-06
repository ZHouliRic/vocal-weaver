
/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/**
 * Handle base64 audio data with multiple fallback strategies
 */
export const playBase64Audio = (
  dataUrl: string,
  audioRef: React.RefObject<HTMLAudioElement>,
  callbacks: {
    onPlayStart: () => void;
    onPlayError: (error: string) => void;
    onTimeUpdate: (time: number) => void;
    onPlayEnd: () => void;
    setCurrentVolume: (volume: number) => void;
  }
): void => {
  console.log("Processing base64 audio");
  
  try {
    // Detect the MIME type
    const mimeType = dataUrl.split(':')[1].split(';')[0];
    console.log("Detected MIME type:", mimeType);
    
    // Extract the base64 data
    const base64Data = dataUrl.split(',')[1];
    
    if (!base64Data) {
      console.error("No base64 data found in URL");
      callbacks.onPlayError("Invalid audio data format");
      return;
    }
    
    // Try to play directly first
    if (audioRef.current) {
      console.log("Trying to play base64 audio directly");
      audioRef.current.src = dataUrl;
      audioRef.current.load();
      
      audioRef.current.play()
        .then(() => {
          callbacks.onPlayStart();
          console.log("Base64 audio playing directly");
        })
        .catch(error => {
          console.error("Direct play failed:", error);
          
          // Try with a blob approach
          console.log("Trying blob approach");
          try {
            // Create a Blob from the base64 data
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512);
              
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            // Try common audio MIME types
            const tryWithMimeType = (index = 0) => {
              const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
              
              if (index >= mimeTypes.length) {
                console.error("All MIME types failed");
                callbacks.onPlayError("Could not play audio. Browser may not support this format.");
                return;
              }
              
              const currentMimeType = mimeTypes[index];
              console.log(`Trying with MIME type: ${currentMimeType}`);
              
              const blob = new Blob(byteArrays, { type: currentMimeType });
              const blobUrl = URL.createObjectURL(blob);
              
              if (audioRef.current) {
                audioRef.current.src = blobUrl;
                audioRef.current.load();
                
                audioRef.current.oncanplaythrough = () => {
                  // When can play through, actually play
                  audioRef.current?.play()
                    .then(() => {
                      console.log(`Playing successfully with ${currentMimeType}`);
                      callbacks.onPlayStart();
                    })
                    .catch(e => {
                      console.error(`Failed to play with ${currentMimeType}:`, e);
                      URL.revokeObjectURL(blobUrl);
                      // Try next MIME type
                      tryWithMimeType(index + 1);
                    });
                };
                
                audioRef.current.onerror = () => {
                  console.error(`Error with ${currentMimeType}`);
                  URL.revokeObjectURL(blobUrl);
                  // Try next MIME type
                  tryWithMimeType(index + 1);
                };
              } else {
                URL.revokeObjectURL(blobUrl);
                callbacks.onPlayError("Audio player not initialized");
              }
            };
            
            // Start trying different MIME types
            tryWithMimeType();
            
          } catch (e) {
            console.error("Blob approach failed:", e);
            
            // Final fallback - try with a new Audio element
            console.log("Trying final fallback with new Audio element");
            const fallbackAudio = new Audio(dataUrl);
            
            fallbackAudio.oncanplaythrough = () => {
              fallbackAudio.play()
                .then(() => {
                  console.log("Fallback audio playing successfully");
                  callbacks.onPlayStart();
                  
                  // Replace the current audio reference
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  audioRef.current = fallbackAudio;
                  
                  // Add event listeners to the new audio element
                  fallbackAudio.addEventListener("timeupdate", () => {
                    callbacks.onTimeUpdate(fallbackAudio.currentTime);
                  });
                  
                  fallbackAudio.addEventListener("ended", () => {
                    callbacks.onPlayEnd();
                  });
                  
                  callbacks.setCurrentVolume(fallbackAudio.volume);
                })
                .catch(e => {
                  console.error("Final fallback failed:", e);
                  callbacks.onPlayError("Could not play audio. Browser may not support this format.");
                });
            };
            
            fallbackAudio.onerror = () => {
              console.error("Fallback audio error");
              callbacks.onPlayError("Could not play audio. Browser may not support this format.");
            };
          }
        });
    } else {
      callbacks.onPlayError("Audio player not available");
    }
  } catch (e) {
    console.error("Error processing base64 audio:", e);
    callbacks.onPlayError("Failed to process audio data");
  }
};

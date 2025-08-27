class SoundNotificationService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private volume: number = 70;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    if (this.isInitialized) return;

    try {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      
      // Set a pleasant notification sound (you can replace this with your own audio file)
      this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio initialization error:', e);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  public updateSettings(isEnabled: boolean, volume: number) {
    this.isEnabled = isEnabled;
    this.volume = volume;
    
    if (this.audio) {
      this.audio.volume = volume / 100;
    }
  }

  public async playNotificationSound(): Promise<void> {
    if (!this.isEnabled || !this.audio) return;

    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      
      // Play the notification sound
      await this.audio.play();
      
      console.log('Notification sound played successfully');
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      
      // Try to play again after a short delay (sometimes needed for autoplay policies)
      setTimeout(async () => {
        try {
          if (this.audio) {
            await this.audio.play();
          }
        } catch (retryError) {
          console.error('Retry failed to play notification sound:', retryError);
        }
      }, 100);
    }
  }

  public async playOrderReceivedSound(): Promise<void> {
    await this.playNotificationSound();
  }

  public async playOrderStatusUpdateSound(): Promise<void> {
    await this.playNotificationSound();
  }

  public stopSound(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  public testSound(): Promise<void> {
    return this.playNotificationSound();
  }

  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isInitialized = false;
  }
}

// Create a singleton instance
export const soundNotificationService = new SoundNotificationService();

// Export the class for testing purposes
export default SoundNotificationService;

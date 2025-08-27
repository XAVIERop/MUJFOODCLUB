class SoundNotificationService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private volume: number = 70;
  private isInitialized: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    if (this.isInitialized) return;

    try {
      // Try to create audio element first
      this.audio = new Audio();
      this.audio.preload = 'auto';
      
      // Use a simple beep sound that's more reliable
      this.createBeepSound();
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio initialization error:', e);
        // Fallback to Web Audio API
        this.initializeWebAudio();
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      // Fallback to Web Audio API
      this.initializeWebAudio();
    }
  }

  private createBeepSound() {
    if (!this.audio) return;

    try {
      // Create a simple beep using Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate a simple beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
      // Store the audio context for reuse
      this.audioContext = null;
    } catch (error) {
      console.error('Failed to create beep sound:', error);
    }
  }

  private initializeWebAudio() {
    try {
      // Create a simple beep using Web Audio API as fallback
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Web Audio API initialized as fallback');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
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
    if (!this.isEnabled) return;

    try {
      // Try Web Audio API first (more reliable)
      if (this.audioContext) {
        await this.playWebAudioBeep();
        return;
      }

      // Fallback to HTML5 Audio
      if (this.audio) {
        this.audio.currentTime = 0;
        await this.audio.play();
        console.log('Notification sound played successfully (HTML5 Audio)');
        return;
      }

      // Final fallback - create a new audio context
      await this.playWebAudioBeep();
      
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      
      // Try Web Audio API as final fallback
      try {
        await this.playWebAudioBeep();
      } catch (fallbackError) {
        console.error('All audio methods failed:', fallbackError);
      }
    }
  }

  private async playWebAudioBeep(): Promise<void> {
    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create new audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Generate beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set frequency and type
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume based on settings
      const normalizedVolume = (this.volume / 100) * 0.3;
      
      // Create envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
      
      console.log('Notification sound played successfully (Web Audio API)');
    } catch (error) {
      console.error('Web Audio API failed:', error);
      throw error;
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
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Create a singleton instance
export const soundNotificationService = new SoundNotificationService();

// Export the class for testing purposes
export default SoundNotificationService;

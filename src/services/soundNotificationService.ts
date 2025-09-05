class SoundNotificationService {
  private isEnabled: boolean = true;
  private volume: number = 70;
  private audioContext: AudioContext | null = null;

  constructor() {
    console.log('🔊 SoundNotificationService initialized');
  }

  public updateSettings(isEnabled: boolean, volume: number) {
    this.isEnabled = isEnabled;
    this.volume = volume;
    console.log(`🔊 Sound settings updated: enabled=${isEnabled}, volume=${volume}`);
  }

  public async playNotificationSound(): Promise<void> {
    console.log(`🔊 Attempting to play sound: enabled=${this.isEnabled}, volume=${this.volume}`);
    
    if (!this.isEnabled) {
      console.log('🔇 Sound notifications are disabled');
      return;
    }

    try {
      await this.playWebAudioBeep();
    } catch (error) {
      console.error('❌ Failed to play notification sound:', error);
    }
  }

  private async playWebAudioBeep(): Promise<void> {
    try {
      // Create new audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume audio context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('🔊 Audio context resumed');
      }

      // Generate beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set frequency and type for a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume based on settings (0.3 is max to avoid distortion)
      const normalizedVolume = (this.volume / 100) * 0.3;
      
      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
      
      console.log('✅ Notification sound played successfully');
    } catch (error) {
      console.error('❌ Web Audio API failed:', error);
      throw error;
    }
  }

  public async playOrderReceivedSound(): Promise<void> {
    console.log('🔔 Playing order received sound');
    await this.playNotificationSound();
  }

  public async playOrderStatusUpdateSound(): Promise<void> {
    console.log('🔔 Playing order status update sound');
    await this.playNotificationSound();
  }

  public testSound(): Promise<void> {
    console.log('🧪 Testing sound notification');
    return this.playNotificationSound();
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    console.log('🔊 Sound service destroyed');
  }
}

// Create a singleton instance
export const soundNotificationService = new SoundNotificationService();

// Export the class for testing purposes
export default SoundNotificationService;

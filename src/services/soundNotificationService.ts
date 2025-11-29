export type SoundOption = 'A' | 'B' | 'C';

class SoundNotificationService {
  private isEnabled: boolean = true;
  private volume: number = 70;
  private soundOption: SoundOption = 'B'; // Default: Classic Notification
  private audioContext: AudioContext | null = null;

  constructor() {
    console.log('🔊 SoundNotificationService initialized');
  }

  public updateSettings(isEnabled: boolean, volume: number, soundOption: SoundOption = 'B') {
    this.isEnabled = isEnabled;
    this.volume = volume;
    this.soundOption = soundOption;
    console.log(`🔊 Sound settings updated: enabled=${isEnabled}, volume=${volume}, option=${soundOption}`);
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

  private async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('🔊 Audio context resumed');
    }

    return this.audioContext;
  }

  private async playWebAudioBeep(): Promise<void> {
    try {
      const audioContext = await this.ensureAudioContext();

      // Generate beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency and type for a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume based on settings (0.3 is max to avoid distortion)
      const normalizedVolume = (this.volume / 100) * 0.3;
      
      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('✅ Notification sound played successfully');
    } catch (error) {
      console.error('❌ Web Audio API failed:', error);
      throw error;
    }
  }

  // Option A: Multi-tone chime (2-3 notes, ~1.5 seconds)
  public async playOptionA_MultiToneChime(): Promise<void> {
    try {
      const audioContext = await this.ensureAudioContext();
      const normalizedVolume = (this.volume / 100) * 0.6; // Louder: 60% max
      const startTime = audioContext.currentTime;

      // First note: C5 (523.25 Hz) - 0.4s
      const note1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      note1.connect(gain1);
      gain1.connect(audioContext.destination);
      note1.frequency.setValueAtTime(523.25, startTime);
      note1.type = 'sine';
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      note1.start(startTime);
      note1.stop(startTime + 0.4);

      // Second note: E5 (659.25 Hz) - 0.4s, starts at 0.3s
      const note2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      note2.connect(gain2);
      gain2.connect(audioContext.destination);
      note2.frequency.setValueAtTime(659.25, startTime + 0.3);
      note2.type = 'sine';
      gain2.gain.setValueAtTime(0, startTime + 0.3);
      gain2.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.7);
      note2.start(startTime + 0.3);
      note2.stop(startTime + 0.7);

      // Third note: G5 (783.99 Hz) - 0.4s, starts at 0.6s
      const note3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      note3.connect(gain3);
      gain3.connect(audioContext.destination);
      note3.frequency.setValueAtTime(783.99, startTime + 0.6);
      note3.type = 'sine';
      gain3.gain.setValueAtTime(0, startTime + 0.6);
      gain3.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.65);
      gain3.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
      note3.start(startTime + 0.6);
      note3.stop(startTime + 1.0);

      // Wait for all notes to finish
      await new Promise(resolve => setTimeout(resolve, 1100));
      console.log('✅ Option A: Multi-tone chime played');
    } catch (error) {
      console.error('❌ Option A failed:', error);
      throw error;
    }
  }

  // Option B: Classic notification sound (like iOS/Android) - ~1.2 seconds
  public async playOptionB_ClassicNotification(): Promise<void> {
    try {
      const audioContext = await this.ensureAudioContext();
      const normalizedVolume = (this.volume / 100) * 0.7; // Louder: 70% max
      const startTime = audioContext.currentTime;

      // Create a more complex waveform for classic notification sound
      // Using square wave with harmonics for a richer sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Classic notification: starts at 800Hz, sweeps to 1000Hz
      oscillator.frequency.setValueAtTime(800, startTime);
      oscillator.frequency.linearRampToValueAtTime(1000, startTime + 0.15);
      oscillator.frequency.setValueAtTime(800, startTime + 0.3);
      oscillator.frequency.linearRampToValueAtTime(1000, startTime + 0.45);
      oscillator.type = 'square'; // Square wave for more presence
      
      // Envelope: two pulses
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.02);
      gainNode.gain.setValueAtTime(normalizedVolume, startTime + 0.28);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.32);
      gainNode.gain.setValueAtTime(0, startTime + 0.47);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.49);
      gainNode.gain.setValueAtTime(normalizedVolume, startTime + 0.75);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 1.2);

      await new Promise(resolve => setTimeout(resolve, 1300));
      console.log('✅ Option B: Classic notification played');
    } catch (error) {
      console.error('❌ Option B failed:', error);
      throw error;
    }
  }

  // Option C: Custom pattern (double beep with pause) - ~1.8 seconds
  public async playOptionC_DoubleBeepPattern(): Promise<void> {
    try {
      const audioContext = await this.ensureAudioContext();
      const normalizedVolume = (this.volume / 100) * 0.65; // Louder: 65% max
      const startTime = audioContext.currentTime;

      // First beep: 1000Hz for 0.3s
      const beep1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      beep1.connect(gain1);
      gain1.connect(audioContext.destination);
      beep1.frequency.setValueAtTime(1000, startTime);
      beep1.type = 'sine';
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.02);
      gain1.gain.setValueAtTime(normalizedVolume, startTime + 0.28);
      gain1.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      beep1.start(startTime);
      beep1.stop(startTime + 0.3);

      // Pause: 0.3s silence

      // Second beep: 1200Hz for 0.4s (slightly higher pitch, longer)
      const beep2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      beep2.connect(gain2);
      gain2.connect(audioContext.destination);
      beep2.frequency.setValueAtTime(1200, startTime + 0.6);
      beep2.type = 'sine';
      gain2.gain.setValueAtTime(0, startTime + 0.6);
      gain2.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.62);
      gain2.gain.setValueAtTime(normalizedVolume, startTime + 0.98);
      gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
      beep2.start(startTime + 0.6);
      beep2.stop(startTime + 1.0);

      // Final longer beep: 800Hz for 0.5s (lower, more attention-grabbing)
      const beep3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      beep3.connect(gain3);
      gain3.connect(audioContext.destination);
      beep3.frequency.setValueAtTime(800, startTime + 1.3);
      beep3.type = 'sine';
      gain3.gain.setValueAtTime(0, startTime + 1.3);
      gain3.gain.linearRampToValueAtTime(normalizedVolume, startTime + 1.32);
      gain3.gain.setValueAtTime(normalizedVolume, startTime + 1.78);
      gain3.gain.exponentialRampToValueAtTime(0.01, startTime + 1.8);
      beep3.start(startTime + 1.3);
      beep3.stop(startTime + 1.8);

      await new Promise(resolve => setTimeout(resolve, 1900));
      console.log('✅ Option C: Double beep pattern played');
    } catch (error) {
      console.error('❌ Option C failed:', error);
      throw error;
    }
  }

  public async playOrderReceivedSound(): Promise<void> {
    console.log(`🔔 Playing order received sound (Option ${this.soundOption})`);
    
    if (!this.isEnabled) {
      console.log('🔇 Sound notifications are disabled');
      return;
    }

    try {
      switch (this.soundOption) {
        case 'A':
          await this.playOptionA_MultiToneChime();
          break;
        case 'B':
          await this.playOptionB_ClassicNotification();
          break;
        case 'C':
          await this.playOptionC_DoubleBeepPattern();
          break;
        default:
          await this.playOptionB_ClassicNotification();
      }
    } catch (error) {
      console.error('❌ Failed to play order received sound:', error);
    }
  }

  public async playOrderStatusUpdateSound(): Promise<void> {
    console.log('🔔 Playing order status update sound');
    await this.playNotificationSound();
  }

  public testSound(): Promise<void> {
    console.log('🧪 Testing sound notification');
    return this.playNotificationSound();
  }

  // Test methods for the three options
  public async testOptionA(): Promise<void> {
    console.log('🧪 Testing Option A: Multi-tone chime');
    await this.playOptionA_MultiToneChime();
  }

  public async testOptionB(): Promise<void> {
    console.log('🧪 Testing Option B: Classic notification');
    await this.playOptionB_ClassicNotification();
  }

  public async testOptionC(): Promise<void> {
    console.log('🧪 Testing Option C: Double beep pattern');
    await this.playOptionC_DoubleBeepPattern();
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

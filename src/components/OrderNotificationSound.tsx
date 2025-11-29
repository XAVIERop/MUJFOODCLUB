import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Bell, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { soundNotificationService, type SoundOption } from '@/services/soundNotificationService';

interface OrderNotificationSoundProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  soundOption: SoundOption;
  onSoundOptionChange: (option: SoundOption) => void;
}

const OrderNotificationSound = ({ 
  isEnabled, 
  onToggle, 
  volume, 
  onVolumeChange,
  soundOption,
  onSoundOptionChange
}: OrderNotificationSoundProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOption, setPlayingOption] = useState<string | null>(null);
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const { toast } = useToast();

  // Check audio support on mount
  useEffect(() => {
    const checkAudioSupport = () => {
      try {
        // Check if Web Audio API is supported
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          setIsAudioSupported(false);
          return;
        }

        // Test creating an audio context
        const testContext = new AudioContext();
        testContext.close();
        setIsAudioSupported(true);
      } catch (error) {
        console.error('Audio not supported:', error);
        setIsAudioSupported(false);
      }
    };

    checkAudioSupport();
  }, []);

  // Update service settings when props change
  useEffect(() => {
    soundNotificationService.updateSettings(isEnabled, volume, soundOption);
  }, [isEnabled, volume, soundOption]);

  const playNotificationSound = async () => {
    if (!isEnabled || !isAudioSupported) return;

    try {
      setIsPlaying(true);
      await soundNotificationService.playNotificationSound();
    } catch (error) {
      console.error('Error playing notification sound:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play notification sound. Please check your browser's audio settings.",
        variant: "destructive"
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const testSound = () => {
    playNotificationSound();
  };

  if (!isAudioSupported) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <Label className="text-sm font-medium">
              Sound Notifications
            </Label>
          </div>
          <Switch disabled />
        </div>
        
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Audio is not supported in your browser. Sound notifications will not work.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <Label htmlFor="sound-toggle" className="text-sm font-medium">
            Sound Notifications
          </Label>
        </div>
        <Switch
          id="sound-toggle"
          checked={isEnabled}
          onCheckedChange={onToggle}
        />
      </div>

      {isEnabled && (
        <div className="space-y-4">
          {/* Sound Option Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notification Sound</Label>
            <Select value={soundOption} onValueChange={(value) => onSoundOptionChange(value as SoundOption)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sound option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Option A: Multi-tone Chime (~1.5s)</SelectItem>
                <SelectItem value="B">Option B: Classic Notification (~1.2s) - Default</SelectItem>
                <SelectItem value="C">Option C: Double Beep Pattern (~1.8s)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This sound will play when new orders are received
            </p>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Volume</Label>
              <div className="flex items-center space-x-2">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-primary" />
                )}
                <span className="text-xs text-muted-foreground w-8">
                  {volume}%
                </span>
              </div>
            </div>
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>

          {/* Test Sound Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Test Sound Options</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={playingOption === 'A' ? "default" : "outline"}
                size="sm"
                onClick={async () => {
                  if (!isAudioSupported) return;
                  try {
                    setIsPlaying(true);
                    setPlayingOption('A');
                    await soundNotificationService.testOptionA();
                  } catch (error) {
                    console.error('Error playing Option A:', error);
                    toast({
                      title: "Audio Error",
                      description: "Failed to play sound option A.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsPlaying(false);
                    setPlayingOption(null);
                  }
                }}
                disabled={isPlaying && playingOption !== 'A'}
                className="w-full justify-start"
              >
                {playingOption === 'A' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Playing Option A...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Option A: Multi-tone Chime (~1.5s)
                  </>
                )}
              </Button>

              <Button
                variant={playingOption === 'B' ? "default" : "outline"}
                size="sm"
                onClick={async () => {
                  if (!isAudioSupported) return;
                  try {
                    setIsPlaying(true);
                    setPlayingOption('B');
                    await soundNotificationService.testOptionB();
                  } catch (error) {
                    console.error('Error playing Option B:', error);
                    toast({
                      title: "Audio Error",
                      description: "Failed to play sound option B.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsPlaying(false);
                    setPlayingOption(null);
                  }
                }}
                disabled={isPlaying && playingOption !== 'B'}
                className="w-full justify-start"
              >
                {playingOption === 'B' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Playing Option B...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Option B: Classic Notification (~1.2s)
                  </>
                )}
              </Button>

              <Button
                variant={playingOption === 'C' ? "default" : "outline"}
                size="sm"
                onClick={async () => {
                  if (!isAudioSupported) return;
                  try {
                    setIsPlaying(true);
                    setPlayingOption('C');
                    await soundNotificationService.testOptionC();
                  } catch (error) {
                    console.error('Error playing Option C:', error);
                    toast({
                      title: "Audio Error",
                      description: "Failed to play sound option C.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsPlaying(false);
                    setPlayingOption(null);
                  }
                }}
                disabled={isPlaying && playingOption !== 'C'}
                className="w-full justify-start"
              >
                {playingOption === 'C' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Playing Option C...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Option C: Double Beep Pattern (~1.8s)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Settings Info */}
          <div className="text-xs text-muted-foreground bg-background p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Settings className="w-3 h-3" />
              <span className="font-medium">Settings</span>
            </div>
            <ul className="space-y-1">
              <li>• Sound plays when new orders arrive</li>
              <li>• Volume can be adjusted (0-100%)</li>
              <li>• Test sound to verify audio works</li>
              <li>• Settings are saved automatically</li>
              <li>• Works with browser autoplay policies</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNotificationSound;

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Bell, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface OrderNotificationSoundProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const OrderNotificationSound = ({ 
  isEnabled, 
  onToggle, 
  volume, 
  onVolumeChange 
}: OrderNotificationSoundProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      
      // Set default notification sound (you can replace with your own audio file)
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast({
          title: "Audio Error",
          description: "Failed to load notification sound",
          variant: "destructive"
        });
      });
    }
  }, [toast]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playNotificationSound = async () => {
    if (!audioRef.current || !isEnabled) return;

    try {
      setIsPlaying(true);
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play notification sound",
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  const testSound = () => {
    playNotificationSound();
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

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

          {/* Test Sound Button */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testSound}
              disabled={isPlaying}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Playing...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Sound
                </>
              )}
            </Button>
            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSound}
              >
                Stop
              </Button>
            )}
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
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNotificationSound;

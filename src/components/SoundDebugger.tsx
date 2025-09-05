import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { soundNotificationService } from '@/services/soundNotificationService';

const SoundDebugger = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const [lastTest, setLastTest] = useState<string>('');
  const [audioSupported, setAudioSupported] = useState<boolean | null>(null);

  // Check audio support
  React.useEffect(() => {
    const checkAudioSupport = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          setAudioSupported(false);
          return;
        }
        setAudioSupported(true);
      } catch (error) {
        console.error('Audio not supported:', error);
        setAudioSupported(false);
      }
    };
    checkAudioSupport();
  }, []);

  const testSound = async () => {
    try {
      setLastTest('Testing...');
      soundNotificationService.updateSettings(isEnabled, volume);
      await soundNotificationService.testSound();
      setLastTest('✅ Sound test completed');
    } catch (error) {
      console.error('Sound test failed:', error);
      setLastTest('❌ Sound test failed');
    }
  };

  const testOrderSound = async () => {
    try {
      setLastTest('Testing order sound...');
      soundNotificationService.updateSettings(isEnabled, volume);
      await soundNotificationService.playOrderReceivedSound();
      setLastTest('✅ Order sound test completed');
    } catch (error) {
      console.error('Order sound test failed:', error);
      setLastTest('❌ Order sound test failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Sound Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Support Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Audio Support:</span>
          {audioSupported === null ? (
            <Badge variant="secondary">Checking...</Badge>
          ) : audioSupported ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Supported
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Supported
            </Badge>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium">
              Enable Sound Notifications
            </label>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Volume: {volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={testSound} 
            className="w-full"
            disabled={!audioSupported}
          >
            <Play className="w-4 h-4 mr-2" />
            Test Sound
          </Button>
          
          <Button 
            onClick={testOrderSound} 
            variant="outline"
            className="w-full"
            disabled={!audioSupported}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Order Sound
          </Button>
        </div>

        {/* Last Test Result */}
        {lastTest && (
          <div className="text-sm text-center p-2 bg-muted rounded">
            {lastTest}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>1. Make sure your browser allows audio</p>
          <p>2. Click "Test Sound" to verify audio works</p>
          <p>3. Check browser console for detailed logs</p>
          <p>4. If no sound, check browser audio settings</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundDebugger;

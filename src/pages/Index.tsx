
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { VoiceVisualizer } from '@/components/VoiceVisualizer';
import { BossAvatar } from '@/components/BossAvatar';
import { toast } from 'sonner';
import { generateBossReport } from '../lib/feedbackUtils';
import { Input } from '@/components/ui/input';
import emailjs from '@emailjs/browser';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'venting'>('upload'); // 'feedback' removed
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [ventText, setVentText] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [bossExpression, setBossExpression] = useState<'neutral' | 'confused' | 'anxious' | 'afraid'>('neutral');
  // feedback state and setFeedback are removed.
  const [bossEmail, setBossEmail] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  const setupAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
      return null;
    }
  }, []);

  const analyzeAudio = useCallback(() => {
    console.log('analyzeAudio called, isRecording:', isRecording);
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    console.log('analyzeAudio - dataArray slice (first 10):', dataArray.slice(0, 10));
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;
    
    setAudioLevel(normalizedLevel);
    
    // Update boss expression based on audio level
    let newExpression: 'neutral' | 'confused' | 'anxious' | 'afraid' = 'neutral';
    if (normalizedLevel > 0.6) { // Changed from 0.7
      newExpression = 'afraid';
    } else if (normalizedLevel > 0.3) { // Changed from 0.4
      newExpression = 'anxious';
    } else if (normalizedLevel > 0.15) { // Changed from 0.2
      newExpression = 'confused';
    }
    setBossExpression(newExpression);
    console.log('analyzeAudio - normalizedLevel:', normalizedLevel, 'newExpression:', newExpression);
  }, [isRecording, setAudioLevel, setBossExpression]);

  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setVentText(prev => prev + ' ' + finalTranscript);
      }
    };
    
    return recognition;
  }, []);

  // generateFeedback useCallback is removed.

  const startVenting = async () => {
    const stream = await setupAudioAnalysis();
    if (!stream) return;
    
    const recognition = setupSpeechRecognition();
    recognitionRef.current = recognition;
    
    setIsRecording(true);
    setCurrentStep('venting');
    
    if (recognition) {
      recognition.start();
    }
    
    // Start audio analysis loop
    const analyzeLoop = () => {
      if (isRecording) {
        analyzeAudio();
        requestAnimationFrame(analyzeLoop);
      }
    };
    analyzeLoop();
    
    toast.success('Start venting! I\'m listening...');
  };

  const stopVenting = () => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Generate report for the boss
    const bossReport = generateBossReport(ventText);

    // Prepare template parameters for EmailJS
    const templateParams = {
      boss_email: bossEmail,
      rephrased_vent_statements: bossReport.rephrased_vent_statements,
      suggestions_for_boss: bossReport.suggestions_for_boss
    };

    console.log('Attempting to send email with params:', templateParams);
    emailjs.send('service_1tscokn', 'template_4310005', templateParams, '3zNb3Okj3StN3lJpk')
      .then((response) => {
         console.log('SUCCESS sending email via EmailJS!', response.status, response.text);
         toast.success('Anonymous feedback has been sent.');
         restartSession(); // Reset state and go to 'upload'
      }, (err) => {
         console.error('FAILED to send email via EmailJS. Error:', err);
         toast.error('Failed to send anonymous feedback. Please check console for details.');
         restartSession(); // Reset state and go to 'upload'
      });
  };

  const handleAvatarUpload = (imageUrl: string) => {
    setAvatarImage(imageUrl);
    toast.success('Avatar uploaded! Ready to start venting.');
  };

  const restartSession = () => {
    setCurrentStep('upload');
    setVentText('');
    // setFeedback(''); // Removed as feedback state is gone
    setAudioLevel(0);
    setBossExpression('neutral');
    setAvatarImage(null);
    setBossEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Boss Vent
          </h1>
          <p className="text-lg text-gray-600">
            Express yourself safely, get constructive feedback
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                {/* Card for Boss's Info and Avatar Upload */}
                <Card className="p-8">
                  <h2 className="text-2xl font-semibold mb-4">Boss's Information</h2>
                  <p className="text-gray-600 mb-6">
                    Please provide your boss's email. Your feedback will be sent anonymously.
                    Upload a photo to create a 3D avatar. This stays private and helps you visualize.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bossEmail" className="block text-sm font-medium text-gray-700 mb-1">Boss's Email</label>
                      <Input
                        type="email"
                        id="bossEmail"
                        placeholder="boss@example.com"
                        value={bossEmail}
                        onChange={(e) => setBossEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <AvatarUpload onUpload={handleAvatarUpload} />
                  </div>
                </Card>
              </div>
              
              {/* Right side: Avatar Preview and Start Button */}
              <div className="text-center space-y-6 flex flex-col items-center">
                {/* Avatar Preview */}
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  {avatarImage ? (
                    <img src={avatarImage} alt="Boss Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div>Avatar Preview</div>
                    </div>
                  )}
                </div>
                
                {/* Start Venting Button - visible if avatar is uploaded, enabled if email is also provided */}
                {avatarImage && (
                  <Button 
                    onClick={startVenting}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    disabled={!bossEmail}
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Venting
                  </Button>
                )}
                {/* Helper text if avatar is uploaded but email is missing */}
                {avatarImage && !bossEmail && (
                  <p className="text-sm text-gray-500 mt-2">Please enter the boss's email to start venting.</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'venting' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Voice Input</h3>
                    <Button
                      onClick={stopVenting}
                      variant="destructive"
                      size="sm"
                    >
                      Stop Venting
                    </Button>
                  </div>
                  
                  <VoiceVisualizer audioLevel={audioLevel} isRecording={isRecording} />
                  
                  {ventText && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">What you're saying:</h4>
                      <p className="text-sm text-gray-700">{ventText}</p>
                    </div>
                  )}
                </Card>
              </div>
              
              <div className="flex items-center justify-center">
                <BossAvatar 
                  imageUrl={avatarImage} 
                  expression={bossExpression}
                  audioLevel={audioLevel}
                />
              </div>
            </div>
          )}

          {/* Removed FeedbackPanel section for currentStep === 'feedback' */}
        </div>
      </div>
    </div>
  );
};

export default Index;

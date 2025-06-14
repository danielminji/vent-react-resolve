
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { VoiceVisualizer } from '@/components/VoiceVisualizer';
import { BossAvatar } from '@/components/BossAvatar';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { toast } from 'sonner';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'venting' | 'feedback'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [ventText, setVentText] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [bossExpression, setBossExpression] = useState<'neutral' | 'confused' | 'anxious' | 'afraid'>('neutral');
  const [feedback, setFeedback] = useState('');
  
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
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;
    
    setAudioLevel(normalizedLevel);
    
    // Update boss expression based on audio level
    if (normalizedLevel > 0.7) {
      setBossExpression('afraid');
    } else if (normalizedLevel > 0.4) {
      setBossExpression('anxious');
    } else if (normalizedLevel > 0.2) {
      setBossExpression('confused');
    } else {
      setBossExpression('neutral');
    }
  }, []);

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

  const generateFeedback = useCallback((text: string) => {
    const keywords = text.toLowerCase();
    
    if (keywords.includes('workload') || keywords.includes('too much') || keywords.includes('overwhelmed')) {
      return "It sounds like you're feeling overwhelmed with your workload. Consider having a conversation about priorities and realistic timelines. Maybe suggest a weekly check-in to align on what's most important.";
    } else if (keywords.includes('micromanage') || keywords.includes('control') || keywords.includes('trust')) {
      return "Feeling micromanaged can be frustrating. Try demonstrating your reliability through consistent updates and proactive communication. This might help build the trust needed for more autonomy.";
    } else if (keywords.includes('unfair') || keywords.includes('bias') || keywords.includes('favorite')) {
      return "Workplace fairness is important for everyone. Consider documenting specific examples and having a calm, professional conversation about your observations. Focus on the impact rather than intentions.";
    } else if (keywords.includes('communication') || keywords.includes('unclear') || keywords.includes('confusing')) {
      return "Clear communication is key to a good working relationship. Try asking specific questions and summarizing what you understand to ensure you're both on the same page.";
    } else {
      return "Thank you for sharing. Remember that workplace conflicts are often opportunities for growth and better understanding. Consider approaching this situation with curiosity rather than frustration.";
    }
  }, []);

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
    
    // Generate feedback based on vent text
    const generatedFeedback = generateFeedback(ventText);
    setFeedback(generatedFeedback);
    
    setTimeout(() => {
      setCurrentStep('feedback');
      setBossExpression('neutral');
    }, 1000);
    
    toast.success('Processing your feedback...');
  };

  const handleAvatarUpload = (imageUrl: string) => {
    setAvatarImage(imageUrl);
    toast.success('Avatar uploaded! Ready to start venting.');
  };

  const restartSession = () => {
    setCurrentStep('upload');
    setVentText('');
    setFeedback('');
    setAudioLevel(0);
    setBossExpression('neutral');
    setAvatarImage(null);
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
                <Card className="p-8">
                  <h2 className="text-2xl font-semibold mb-4">Upload Your Boss's Photo</h2>
                  <p className="text-gray-600 mb-6">
                    Upload a photo to create a 3D avatar. Don't worry - this stays completely private and helps you visualize your conversation.
                  </p>
                  <AvatarUpload onUpload={handleAvatarUpload} />
                </Card>
              </div>
              
              <div className="text-center space-y-6">
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
                
                {avatarImage && (
                  <Button 
                    onClick={startVenting}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Venting
                  </Button>
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

          {currentStep === 'feedback' && (
            <div className="max-w-4xl mx-auto">
              <FeedbackPanel 
                feedback={feedback}
                avatarImage={avatarImage}
                onRestart={restartSession}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

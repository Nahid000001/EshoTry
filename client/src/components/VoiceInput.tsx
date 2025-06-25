import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  language?: string;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onVoiceInput, language = 'en-US', disabled = false, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Set language based on prop
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onVoiceInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Update language before starting
      recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return null; // Hide component if not supported
  }

  return (
    <Button
      variant={isListening ? "default" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      className={`relative ${className}`}
      aria-label={isListening ? 
        (language === 'bn' ? 'শোনা বন্ধ করুন' : 'Stop listening') : 
        (language === 'bn' ? 'কথা বলুন' : 'Speak')
      }
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          {language === 'bn' && <span className="ml-1 text-xs">শুনছি...</span>}
          {language === 'en' && <span className="ml-1 text-xs">Listening...</span>}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          {isListening && <Volume2 className="h-3 w-3 ml-1 animate-pulse" />}
        </>
      )}
    </Button>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
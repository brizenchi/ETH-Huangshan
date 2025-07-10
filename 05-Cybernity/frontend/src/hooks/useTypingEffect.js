import { useState, useEffect, useRef } from 'react';

function useTypingEffect(fullText = '', speed = 25, onFinished) {
  const [displayedText, setDisplayedText] = useState('');
  const onFinishedRef = useRef(onFinished);

  // Keep the onFinished callback fresh without re-triggering the effect.
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (!fullText) return;

    setDisplayedText(''); // Immediately clear previous text
    let i = 0;

    const intervalId = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        if (onFinishedRef.current) {
          onFinishedRef.current();
        }
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [fullText, speed]);

  return displayedText;
}

export default useTypingEffect; 
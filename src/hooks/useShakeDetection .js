import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

export const useShakeDetector = (onShake, sensitivity = 2) => {
  const lastReadingRef = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeRef = useRef(0);
  
  useEffect(() => {
    let subscription;

    const startAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(100);
        
        subscription = Accelerometer.addListener(reading => {
          const { x, y, z } = reading;
          const last = lastReadingRef.current;
          const now = Date.now();

          // Calcular la magnitud del movimiento
          const movement = Math.abs(x + y + z - last.x - last.y - last.z);

          // Verificar si el movimiento supera el umbral y si ha pasado suficiente tiempo desde la última agitación
          if (movement > sensitivity && (now - lastShakeRef.current) > 1000) {
            lastShakeRef.current = now;
            onShake();
          }

          lastReadingRef.current = { x, y, z };
        });
      } catch (error) {
        console.error('Error iniciando acelerómetro:', error);
      }
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [onShake, sensitivity]);
};
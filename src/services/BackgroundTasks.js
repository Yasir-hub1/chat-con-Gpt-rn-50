import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Accelerometer } from 'expo-sensors';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';

const SHAKE_DETECTION_TASK = 'SHAKE_DETECTION_TASK';
const SENSITIVITY_THRESHOLD = 2;

let lastX = 0;
let lastY = 0;
let lastZ = 0;
let lastShake = 0;

TaskManager.defineTask(SHAKE_DETECTION_TASK, async () => {
  try {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastShake;

      // Calcular la magnitud del movimiento
      const movement = Math.abs(x + y + z - lastX - lastY - lastZ);

      if (movement > SENSITIVITY_THRESHOLD && timeDiff > 1000) {
        lastShake = currentTime;
        // Abrir la aplicación
        openApp();
        
        // Limpiar la suscripción después de detectar la agitación
        if (subscription) {
          subscription.remove();
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });

    // Devolver éxito para mantener la tarea en segundo plano activa
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error en tarea de fondo:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const openApp = async () => {
  const scheme = 'dixi://'; // Debes reemplazar esto con tu scheme
  await Linking.openURL(scheme);
};

export const registerBackgroundTask = async () => {
  try {
    if (Device.isDevice) {
      await BackgroundFetch.registerTaskAsync(SHAKE_DETECTION_TASK, {
        minimumInterval: 1, // 1 segundo
        stopOnTerminate: false,
        startOnBoot: true,
      });
      
      await Accelerometer.setUpdateInterval(100);
      console.log('Tarea de fondo registrada exitosamente');
    }
  } catch (error) {
    console.error('Error registrando tarea de fondo:', error);
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(SHAKE_DETECTION_TASK);
    console.log('Tarea de fondo desregistrada exitosamente');
  } catch (error) {
    console.error('Error desregistrando tarea de fondo:', error);
  }
};
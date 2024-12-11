import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Accelerometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, AppState } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';

const SHAKE_DETECTION_TASK = 'BACKGROUND_SHAKE_TASK';
const SHAKE_NOTIFICATION_CHANNEL = 'shake-detection';
let accelerometerSubscription = null;
let lastShakeTime = 0;

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const startAccelerometerMonitoring = async () => {
  try {
    await Accelerometer.setUpdateInterval(100);
    
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
    }
    
    accelerometerSubscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const currentTime = Date.now();
      
      if (acceleration > 1.8 && (currentTime - lastShakeTime > 1000)) {
        lastShakeTime = currentTime;
        console.log('¡Shake detectado!', acceleration);
        
        // Solo mostrar notificación si la app está en segundo plano
        if (AppState.currentState !== 'active') {
          showShakeNotification();
        }
      }
    });
    
    console.log('Monitoreo de acelerómetro iniciado');
  } catch (error) {
    console.error('Error iniciando monitoreo:', error);
  }
};

const showShakeNotification = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(SHAKE_NOTIFICATION_CHANNEL, {
        name: 'Detección de gestos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Gesto detectado!',
        body: 'Se detectó un gesto de agitación',
        sound: true,
        priority: 'high',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error mostrando notificación:', error);
  }
};

export const registerBackgroundTask = async () => {
  try {
    // Solicitar permisos de notificaciones
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permisos de notificación denegados');
      return;
    }

    // Verificar si la tarea ya está registrada
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(SHAKE_DETECTION_TASK);
    if (!isTaskRegistered) {
      // Registrar tarea en segundo plano
      await BackgroundFetch.registerTaskAsync(SHAKE_DETECTION_TASK, {
        minimumInterval: 1,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }

    // Mantener la CPU activa
    if (Platform.OS === 'android') {
      await KeepAwake.activateKeepAwakeAsync();
    }

    // Iniciar monitoreo de acelerómetro
    await startAccelerometerMonitoring();

    console.log('Servicio de detección de gestos iniciado');
  } catch (error) {
    console.error('Error registrando servicio:', error);
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
    }
    
    if (Platform.OS === 'android') {
      await KeepAwake.deactivateKeepAwakeAsync();
    }
    
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(SHAKE_DETECTION_TASK);
    if (isTaskRegistered) {
      await BackgroundFetch.unregisterTaskAsync(SHAKE_DETECTION_TASK);
    }
    
    await Notifications.dismissAllNotificationsAsync();
    
    console.log('Servicio de detección de gestos detenido');
  } catch (error) {
    console.error('Error deteniendo servicio:', error);
  }
};

// Definir la tarea
TaskManager.defineTask(SHAKE_DETECTION_TASK, async () => {
  try {
    await startAccelerometerMonitoring();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error en tarea de fondo:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
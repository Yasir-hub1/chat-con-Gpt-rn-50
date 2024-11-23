import { useState } from 'react';
import { Audio } from 'expo-av';

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Permiso de grabación no otorgado');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      setRecordingStatus('error');
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording || recordingStatus !== 'recording') {
        return null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStatus('stopped');
      return uri;
    } catch (error) {
      console.error('Error al detener grabación:', error);
      setRecordingStatus('error');
      throw error;
    }
  };

  return {
    recording,
    recordingStatus,
    startRecording,
    stopRecording,
  };
};
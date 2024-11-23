import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios';

const api = "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";

const App = () => {
  const [userMessages, setUserMessages] = useState([]);
  const [gptMessages, setGptMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isGPTSpeaking, setIsGPTSpeaking] = useState(false); 
  const [gptPaused, setGptPaused] = useState(false);
  const [currentGPTText, setCurrentGPTText] = useState(''); 

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedUserMessages = await AsyncStorage.getItem('userMessages');
        const storedGptMessages = await AsyncStorage.getItem('gptMessages');
        if (storedUserMessages) {
          setUserMessages(JSON.parse(storedUserMessages));
        }
        if (storedGptMessages) {
          setGptMessages(JSON.parse(storedGptMessages));
        }
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    };
    loadMessages();
  }, []);

  const saveUserMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('userMessages', JSON.stringify(newMessages));
    } catch (error) {
      console.error("Error al guardar mensajes de usuario:", error);
    }
  };

  const saveGptMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('gptMessages', JSON.stringify(newMessages));
    } catch (error) {
      console.error("Error al guardar mensajes de GPT:", error);
    }
  };

  const addUserMessage = (audioUri, timestamp) => {
    const newMessage = { id: Date.now().toString(), audioUri, timestamp, isUser: true };
    const updatedMessages = [...userMessages, newMessage];
    setUserMessages(updatedMessages);
    saveUserMessages(updatedMessages);  
    console.log('Added user message:', newMessage);
  };

  const addGptMessage = (audioUri, timestamp) => {
    const newMessage = { id: Date.now().toString(), audioUri, timestamp, isUser: false };
    const updatedMessages = [...gptMessages, newMessage];
    setGptMessages(updatedMessages);
    saveGptMessages(updatedMessages);  
    console.log('Added GPT message:', newMessage);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.error('Permiso de grabación no otorgado');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Error al empezar a grabar', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const timestamp = new Date().toLocaleString();
      addUserMessage(uri, timestamp); 

      await processGPTResponse(uri);
    } catch (err) {
      console.error('Error al detener la grabación', err);
    }
  };

  const processGPTResponse = async (audioUri) => {
    try {
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      };
      const text = await convertAudioToText(audioFile);
      const response = await getChatGPTResponse(text);

      const gptAudioUri = await convertTextToAudio(response);
      setCurrentGPTText(response);

      addGptMessage(gptAudioUri, new Date().toLocaleString());
      
    } catch (err) {
      console.error('Error al procesar respuesta de GPT', err);
    }
  };

  const playAudio = async (item) => {
    try {
      if (item.isUser) {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: item.audioUri });
        setSound(newSound);
        await newSound.playAsync();
      } else {
        if (!isGPTSpeaking) {
          setIsGPTSpeaking(true);
          Speech.speak(item.audioUri, {
            language: 'es-ES',
            onDone: () => setIsGPTSpeaking(false),
          });
        } else if (gptPaused) {
          setGptPaused(false);
          Speech.speak(currentGPTText, {
            language: 'es-ES',
            onDone: () => setIsGPTSpeaking(false),
          });
        } else {
          Speech.stop();
          setGptPaused(true);
        }
      }
    } catch (err) {
      console.error('Error al reproducir audio', err);
    }
  };

  async function convertAudioToText(audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${api}`,
        },
      }
    );
    return response.data.text;
  }

  async function getChatGPTResponse(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: text }],
          max_tokens: 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error al obtener respuesta de GPT:", error.message);
    }
  }

  const convertTextToAudio = async (text) => {
    return new Promise((resolve) => {
      resolve(`${text}`);
    });
  };

  const combinedMessages = () => {
    const combined = [];
    const userMessagesWithIds = userMessages.map(msg => ({ ...msg, type: 'user' }));
    const gptMessagesWithIds = gptMessages.map(msg => ({ ...msg, type: 'gpt' }));

    let userIndex = 0;
    let gptIndex = 0;

    while (userIndex < userMessagesWithIds.length || gptIndex < gptMessagesWithIds.length) {
      if (userIndex < userMessagesWithIds.length) {
        combined.push(userMessagesWithIds[userIndex]);
        userIndex++;
      }
      if (gptIndex < gptMessagesWithIds.length) {
        combined.push(gptMessagesWithIds[gptIndex]);
        gptIndex++;
      }
    }

    return combined;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedMessages()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => playAudio(item)}>
            <View
              style={[
                styles.messageContainer,
                item.type === 'user' ? styles.userMessage : styles.gptMessage,
              ]}
            >
              <Text style={styles.messageText}>
                {item.type === 'user' ? 'Usuario' : 'GPT'} - {item.timestamp}
              </Text>
              <Text style={styles.messageText}>
                {item.type === 'user' ? '🎤 Audio del Usuario' : '💬 Respuesta de GPT'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.recordButton}
        >
          <Text style={styles.buttonText}>{recording ? 'Detener' : 'Grabar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  gptMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  recordButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;

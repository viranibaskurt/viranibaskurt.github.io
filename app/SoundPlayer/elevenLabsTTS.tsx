import React from 'react'
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av'
import { Buffer } from 'buffer';
import { Alert } from 'react-native';

const API_KEY = 'sk_3fe3c41ab4bac34f0c3463019be1618cbe50683ffb2eb1fb';
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

global.Buffer = global.Buffer || Buffer;

let uris: string[] = [];

export async function initSounds(cacheId: string, steps: Array<string>) {
    uris = [];
    try {
        for (let i = 0; i < steps.length; i++) {
            const fileName = `${cacheId}_${i}`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}.mp3`;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                console.log(`${fileName} loaded from cache`);
                uris.push(fileUri);
                continue;
            }

            const text = steps[i];
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.7,
                        similarity_boost: 0.75,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Eleven Lab error ${response.status}- ${errorText}');
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');

            await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                encoding: FileSystem.EncodingType.Base64,
            });
            uris.push(fileUri);
            console.log(`${fileName} loaded online`);
        }

    } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to play audio');
    }
}

export async function play(stepIndex: number) {
    return; //TODO enable it
    const { sound } = await Audio.Sound.createAsync({ uri: uris[stepIndex] });
    try {
        await sound.playAsync();
        console.log(`playing step:${stepIndex}`);
    } finally {
        //sound.unloadAsync();
    }
}

export async function clearCache() {
    try {
        if (FileSystem.cacheDirectory) {

            const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);

            for (const file of files) {
                const filePath = FileSystem.cacheDirectory + file;
                await FileSystem.deleteAsync(filePath, { idempotent: true });
            }
            console.log('Cache cleared successfully!');
        }
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}
// StepAudioPlayer.tsx
import React, { useEffect, useRef } from 'react';
import { Audio as ExpoAudio } from 'expo-av';

import { Platform } from 'react-native';

// 1) Map your snake_cased step names → bundle‑time requires
const soundAssets: Record<string, any> = {
    add_water: require('../assets/sounds/add_water.mp3'),
    attach_the_cap: require('../assets/sounds/attach_the_cap.mp3'),
    dilute: require('../assets/sounds/dilute.mp3'),
    enjoy: require('../assets/sounds/enjoy.mp3'),
    flip: require('../assets/sounds/flip.mp3'),
    press: require('../assets/sounds/press.mp3'),
    stir: require('../assets/sounds/stir.mp3'),
    wait: require('../assets/sounds/wait.mp3'),
    swirl: require('../assets/sounds/swirl.mp3'),
    remove_the_air: require('../assets/sounds/remove_the_air.mp3'),
    bip1: require('../assets/sounds/bip1.mp3'),
    bip2: require('../assets/sounds/bip2.mp3'),
    bip3: require('../assets/sounds/bip3.mp3'),
    bop: require('../assets/sounds/bop.mp3'),
};

const nativeSounds: Record<string, ExpoAudio.Sound> = {};
const webSounds: Record<string, HTMLAudioElement> = {};

export async function preloadSounds() {
    if (Platform.OS === 'web') {
        // Web: just make an <audio> element for each URL
        Object.entries(soundAssets).forEach(([key, asset]) => {
            // asset is the URL (string) on web
            const url = asset as string;
            const audio = new Audio(url);
            audio.preload = 'auto';
            webSounds[key] = audio;
        });
    } else {
        // Native: use expo-av to create Audio.Sound instances
        await Promise.all(
            Object.entries(soundAssets).map(async ([key, asset]) => {
                const { sound } = await ExpoAudio.Sound.createAsync(asset, {
                    shouldPlay: false,
                });
                nativeSounds[key] = sound;
            })
        );
    }
}

export function playSound(name: string) {
    return;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    if (Platform.OS === 'web') {
        const audio = webSounds[key];
        if (!audio) return console.warn('No web sound for', key);
        audio.currentTime = 0;
        audio.play().catch(console.error);
    } else {
        const sound = nativeSounds[key];
        if (!sound) return console.warn('No native sound for', key);
        sound.stopAsync()
            .then(() => sound.setPositionAsync(0))
            .then(() => sound.playAsync())
            .catch(console.error);
    }
}
// StepAudioPlayer.tsx
import React, { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';



// 1) Map your snake_cased step names → bundle‑time requires
const sounds: Record<string, any> = {
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
    bip: require('../assets/sounds/bip.mp3'),
    bop: require('../assets/sounds/bop.mp3'),
};

export async function preloadSounds() {
    console.log('preloading sound');
    await Promise.all(

        Object.entries(sounds).map(async ([key, asset]) => {
            const { sound } = await Audio.Sound.createAsync(asset);
            sounds[key] = sound;
        })
    );
}

export async function playSound(name: string) {
    const key = name.toLowerCase().replace(/\s+/g, '_');
    const sound = sounds[key];
    if (!sound) {
        console.warn('No sound for', key);
        return;
    }

    try {
        console.log('playing sound', key);
        await sound.replayAsync();
    } catch (err) {
        console.error('Error playing sound', key, err);
    }

}

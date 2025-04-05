import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Page from './index';


SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
    const [loaded, error] = useFonts({
        'SourceCodePro-Regular': require('../assets/fonts/SourceCodePro-Regular.ttf'),
        'SourceCodePro-SemiBold': require('../assets/fonts/SourceCodePro-SemiBold.ttf'),
        'SourceCodePro-Bold': require('../assets/fonts/SourceCodePro-Bold.ttf'),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Page />
    )
}

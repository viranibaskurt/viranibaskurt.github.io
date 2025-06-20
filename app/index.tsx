/*
    -sound doesn't play reliably.
    -performance problem while swiping
    -icons
    -the current steps stays on the top while scrolling
    -it moves up but doesn't scroll until the scroll window reaches the top
*/


/*
Deploying 
git remote remove origin && git remote add origin https://github.com/viranibaskurt/viranibaskurt.github.io.git
npm run deploy

in viranibaskurt.github.io.git repo
git reset --hard origin/gh-pages 

git remote remove origin && git remote add origin https://github.com/viranibaskurt/brew-daily.git
*/

import {
    StyleSheet, Image, ScrollView, View, Text, Animated,
    Platform, Dimensions, Button, TouchableOpacity
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { playSound, preloadSounds } from './soundPlayer';
import { clearCache, initSounds, play } from './SoundPlayer/elevenLabsTTS';

const HeaderTop: number = 76;
const HeaderBottomMargin: number = 12;
const TimeControlButtonBottomMargin: number = 48;
const TimeControlButtonHeight: number = 50;

// const recipeJson: string = `{
//     "method": "Inverted",
//     "coffeeAmount": "16g",
//     "paper": "3/Rinsed/Paper",
//     "grindSize": "6/10 Medium",
//     "waterAmount": "450g",
//     "temperature": "89°C",
//     "steps": [
//       { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
//     ]
//   }`;

const recipeJson: string = `{
    "name" : "WAC\`24 1st",
    "author": "George Stanica",
    "method": "Inverted",
    "coffeeAmount": "18g",
    "paper": "1/Aesir/Rinsed",
    "grindSize": "7/10 Medium",
    "waterAmount": "130g",
    "temperature": "96°C",
    "steps": [
      { "name": "Add Water", "desc": "Add 50g water using melodrip", "time": "5" },
      { "name": "Wait", "desc": "Let it bloom", "time": "5" },
      { "name": "Add Water", "desc": "Add 50g water", "time": "5" },
      { "name": "Stir", "desc": "Stir in NSEW  motion", "time": "5" },
      { "name": "Wait", "desc": "Give it some time", "time": "5" },
      { "name": "Attach the Cap", "desc": "Attach cap with filter to AeroPress", "time": "5" },
      { "name": "Remove the Air", "desc": "Remove the excessive air", "time": "5" },
      { "name": "Swirl", "desc": "Swirl gently", "time": "5" },
      { "name": "Flip", "desc": "Flip by holding the plunger", "time": "5" },
      { "name": "Press", "desc": "Press until you have approx. 76-79g", "time": "30" },
      { "name": "Dilute", "desc": "Add 50g water", "time": "30" },
      { "name": "Add Water", "desc": "Add 20g room temperature water", "time": "5" },
      { "name": "Enjoy", "desc": "", "time": "" }
    ]
  }`;


// const recipeJson: string = `{
//   "name" : "WAC\`24 1st",
//   "author": "George Stanica",
//   "method": "Inverted",
//   "coffeeAmount": "18g",
//   "paper": "1/Aesir/Rinsed",
//   "grindSize": "7/10 Medium",
//   "waterAmount": "130g",
//   "temperature": "96°C",
//   "steps": [
//     { "name": "Add Water", "desc": "Add 50g water using melodrip", "time": "5" },
//     { "name": "Wait", "desc": "Let it bloom", "time": "30" },
//     { "name": "Add Water", "desc": "Add 50g water", "time": "5" },
//     { "name": "Stir", "desc": "Stir in NSEW  motion", "time": "10" },
//     { "name": "Wait", "desc": "Give it some time", "time": "30" },
//     { "name": "Attach the Cap", "desc": "Attach cap with filter to AeroPress", "time": "5" },
//     { "name": "Remove the Air", "desc": "Remove the excessive air", "time": "10" },
//     { "name": "Swirl", "desc": "Swirl gently", "time": "5" },
//     { "name": "Flip", "desc": "Flip by holding the plunger", "time": "5" },
//     { "name": "Press", "desc": "Press until you have approx. 76-79g", "time": "30" },
//     { "name": "Dilute", "desc": "Add 50g water", "time": "30" },
//     { "name": "Add Water", "desc": "Add 20g room temperature water", "time": "5" },
//     { "name": "Enjoy", "desc": "", "time": "" }
//   ]
// }`;

const SourceCodeProRegular: string = 'SourceCodePro-Regular'
const SourceCodeProSemiBold: string = 'SourceCodePro-SemiBold'
const SourceCodeProBold: string = 'SourceCodePro-Bold'

const screenHeight: number = Dimensions.get('window').height;
const screenWidth: number = Math.min(Dimensions.get('window').width, screenHeight * 0.46);

const HeaderHeight = 100;
const InfoHeight = 200;

type CustomButtonProps = {
    title: string;
    onPress: () => void;
    width?: number;
    buttonColor?: string,
    textColor?: string,
};

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, width, buttonColor, textColor }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { width: width, backgroundColor: buttonColor }]}>
            <Text
                style={[styles.buttonText, { color: textColor }]}>{title}
            </Text>
        </TouchableOpacity >
    );
};

type InfoRowProps = {
    infoLeft: string;
    infoRight: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ infoLeft, infoRight }) => {
    return (
        <View style={styles.row}>
            <View style={styles.column}>
                <View style={styles.circle} />
                <Text style={styles.text}>{infoLeft}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.column}>
                <View style={styles.circle} />
                <Text style={styles.text}>{infoRight}</Text>
            </View>
        </View>
    );
}

export default function Page() {
    const { height: screenHeight } = Dimensions.get('window');
    const rootWidth = Platform.OS == 'web' ? screenHeight * (9 / 16) : '100%';

    type Recipe = {
        name: string,
        author: string,
        method: string,
        coffeeAmount: string,
        paper: string,
        grindSize: string,
        waterAmount: string,
        temperature: string,
        steps: StepsInfo[],
    }

    type StepsInfo = {
        name: string,
        desc: string,
        time: string,
    }

    const recipe: Recipe = JSON.parse(recipeJson);

    const scrollOffsetValueY = useRef(new Animated.Value(0)).current;

    enum TimerState {
        None,
        Running,
        Pause,
    }
    const [timerState, setTimerState] = useState(TimerState.None);

    const handleStart = () => {
        setTimerState(TimerState.Running);
        setActiveStepIndex(0);
        setRemainingTime(+recipe.steps[0].time);
    };

    const handlePause = () => {
        setTimerState(TimerState.Pause);
    };

    const handleResume = () => {
        setTimerState(TimerState.Running);
    };

    // Function to reset the timer
    const handleReset = () => {
        setTimerState(TimerState.None);
        setActiveStepIndex(0); //TODO active step and remaning time are dependent
        setRemainingTime(+recipe.steps[0].time);
    };

    const handleDoubleTap = (index: number) => {
        if (timerState === TimerState.None) {
            return;
        }
        setActiveStepIndex(index);
        setRemainingTime(+recipe.steps[index].time);
    }

    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const activeStepIndexRef = useRef<number>(activeStepIndex);
    const [remaningTime, setRemainingTime] = useState<number>(+recipe.steps[activeStepIndex].time);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        activeStepIndexRef.current = activeStepIndex;
    }, [activeStepIndex]);

    useEffect(() => {
        if (timerState == TimerState.Running) {
            intervalRef.current = setInterval(() => {
                setRemainingTime(prevTime => {
                    if (prevTime < 1) {
                        const nextIndex = activeStepIndexRef.current + 1;
                        if (nextIndex < recipe.steps.length) {
                            setActiveStepIndex(nextIndex);
                            return +recipe.steps[nextIndex].time;
                        }
                        else {
                            clearInterval(intervalRef.current!);
                            setTimerState(TimerState.None);
                            return 0;
                        }
                    }

                    if (prevTime - 1 <= 3 && prevTime - 1 >= 1) {
                        playSound('bip' + (prevTime - 1));
                    }
                    else if (prevTime - 1 < 1) {
                        playSound('bop');
                    }
                    return prevTime - 1;
                })
            }, 1000);
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        }

    }, [timerState])

    const didMount = useRef(false)
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }

        if (timerState !== TimerState.Running) {
            return;
        }

        const step = recipe.steps[activeStepIndex];
        if (step) {
            // playSound(step.name);
            play(activeStepIndex);
        }

    }, [activeStepIndex, timerState]);

    useEffect(() => {
        const loadSounds = async () => {
            // await clearCache();
            await initSounds(recipe.name, recipe.steps.map(item => item.name));
        };

        loadSounds();
    }, []);

    return (
        <View style={[styles.root]}>
            <View style={[styles.contentRoot, { width: rootWidth }]}>
                <View style={[styles.header,]}>
                    <Text style={[styles.recipeName,]}>{recipe.name}</Text>
                    <Text style={[styles.author,]}>{recipe.author}</Text>
                </View>
                <Animated.View style={[styles.info]}>
                    <InfoRow infoLeft={recipe.method} infoRight={recipe.coffeeAmount} />
                    <InfoRow infoLeft={recipe.paper} infoRight={recipe.grindSize} />
                    <InfoRow infoLeft={recipe.waterAmount} infoRight={recipe.temperature} />
                </Animated.View>
                <Animated.View style={[styles.steps, {}]}>
                    <View style={[styles.stepsHeader]}>
                        <Text style={[styles.stepsText]}>Steps</Text>
                    </View>
                    <GestureHandlerRootView >
                        <ScrollView showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            scrollEventThrottle={16}
                            //TODO shadow dom
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetValueY } } }], { useNativeDriver: false })}>
                            {
                                recipe.steps.map(
                                    (step, index) => {
                                        const isStarted = timerState !== TimerState.None;
                                        const isActive: boolean = isStarted && (index === activeStepIndex);
                                        const stepTime: number = isActive ? (remaningTime) : +step.time;

                                        //TODO take this out
                                        return <GestureDetector
                                            key={index}
                                            touchAction='auto'
                                            gesture={
                                                Gesture.Tap().numberOfTaps(2).onEnd((_event, success) => {
                                                    if (success)
                                                        handleDoubleTap(index);
                                                })}>
                                            <View style={styles.stepView}>
                                                <View style={[{ opacity: !isStarted || isActive ? 1 : 0.5 }]}>
                                                    <View style={[styles.stepRowView]}>
                                                        <Text style={[styles.stepNameText, isActive && styles.activeStepNameText]}>{step.name}</Text>
                                                        <Text style={[styles.stepsTimeText, isActive && styles.activeStepsTimeText]}>{+step.time !== 0 ? stepTime : ""}</Text>
                                                    </View>
                                                    <Text style={[styles.stepsDescText, isActive && styles.activeStepsDescText]}>{step.desc}</Text>
                                                </View>
                                                <View style={styles.horizontalLine} />
                                            </View>
                                        </GestureDetector>
                                    }
                                )
                            }
                            <View style={{ height: TimeControlButtonBottomMargin + TimeControlButtonHeight }} /> {/*so the last step is above the buttons*/}
                        </ScrollView>
                    </GestureHandlerRootView>
                </Animated.View>
            </View >
            <View style={[styles.buttonsContainer]}>
                {timerState === TimerState.None && (
                    <CustomButton
                        title='Start'
                        onPress={handleStart}
                        width={224} />
                )}
                {timerState === TimerState.Running && (
                    <CustomButton
                        title='Pause'
                        onPress={handlePause}
                        width={224} />
                )}
                {timerState === TimerState.Pause && (
                    <View style={[styles.buttonRow]}>
                        <CustomButton
                            title='Reset'
                            onPress={handleReset}
                            width={83}
                            textColor='#FFFFFF'
                            buttonColor='#3C3C43' />
                        <View style={{ width: 24 }} />
                        <CustomButton
                            title='Resume'
                            onPress={handleResume}
                            width={203} />
                    </View>
                )}
            </View>
        </View>
    );
}


/*
https://clintgoodman27.medium.com/how-to-make-your-react-native-project-work-for-the-web-560f0cba72e2
https://aureliomerenda.medium.com/create-a-native-web-app-with-react-native-web-419acac86b82
*/

const styles = StyleSheet.create(
    {
        background: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -2,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
        },
        root: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
        },
        contentRoot: {
            height: '100%',
            alignItems: 'center',
            alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
            justifyContent: 'center',
        },
        info: {
            justifyContent: 'center',
            alignItems: 'center',
            height: InfoHeight,
            width: 300,
        },
        containerFake: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 300,

        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 60,
            justifyContent: 'space-evenly',
        },
        column: {
            width: 98,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        animatedView: {
            justifyContent: 'center',
            alignItems: 'center',
            top: 0,
            bottom: 0,
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#CCCCCC',
            marginBottom: 5,
        },
        divider: {
            width: 1,
            backgroundColor: '#CCCCCC',
            height: '100%',
            marginHorizontal: 20,
        },
        text: {
            fontSize: 14,
            color: '#666666',
            textAlign: 'center',
            fontFamily: SourceCodeProRegular,
        },
        header: {
            marginTop: HeaderTop,
            marginBottom: HeaderBottomMargin,
            height: HeaderHeight
        },
        recipeName: {
            textAlign: 'center',
            fontSize: 28,
            fontFamily: SourceCodeProRegular,
            color: '#181818',
            fontWeight: '600',
            marginBottom: 4,
        },
        author: {
            textAlign: 'center',
            fontSize: 14,
            fontFamily: SourceCodeProRegular,
            color: '#666666',
        },
        steps: {
            width: '100%',
            flex: 1,
            alignContent: 'space-around',
            marginBottom: 16,
            paddingRight: 40,
            paddingLeft: 40,
            backgroundColor: '#FFFFFF',
        },
        stepsHeader: {
            marginTop: 12,
            marginBottom: 4,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        stepView: {
            marginTop: 24,
        },
        stepRowView: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        stepsText: {
            fontSize: 18,
            color: '#000000',
            fontFamily: SourceCodeProRegular
        },
        activeStepNameText: {
            fontSize: 20,
            fontFamily: SourceCodeProSemiBold,
            fontWeight: '600',
            color: '#666666',
        },
        activeStepsDescText: {
            fontSize: 18,
            fontFamily: SourceCodeProRegular,
            color: '#666666',
            marginBottom: 12,
        },
        activeStepsTimeText: {
            fontSize: 18,
            color: '#181818',
            fontFamily: SourceCodeProRegular,
            marginRight: 4,
        },
        stepNameText: {
            fontSize: 14,
            fontFamily: SourceCodeProSemiBold,
            fontWeight: '600',
            color: '#666666',
        },
        stepsDescText: {
            fontSize: 14,
            fontFamily: SourceCodeProRegular,
            color: '#666666',
            marginBottom: 12,
        },
        stepsTimeText: {
            fontSize: 14,
            color: '#181818',
            fontFamily: SourceCodeProRegular,
            marginRight: 4,
        },
        verticleLine: {
            width: "0.1%",
            height: '60%',
            alignSelf: 'center',
            backgroundColor: '#DEDEDE',
        },
        horizontalLine: {
            height: "1%",
            width: '100%',
            backgroundColor: '#E6E6E6',
            alignSelf: 'center',
        },
        buttonsContainer: {
            position: 'absolute',
            bottom: TimeControlButtonBottomMargin,
        },
        buttonRow: {
            flexDirection: 'row',
        },
        button: {
            backgroundColor: 'white',
            borderRadius: 8,
            borderWidth: 1,
            width: 224,
            height: TimeControlButtonHeight,
            justifyContent: 'center',
        },
        buttonText: {
            color: '#3C3C43',
            fontSize: 18,
            fontFamily: SourceCodeProRegular,
            textAlign: 'center',
        },
    }
)

// export default App;

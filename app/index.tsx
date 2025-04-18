/*
Deploying 
git remote remove origin
git remote add origin https://github.com/viranibaskurt/viranibaskurt.github.io.git
npm run deploy

in viranibaskurt.github.io.git repo
git reset --hard origin/gh-pages 

git remote remove origin
git remote add origin https://github.com/viranibaskurt/brew-daily.git
*/

import {
    StyleSheet, Image, ScrollView, View, Text, Animated,
    Platform, Dimensions, Button, TouchableOpacity
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

const HeaderTop: number = 76;
const HeaderBottomMargin: number = 12;
const maxHeight = getRatio(200);
const minHeight = getRatio(0);
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
      { "name": "Wait", "desc": "Let it bloom", "time": "30" },
      { "name": "Add Water", "desc": "Add 50g water", "time": "5" },
      { "name": "Stir", "desc": "Stir in NSEW  motion", "time": "10" },
      { "name": "Wait", "desc": "Give it some time", "time": "30" },
      { "name": "Attach the Cap", "desc": "Attach cap with filter to AeroPress", "time": "5" },
      { "name": "Remove Air", "desc": "Remove excessive air gently", "time": "10" },
      { "name": "Swirl", "desc": "Swirl gently", "time": "5" },
      { "name": "Flip", "desc": "Flip by holding the plunger", "time": "5" },
      { "name": "Press", "desc": "Press until you have approx. 76-79g", "time": "30" },
      { "name": "Dilute", "desc": "Add 50g water", "time": "30" },
      { "name": "Add Water", "desc": "Add 20g room temperature water", "time": "5" },
      { "name": "Enjoy", "desc": "", "time": "" }
    ]
  }`;


const SourceCodeProRegular: string = 'SourceCodePro-Regular'
const SourceCodeProSemiBold: string = 'SourceCodePro-SemiBold'
const SourceCodeProBold: string = 'SourceCodePro-Bold'

const screenHeight: number = Dimensions.get('window').height;
const screenWidth: number = Math.min(Dimensions.get('window').width, screenHeight * 0.46);

function getRatio(sizeInPixel: number): number {
    // return Math.round((screenWidth * sizeInPixel) / designWidth);
    return sizeInPixel;
}

function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Convert minutes and seconds to strings padded with zeros if needed
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return `${minutesStr}:${secondsStr}`;
}

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
    const animateHeaderHeight =
        scrollOffsetValueY.interpolate({
            inputRange: [0, maxHeight - minHeight],
            outputRange: [maxHeight, minHeight],
            extrapolate: 'clamp'
        });

    const cornerRadius = scrollOffsetValueY.interpolate({
        inputRange: [0, (maxHeight - minHeight) * 0.01, maxHeight - minHeight],
        outputRange: [0.0, 10.0, 15.0],
        extrapolate: 'clamp'
    })

    const backgroundColor = scrollOffsetValueY.interpolate({
        inputRange: [0, 0.01],
        outputRange: ['#FFFFFF', '#F1F1F1'],
        extrapolate: 'clamp',
    });
    const [fakeItemLayout, setItemLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    enum TimerState {
        None,
        Running,
        Pause,
    }
    const [timerState, setTimerState] = useState(TimerState.None);

    const handleStart = () => {
        setTimerState(TimerState.Running);
        setActiveStepIndex(0);
        setRemainingTime(+recipe.steps[activeStepIndex].time);
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
        setActiveStepIndex(0);
    };

    const [activeStepIndex, setActiveStepIndex] = useState(0); // TODO: should it be a state
    const [remaningTime, setRemainingTime] = useState<number>(+recipe.steps[activeStepIndex].time);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const activeStepIndexRef = useRef<number>(activeStepIndex);

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


    return (
        <View style={[styles.root]}>
            <View style={[styles.rootContainer, { width: rootWidth }]}>
                <View onLayout={event => {
                    const layout = event.nativeEvent.layout;
                    setItemLayout(layout);
                }} style={[styles.titleContainer,]}>
                    <Text style={[styles.recipeName,]}>{recipe.name}</Text>
                    <Text style={[styles.author,]}>{recipe.author}</Text>
                </View>
                <Animated.View style={[styles.containerFake, { opacity: 0, height: animateHeaderHeight }]}>
                    <InfoRow infoLeft={'fake'} infoRight={recipe.coffeeAmount} />
                    <InfoRow infoLeft={recipe.paper} infoRight={recipe.coffeeAmount} />
                    <InfoRow infoLeft={recipe.waterAmount} infoRight={recipe.temperature} />
                </Animated.View>
                <Animated.View style={[styles.stepsContainer,
                {
                    borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius,

                }]}>
                    <View style={[styles.stepsHeaderView]}>
                        <Text style={[styles.stepsText]}>Steps</Text>
                        {/*<Text style={[styles.stepsText]}>{formatTime(time)}</Text>*/}
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetValueY } } }], { useNativeDriver: false })}>
                        {
                            recipe.steps.map(
                                (step, index) => {
                                    const isStarted = timerState !== TimerState.None;
                                    const isActive: boolean = isStarted && (index === activeStepIndex);
                                    const stepTime: number = isActive ? (remaningTime) : +step.time;

                                    return <View key={index} style={styles.stepView}>
                                        <View style={[{ opacity: !isStarted || isActive ? 1 : 0.5 }]}>
                                            <View style={[styles.stepRowView]}>
                                                <Text style={[styles.stepNameText, isActive && styles.activeStepNameText]}>{step.name}</Text>
                                                <Text style={[styles.stepsTimeText, isActive && styles.activeStepsTimeText]}>{stepTime}</Text>
                                            </View>
                                            <Text style={[styles.stepsDescText, isActive && styles.activeStepsDescText]}>{step.desc}</Text>
                                        </View>
                                        <View style={styles.horizontalLine} />
                                    </View>
                                }
                            )
                        }
                        <View style={{ height: TimeControlButtonBottomMargin + TimeControlButtonHeight }} />
                    </ScrollView>
                </Animated.View>

            </View >
            <View style={[styles.buttonsContainer]}>
                {timerState === TimerState.None && (
                    <CustomButton title='Start' onPress={() => {
                        setTimerState(TimerState.Running);
                        handleStart();
                    }
                    } width={getRatio(224)} />
                )}
                {timerState === TimerState.Running && (
                    <CustomButton title='Pause' onPress={() => {
                        setTimerState(TimerState.Pause);
                        handlePause();
                    }

                    } width={getRatio(224)} />
                )}
                {timerState === TimerState.Pause && (
                    <View style={[styles.buttonRow]}>
                        <CustomButton title='Reset' onPress={() => {
                            setTimerState(TimerState.None);
                            handleReset();
                        }
                        } width={getRatio(83)} textColor='#FFFFFF' buttonColor='#3C3C43' />
                        <View style={{ width: getRatio(24) }} />
                        <CustomButton title='Resume' onPress={() => {
                            setTimerState(TimerState.Running);
                            handleResume();
                        }
                        } width={getRatio(203)} />
                    </View>
                )}
            </View>
            <Animated.View style={[styles.container, { opacity: 1, top: fakeItemLayout.y + fakeItemLayout.height + HeaderBottomMargin }]}>
                <InfoRow infoLeft={recipe.method} infoRight={recipe.coffeeAmount} />
                <InfoRow infoLeft={recipe.paper} infoRight={recipe.grindSize} />
                <InfoRow infoLeft={recipe.waterAmount} infoRight={recipe.temperature} />
            </Animated.View>
            <Animated.View style={[styles.background, { backgroundColor: backgroundColor }]}></Animated.View>
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
            // width: getRatio(designWidth),
            // height: getRatio(designHeight),
            width: '100%',
            height: '100%',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
        },
        rootContainer: {
            // width: getRatio(designWidth),
            // height: getRatio(designHeight),
            // flex: 1,
            height: '100%',
            alignItems: 'center',
            alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
            justifyContent: 'center',
            // backgroundColor: '#FFFFFF'
        },
        infoContainer: {
            backgroundColor: 'powderblue',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            // top: HeaderTop + HeaderSize,
            left: 0,
            right: 0,
            // paddingTop: 0,
            zIndex: 1,
        },
        container: {
            // flex: 1,
            position: 'absolute',
            zIndex: -1,
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'powderblue',
            height: maxHeight,
            width: 300,
        },
        containerFake: {
            // flex: 1,
            justifyContent: 'center',
            // height: InfoViewHeight,
            alignItems: 'center',
            // backgroundColor: 'red',
            width: 300,

        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: getRatio(10),
            paddingHorizontal: getRatio(60),
            justifyContent: 'space-evenly',
            // backgroundColor: 'pink'
        },
        column: {
            width: getRatio(98),
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
        titleContainer: {
            marginTop: HeaderTop,
            marginBottom: HeaderBottomMargin,
        },
        recipeName: {
            textAlign: 'center',
            fontSize: 28,
            fontFamily: SourceCodeProRegular,
            color: '#181818',
            fontWeight: '600',
            marginBottom: getRatio(4),
        },
        author: {
            textAlign: 'center',
            fontSize: 14,
            fontFamily: SourceCodeProRegular,
            color: '#666666',
        },
        stepsContainer: {
            width: '100%',
            flex: 1,
            alignContent: 'space-around',
            marginBottom: getRatio(16),
            paddingRight: getRatio(40),
            paddingLeft: getRatio(40),
            backgroundColor: '#FFFFFF',
        },
        stepsHeaderView: {
            marginTop: 12,
            marginBottom: 4,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        stepView: {
            marginTop: getRatio(24),
        },
        stepRowView: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: getRatio(12),
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
            marginBottom: getRatio(12),
        },
        activeStepsTimeText: {
            fontSize: 14,
            color: '#181818',
            fontFamily: SourceCodeProRegular,
            marginRight: getRatio(4),
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
            marginBottom: getRatio(12),
        },
        stepsTimeText: {
            fontSize: 14,
            color: '#181818',
            fontFamily: SourceCodeProRegular,
            marginRight: getRatio(4),
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
            width: getRatio(224),
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

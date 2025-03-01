// import * as React from 'react'

import { StyleSheet, Image, ScrollView, View, Text, Animated, Dimensions, Button, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

const recipeJson: string = `{
    "method": "Inverted",
    "coffeeAmount": "16g",
    "paper": "3/Rinsed/Paper",
    "grindSize": "6/10 Medium",
    "waterAmount": "450g",
    "temperature": "89°C",
    "steps": [
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" },
      { "name": "Add Water", "desc": "Add 100 g water", "time": "30s" }
    ]
  }`;
  
  
  
  const SourceCodeProRegular: string = 'Source Code Pro'
  
  const designWidth: number = 390.0;
  const designHeight: number = 844.0;
  
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



const App: React.FC = () => {
    const recipeName: string = 'WAC\' 23 1st';
    const author: string = 'by Tap Wipvasutt';
  
  
    const icons: string[] = [
      '🔥',
      '🔥',
      '🔥',
      '🔥',
      '🔥',
      '🔥',
    ];
  
    type Recipe = {
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
  
    enum TimerState {
      None,
      Running,
      Pause,
    }
    const [timerState, setTimerState] = useState(TimerState.None);
  
    const scrollOffsetValueY = useRef(new Animated.Value(0)).current;
    const maxHeight = getRatio(220);
    const minHeight = getRatio(0);
  
    const animateHeaderHeight =
      scrollOffsetValueY.interpolate({
        inputRange: [0, maxHeight - minHeight],
        outputRange: [maxHeight, minHeight],
        extrapolate: 'clamp'
      });
  
    const alpha = scrollOffsetValueY.interpolate({
      inputRange: [0, (maxHeight - minHeight) * 0.5, maxHeight - minHeight],
      outputRange: [1.0, 0.0, 0.0],
      extrapolate: 'clamp'
    })
  
    // State for the elapsed time in seconds
    const [time, setTime] = useState<number>(0);
    // State to track whether the timer is active
    const [isActive, setIsActive] = useState<boolean>(false);
    // State to track whether the timer is paused
    const [isPaused, setIsPaused] = useState<boolean>(false);
    // A ref to store the interval ID (the type depends on the environment)
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  
  
    // Function to start the timer
    const handleStart = () => {
      setIsActive(true);
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    };
  
    // Function to pause the timer
    const handlePause = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPaused(true);
    };
  
    // Function to resume the timer
    const handleResume = () => {
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    };
  
    // Function to reset the timer
    const handleReset = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
      setIsPaused(false);
      setTime(0);
    };
  
    // Cleanup interval when component unmounts
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    return (
        <View style={[styles.rootContainer,]}>
          <View style={[styles.title,]}>
            <Text style={[styles.recipeName,]}>{recipeName}</Text>
            <Text style={[styles.author,]}>{author}</Text>
          </View>
          <Animated.View style={[styles.header, { opacity: alpha, height: animateHeaderHeight }]}>
    
    
            <View style={styles.container}>
              {/* Row 1 */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.method}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.coffeeAmount}</Text>
                </View>
              </View>
    
              {/* Row 2 */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.paper}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.grindSize}</Text>
                </View>
              </View>
    
              {/* Row 3 */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.waterAmount}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.column}>
                  <View style={styles.circle} />
                  <Text style={styles.text}>{recipe.temperature}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
          <View style={[styles.stepsContainer]}>
            <View style={[styles.stepsHeaderView]}>
              <Text style={[styles.stepsText]}>Steps</Text>
              <Text style={[styles.stepsText]}>{formatTime(time)}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetValueY } } }], { useNativeDriver: false })}
            >
              {
                recipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepView} >
                    <View style={[styles.stepRowView]}>
                      <Text style={[styles.stepNameText]}>{step.name}</Text>
                      <Text style={[styles.stepsTimeText]}>{step.time}</Text>
                    </View>
                    <Text style={[styles.stepsDescText]}>{step.desc}</Text>
                    <View
                      style={[styles.horizontalLine]}></View>
                  </View>
                ))
              }
            </ScrollView>
          </View>
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
        </View >
      );
}


/*
https://clintgoodman27.medium.com/how-to-make-your-react-native-project-work-for-the-web-560f0cba72e2
https://aureliomerenda.medium.com/create-a-native-web-app-with-react-native-web-419acac86b82
*/






// export default function Index() {
  


  
// }

const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getRatio(10),
      paddingHorizontal: getRatio(60),
      justifyContent: 'space-evenly',
    },
    column: {
      width: getRatio(98),
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,

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
      // fontFamily:SourceCodeProRegular,
    },




    rootContainer: {
      // width: getRatio(designWidth),
      // height: getRatio(designHeight),
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    header: {
      // backgroundColor: 'powderblue',
      justifyContent: 'center',
      alignItems: 'center',
      left: 0,
      right: 0,
      paddingTop: 0,
    },
    title: {
      marginTop: getRatio(76),
      marginBottom: getRatio(24),
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

    },
    // infoElement: {
    //   paddingHorizontal: "1%",
    //   paddingVertical: "1%",
    //   borderRadius: "1%",
    //   // backgroundColor: 'oldlace',
    //   marginHorizontal: '1%',
    //   marginBottom: "1%",
    //   minWidth: '40%',
    //   textAlign: 'center',
    // },
    // infoText: {
    //   fontSize: 14,
    //   color: '#666666',
    //   textAlign: 'center',
    //   fontFamily: SourceCodeProRegular,
    // },
    // infoSpace: {
    //   height: 4,
    // },
    stepsHeaderView: {
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
    stepNameText: {
      fontSize: 14,
      fontFamily: SourceCodeProRegular,
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
      marginBottom: getRatio(48),
    },
    buttonRow: {
      flexDirection: 'row',
    },
    button: {
      backgroundColor: 'white',
      borderRadius: 8,
      borderWidth: 1,
      width: getRatio(224),
      height: getRatio(50),
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

export default App;

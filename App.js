import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';

// Keep the splash screen visible while we set up
SplashScreen.preventAutoHideAsync();

// Your existing StaticGrid component for the modal
const { width, height } = Dimensions.get('window');
const GRID_SIZE = 4;
const COLS = Math.ceil(width / GRID_SIZE);
const ROWS = Math.ceil(height / GRID_SIZE);

function generateStaticGrid() {
  const grid = [];
  
  // Calculate sine wave for intensity (1 second cycle)
  const timeInSeconds = Date.now() / 5000;
  const sineValue = Math.sin(2 * Math.PI * timeInSeconds); // -1 to 1
  
  // Map sine wave (-1 to 1) to intensity range (150 to 250)
  const minIntensity = 150;
  const maxIntensity = 250;
  const intensityRange = maxIntensity - minIntensity;
  const currentMaxGray = minIntensity + (sineValue + 1) / 2 * intensityRange;
  
  for (let i = 0; i < ROWS * COLS; i++) {
    const gray = Math.floor(Math.random() * currentMaxGray);
    grid.push(gray);
  }
  return grid;
}

function StaticGrid() {
  const [grid, setGrid] = useState(() => generateStaticGrid());

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(generateStaticGrid());
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.staticContainer}>
      {grid.map((gray, index) => (
        <View
          key={index}
          style={[
            styles.staticPixel,
            { backgroundColor: `rgb(${gray}, ${gray}, ${gray})` }
          ]}
        />
      ))}
    </View>
  );
}

// Custom Lottie Splash Screen Component
function LottieSplashScreen({ onFinish }) {
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    // Auto-finish splash after 3 seconds as backup
    const timeout = setTimeout(() => {
      if (!animationFinished) {
        onFinish();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [animationFinished, onFinish]);

  return (
    <View style={styles.splashContainer}>
      <LottieView
        source={require('./assets/animation.json')} // Your Lottie file here
        autoPlay
        loop={false} // Set to true if you want it to loop
        style={styles.lottieAnimation}
        onAnimationFinish={() => {
          setAnimationFinished(true);
          onFinish();
        }}
      />
      
      {/* Optional: Add your app text over the animation */}
      <View style={styles.splashTextContainer}>
        <Text style={styles.splashText}>nothing ever changes</Text>
      </View>
      
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showLottieSplash, setShowLottieSplash] = useState(true);
  const [showStaticModal, setShowStaticModal] = useState(false);

  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Preload any resources here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady && !showLottieSplash) {
      // This tells the default splash screen to hide
      await SplashScreen.hideAsync();
    }
  }, [isAppReady, showLottieSplash]);

  const handleSplashFinish = useCallback(() => {
    setShowLottieSplash(false);
  }, []);

  // Show Lottie splash screen
  if (showLottieSplash) {
    return (
      <LottieSplashScreen onFinish={handleSplashFinish} />
    );
  }

  // App not ready yet
  if (!isAppReady) {
    return null;
  }

  // Main app
  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Main App Screen */}
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={() => setShowStaticModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.text}>nothing ever changes</Text>
        {/* <Text style={styles.subtitle}>tap to see static</Text> */}
      </TouchableOpacity>

      {/* Static Modal (your existing modal) */}
      {showStaticModal && (
        <View style={styles.staticModalContainer}>
          <StaticGrid />
          
          <TouchableOpacity 
            style={styles.closeArea}
            onPress={() => setShowStaticModal(false)}
            activeOpacity={1}
          >
            <View style={styles.closeButton}>
              <Text style={styles.closeText}>tap to close</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Lottie Splash Screen
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  splashTextContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  splashText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Main App
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Static Modal (same as before)
  staticModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  staticContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: COLS * GRID_SIZE,
    height: ROWS * GRID_SIZE,
  },
  staticPixel: {
    width: GRID_SIZE,
    height: GRID_SIZE,
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 50,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
  },
});
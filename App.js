import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 8; // Size of each static "pixel"
const COLS = Math.ceil(width / GRID_SIZE);
const ROWS = Math.ceil(height / GRID_SIZE);

function generateStaticGrid() {
  const grid = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    // Random grayscale value
    const gray = Math.floor(Math.random() * 256);
    grid.push(gray);
  }
  return grid;
}

function StaticGrid({ grid }) {
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

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showStatic, setShowStatic] = useState(true);
  const [staticGrid, setStaticGrid] = useState(() => generateStaticGrid());

  // Animate the static effect
  useEffect(() => {
    if (!showStatic) return;
    
    const interval = setInterval(() => {
      setStaticGrid(generateStaticGrid());
    }, 200); // Update every 50ms for smooth static effect

    // Hide static after 3 seconds
    const timeout = setTimeout(() => {
      setShowStatic(false);
      SplashScreen.hideAsync();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showStatic]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync(Entypo.font);
        
        // Artificially delay for 2 seconds to simulate a slow loading experience
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (showStatic) {
    return (
      <View style={styles.container}>
        <StaticGrid grid={staticGrid} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.appContainer} onLayout={onLayoutRootView}>
      <Text style={styles.text}>nothing ever changes</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '300',
  },
});
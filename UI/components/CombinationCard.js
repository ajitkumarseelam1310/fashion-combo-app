import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CATEGORY_KEYS = ['top', 'bottom', 'handbag', 'shoes', 'accessories'];

export default function CombinationCard({ combination }) {
  return (
    <View style={styles.container}>
      {CATEGORY_KEYS.map((key) => (
        <Image
          key={key}
          source={{ uri: `http://localhost:3000/assets/${key}s/${combination[key]}` }}
          style={styles.image}
          resizeMode="contain"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10
  },
  image: {
    width: 120,
    height: 120,
    margin: 5
  }
});

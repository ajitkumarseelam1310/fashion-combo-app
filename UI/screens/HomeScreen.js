import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const SERVER_URL = 'http://localhost:3000'; // use your IP if on physical device
const CATEGORY_KEYS = ['top', 'bottom', 'handbag', 'shoes', 'accessories'];

export default function HomeScreen() {
  const [combination, setCombination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState({}); // e.g., { top: 'accept', shoes: 'reject' }

  const fetchCombination = async () => {
    setLoading(true);
    setDecisions({});
    try {
      const response = await axios.get(`${SERVER_URL}/combination`);
      setCombination(response.data);
    } catch (err) {
      Alert.alert('No More Combinations');
      setCombination(null);
    }
    setLoading(false);
  };

  const handleDecision = (key, choice) => {
    setDecisions((prev) => ({ ...prev, [key]: choice }));
  };

  const handleNext = async () => {
    if (CATEGORY_KEYS.some((key) => !decisions[key])) {
      Alert.alert('Please decide Accept or Reject for each item');
      return;
    }

    const isAccepted = Object.values(decisions).every((v) => v === 'accept');
    const endpoint = isAccepted ? 'accept' : 'reject';

    try {
      await axios.post(`${SERVER_URL}/${endpoint}`, combination);
      fetchCombination();
    } catch (err) {
      Alert.alert('Error submitting decision');
    }
  };

  useEffect(() => {
    fetchCombination();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      {combination ? (
        <>
          {CATEGORY_KEYS.map((key) => (
            <View key={key} style={styles.itemBlock}>
              <Text style={styles.label}>{key.toUpperCase()}</Text>
              <View style={styles.imageRow}>
                <ImageDisplay uri={`http://localhost:3000/assets/${key}s/${combination[key]}`} />
                <View style={styles.iconGroup}>
                  <TouchableOpacity
                    onPress={() => handleDecision(key, 'accept')}
                    style={[
                      styles.iconButton,
                      decisions[key] === 'accept' && styles.selectedAccept
                    ]}
                  >
                    <MaterialIcons name="check-circle" size={30} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDecision(key, 'reject')}
                    style={[
                      styles.iconButton,
                      decisions[key] === 'reject' && styles.selectedReject
                    ]}
                  >
                    <MaterialIcons name="cancel" size={30} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.nextButton,
              Object.keys(decisions).length === 5 ? {} : { opacity: 0.5 }
            ]}
            onPress={handleNext}
            disabled={Object.keys(decisions).length !== 5}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noMoreText}>No more combinations available</Text>
      )}
    </ScrollView>
  );
}

function ImageDisplay({ uri }) {
  return (
    <View style={styles.imageWrapper}>
      <Image source={{ uri }} style={styles.image} />
    </View>
  );
}

import { Image } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    alignItems: 'center'
  },
  itemBlock: {
    marginBottom: 20,
    width: '100%'
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'capitalize'
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  imageWrapper: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    marginRight: 10
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  iconGroup: {
    flexDirection: 'row'
  },
  iconButton: {
    marginHorizontal: 5,
    padding: 5
  },
  selectedAccept: {
    backgroundColor: '#d4f7d4',
    borderRadius: 5
  },
  selectedReject: {
    backgroundColor: '#f7d4d4',
    borderRadius: 5
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 30,
    width: '60%'
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  noMoreText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40
  }
});

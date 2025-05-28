
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// const API_URL = 'http://localhost:3000/api'; //local
const API_URL = '/api';

const categories = ['top', 'bottom', 'handbag', 'accessories', 'shoes'];

export default function App() {
  const [images, setImages] = useState({});
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCombination = async () => {
    setLoading(true);
    setDecisions({});
    try {
      const res = await fetch(`${API_URL}/combination`);
      const data = await res.json();
      setImages(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load images.');
      setLoading(false);
    }
  };

  const handleDecision = (cat, value) => {
    setDecisions(prev => ({ ...prev, [cat]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCombination: images,
          decisions,
        }),
      });
      const data = await response.json();
      if (!data.error) {
        setImages(data);
        setDecisions({});
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  useEffect(() => {
    fetchCombination();
  }, []);

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Fashion Combo Review</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {categories.map(cat => (
            <View key={cat} style={styles.card}>
              <Image
                source={{ uri: images[cat]?.url }}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.label}>{cat}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => handleDecision(cat, 'accept')}>
                  <Text style={{ color: decisions[cat] === 'accept' ? 'green' : 'gray', fontSize: 20 }}>✔</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDecision(cat, 'reject')}>
                  <Text style={{ color: decisions[cat] === 'reject' ? 'red' : 'gray', fontSize: 20 }}>✖</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, Object.keys(decisions).length < 5 && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={Object.keys(decisions).length < 5}
          >
            <Text style={styles.submitText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#E0E7FF',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4338CA',
  },
  scrollContainer: {
    padding: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    marginVertical: 8,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 90,
    borderRadius: 8,
  },
  label: {
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 6,
  },
  submitContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#4338CA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = '/api'; // Adjust if needed
const categories = ['top', 'bottom', 'handbag', 'accessories', 'shoes'];

export default function App() {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisionMade, setDecisionMade] = useState(false);
  const { width } = useWindowDimensions();

  const fetchCombination = async () => {
    setLoading(true);
    setDecisionMade(false);
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

  const handleDecision = async (decision) => {
    if (decisionMade) return;
    setDecisionMade(true);

    const decisions = {};
    categories.forEach(cat => {
      decisions[cat] = decision;
    });

    try {
      await fetch(`${API_URL}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCombination: images,
          decisions,
        }),
      });
      fetchCombination();
    } catch (error) {
      console.error('Submission error:', error);
      setDecisionMade(false);
    }
  };

  const handleDownloadBoth = () => {
    window.open('/api/download/processed', '_blank');
    setTimeout(() => {
      window.open('/api/download/accepted', '_blank');
    }, 100);
  };

  useEffect(() => {
    fetchCombination();
  }, []);

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#60A5FA" />
    </View>
  );

  if (error) return (
    <View style={styles.loaderContainer}>
      <Text style={{ color: '#fff' }}>{error}</Text>
    </View>
  );

  // Calculate card widths based on screen width with minimal gaps
  const cardWidth = width * 0.29;  // ~3 cards per row with small margins
  const doubleCardWidth = width * 0.44; // ~2 cards per row wider cards

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Fashion Combo App</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* 3 cards in first row */}
        <View style={styles.row3}>
          {categories.slice(0, 3).map(cat => (
            <View key={cat} style={[styles.card, { width: cardWidth }]}>
              <Image
                source={{ uri: images[cat]?.url }}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.label}>{cat}</Text>
            </View>
          ))}
        </View>

        {/* 2 cards in second row */}
        <View style={styles.row2}>
          {categories.slice(3).map(cat => (
            <View key={cat} style={[styles.card, { width: doubleCardWidth }]}>
              <Image
                source={{ uri: images[cat]?.url }}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.label}>{cat}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.decisionButton, styles.rejectButton]}
            onPress={() => handleDecision('reject')}
            disabled={decisionMade}
          >
            <Text style={styles.decisionText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.decisionButton, styles.acceptButton]}
            onPress={() => handleDecision('accept')}
            disabled={decisionMade}
          >
            <Text style={styles.decisionText}>Accept</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.downloadContainer}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadBoth}>
            <Text style={styles.downloadText}>Download CSVs</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#60A5FA',
  },
  scrollContainer: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 40,
  },

  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between', // close spacing
    width: '100%',
    marginBottom: 15,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4, // small gap between cards
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  label: {
    marginTop: 8,
    fontWeight: '600',
    color: '#cbd5e1',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 40,
  },
  decisionButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  acceptButton: {
    backgroundColor: '#16A34A',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  decisionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  downloadContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  downloadButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

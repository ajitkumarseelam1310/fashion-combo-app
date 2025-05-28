
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// const API_URL = 'http://localhost:3000/api'; // Adjust if needed
const API_URL = '/api';
const categories = ['top', 'bottom', 'handbag', 'accessories', 'shoes'];

export default function App() {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisionMade, setDecisionMade] = useState(false);

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

  // Handle accept or reject for whole combination
  const handleDecision = async (decision) => {
    if (decisionMade) return; // prevent double click
    setDecisionMade(true);

    // Build decisions object for all categories same decision
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
      // Fetch next combo
      fetchCombination();
    } catch (error) {
      console.error('Submission error:', error);
      setDecisionMade(false);
    }
  };

  // Download helper


  const handleDownloadBoth = () => {
    window.open('/api/download/processed', '_blank');
    
      window.open('/api/download/accepted', '_blank');
    
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Fashion Combo App</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {categories.map((cat, i) => (
            <View
              key={cat}
              style={[
                styles.card,
                (i === 3 || i === 4) && styles.cardDouble, // last 2 images wider
              ]}
            >
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
    backgroundColor: '#1F2937', // dark slate gray
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#60A5FA',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    marginBottom: 20,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardDouble: {
    width: '45%',
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
    backgroundColor: '#16A34A', // green
  },
  rejectButton: {
    backgroundColor: '#DC2626', // red
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

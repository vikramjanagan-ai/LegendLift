import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function TestApp() {
  const [apiTest, setApiTest] = React.useState('Not tested');

  const testAPI = async () => {
    try {
      const response = await fetch('https://electro-provider-biology-editors.trycloudflare.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test',
          role: 'admin'
        })
      });
      const data = await response.json();
      setApiTest(`API Response: ${JSON.stringify(data).substring(0, 100)}`);
    } catch (error) {
      setApiTest(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LegendLift Test App</Text>
      <Text style={styles.subtitle}>Backend Connection Test</Text>
      
      <View style={styles.urlBox}>
        <Text style={styles.label}>API URL:</Text>
        <Text style={styles.url}>https://electro-provider-biology-editors.trycloudflare.com/api/v1</Text>
      </View>

      <Button title="Test API Connection" onPress={testAPI} />
      
      <View style={styles.resultBox}>
        <Text style={styles.result}>{apiTest}</Text>
      </View>

      <Text style={styles.hint}>If you see this screen, React Native is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  urlBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  url: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    minHeight: 80,
  },
  result: {
    fontSize: 12,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 30,
    fontStyle: 'italic',
  },
});

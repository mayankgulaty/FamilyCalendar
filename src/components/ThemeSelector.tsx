import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types/themes';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { state, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(state.currentTheme);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
  };

  const handleApplyTheme = () => {
    setTheme(selectedTheme);
    onClose();
  };

  const renderThemePreview = (theme: Theme) => {
    const isSelected = selectedTheme.id === theme.id;
    const isCurrent = state.currentTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.themeCard,
          isSelected && styles.selectedThemeCard,
        ]}
        onPress={() => handleThemeSelect(theme)}
      >
        <LinearGradient
          colors={theme.background.colors}
          style={styles.themePreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.themeInfo}>
            <Text style={[styles.themeName, { color: theme.text.primary }]}>
              {theme.name}
            </Text>
            <Text style={[styles.themeDescription, { color: theme.text.secondary }]}>
              {theme.description}
            </Text>
          </View>
          
          <View style={styles.themeIndicators}>
            {isCurrent && (
              <View style={styles.currentIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.currentText}>Current</Text>
              </View>
            )}
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="radio-button-on" size={20} color="white" />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Theme</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.themesList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.themesGrid}>
              {state.availableThemes.map(renderThemePreview)}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: selectedTheme.accent }
              ]}
              onPress={handleApplyTheme}
            >
              <Text style={styles.applyButtonText}>Apply Theme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  themesList: {
    maxHeight: 400,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (screenWidth - 120) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedThemeCard: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowOpacity: 0.2,
  },
  themePreview: {
    height: 120,
    padding: 16,
    justifyContent: 'space-between',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
    opacity: 0.9,
  },
  themeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  selectedIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundService, BackgroundSettings, BackgroundImage } from '../services/backgroundService';

interface BackgroundSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: BackgroundSettings) => void;
  onBackgroundRefresh?: () => void;
}

export default function BackgroundSettingsModal({
  visible,
  onClose,
  onSettingsChange,
  onBackgroundRefresh,
}: BackgroundSettingsModalProps) {
  const [settings, setSettings] = useState<BackgroundSettings>({
    enabled: false,
    refreshFrequency: 'daily',
    category: 'nature',
    blur: 0,
    opacity: 0.8,
  });
  const [loading, setLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<BackgroundImage | null>(null);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const backgroundSettings = await BackgroundService.getBackgroundSettings();
      setSettings(backgroundSettings);
      
      const background = await BackgroundService.getCurrentBackground();
      setCurrentBackground(background);
    } catch (error) {
      console.error('Failed to load background settings:', error);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    await BackgroundService.saveBackgroundSettings(newSettings);
    onSettingsChange?.(newSettings);
    
    if (enabled && !currentBackground) {
      // Fetch initial background when enabling
      handleRefreshBackground();
    }
  };

  const handleFrequencyChange = async (frequency: 'daily' | 'weekly' | 'manual') => {
    const newSettings = { ...settings, refreshFrequency: frequency };
    setSettings(newSettings);
    await BackgroundService.saveBackgroundSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleCategoryChange = async (category: string) => {
    const newSettings = { ...settings, category };
    setSettings(newSettings);
    await BackgroundService.saveBackgroundSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleBlurChange = async (blur: number) => {
    const newSettings = { ...settings, blur };
    setSettings(newSettings);
    await BackgroundService.saveBackgroundSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleOpacityChange = async (opacity: number) => {
    const newSettings = { ...settings, opacity };
    setSettings(newSettings);
    await BackgroundService.saveBackgroundSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleRefreshBackground = async () => {
    try {
      setLoading(true);
      const newBackground = await BackgroundService.forceRefreshBackground();
      setCurrentBackground(newBackground);
      onBackgroundRefresh?.();
    } catch (error) {
      console.error('Failed to refresh background:', error);
      Alert.alert('Error', 'Failed to refresh background image');
    } finally {
      setLoading(false);
    }
  };

  const handleClearBackground = async () => {
    try {
      await BackgroundService.clearBackground();
      setCurrentBackground(null);
      onBackgroundRefresh?.();
    } catch (error) {
      console.error('Failed to clear background:', error);
      Alert.alert('Error', 'Failed to clear background');
    }
  };

  const categories = BackgroundService.getBackgroundCategories();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Background Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Enable/Disable Background */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dynamic Background</Text>
                <Text style={styles.settingDescription}>
                  Enable beautiful background images that refresh automatically
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                thumbColor={settings.enabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {settings.enabled && (
              <>
                {/* Refresh Frequency */}
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Refresh Frequency</Text>
                  <View style={styles.frequencyOptions}>
                    {[
                      { key: 'daily', label: 'Daily', icon: 'sunny' },
                      { key: 'weekly', label: 'Weekly', icon: 'calendar' },
                      { key: 'manual', label: 'Manual', icon: 'hand-left' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.frequencyOption,
                          settings.refreshFrequency === option.key && styles.frequencyOptionActive,
                        ]}
                        onPress={() => handleFrequencyChange(option.key as any)}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={settings.refreshFrequency === option.key ? '#6366f1' : '#6b7280'}
                        />
                        <Text
                          style={[
                            styles.frequencyOptionText,
                            settings.refreshFrequency === option.key && styles.frequencyOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Category Selection */}
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Background Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          settings.category === category && styles.categoryChipActive,
                        ]}
                        onPress={() => handleCategoryChange(category)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            settings.category === category && styles.categoryChipTextActive,
                          ]}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Blur Effect */}
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Blur Effect</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>None</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      value={settings.blur}
                      onValueChange={handleBlurChange}
                      minimumTrackTintColor="#6366f1"
                      maximumTrackTintColor="#e5e7eb"
                      thumbStyle={styles.sliderThumb}
                    />
                    <Text style={styles.sliderLabel}>Strong</Text>
                  </View>
                </View>

                {/* Opacity */}
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Background Opacity</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Transparent</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0.1}
                      maximumValue={1}
                      value={settings.opacity}
                      onValueChange={handleOpacityChange}
                      minimumTrackTintColor="#6366f1"
                      maximumTrackTintColor="#e5e7eb"
                      thumbStyle={styles.sliderThumb}
                    />
                    <Text style={styles.sliderLabel}>Opaque</Text>
                  </View>
                </View>

                {/* Current Background Info */}
                {currentBackground && (
                  <View style={styles.settingSection}>
                    <Text style={styles.sectionTitle}>Current Background</Text>
                    <View style={styles.currentBackgroundInfo}>
                      <Text style={styles.backgroundInfoText}>
                        Author: {currentBackground.author}
                      </Text>
                      <Text style={styles.backgroundInfoText}>
                        Updated: {new Date(currentBackground.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.refreshButton]}
                    onPress={handleRefreshBackground}
                    disabled={loading}
                  >
                    <Ionicons name="refresh" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>
                      {loading ? 'Refreshing...' : 'Refresh Now'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.clearButton]}
                    onPress={handleClearBackground}
                  >
                    <Ionicons name="trash" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Clear Background</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    minHeight: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  settingSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  frequencyOptionTextActive: {
    color: '#6366f1',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#6366f1',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 16,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  sliderThumb: {
    backgroundColor: '#6366f1',
    width: 20,
    height: 20,
  },
  currentBackgroundInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  backgroundInfoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#6366f1',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

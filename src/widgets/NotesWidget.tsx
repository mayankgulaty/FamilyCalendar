import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface NotesWidgetProps {
  onNoteAdded?: (note: Note) => void;
}

export default function NotesWidget({ onNoteAdded }: NotesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('family_notes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (notesToSave: Note[]) => {
    try {
      await AsyncStorage.setItem('family_notes', JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = async () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date(),
      };

      const updatedNotes = [note, ...notes].slice(0, 10); // Keep only last 10 notes
      setNotes(updatedNotes);
      setNewNote('');
      setIsAdding(false);
      await saveNotes(updatedNotes);
      onNoteAdded?.(note);
    }
  };

  const deleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
            await saveNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="document-text" size={24} color="white" />
            <Text style={styles.title}>Family Notes</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isAdding && (
            <View style={styles.addNoteContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a family note..."
                value={newNote}
                onChangeText={setNewNote}
                multiline
                autoFocus
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
              <View style={styles.addNoteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewNote('');
                    setIsAdding(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addNote}
                  disabled={!newNote.trim()}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {notes.length === 0 && !isAdding ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={32} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first note</Text>
            </View>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <Text style={styles.noteText}>{note.text}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteTime}>{formatTimestamp(note.timestamp)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNote(note.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    minHeight: 300,
    height: '100%', // Take full height of parent
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  addNoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
});

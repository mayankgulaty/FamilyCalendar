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

interface Task {
  id: string;
  text: string;
  completed: boolean;
  timestamp: Date;
}

interface QuickTasksWidgetProps {
  onTaskAdded?: (task: Task) => void;
  onTaskCompleted?: (task: Task) => void;
}

export default function QuickTasksWidget({ onTaskAdded, onTaskCompleted }: QuickTasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('family_tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          timestamp: new Date(task.timestamp),
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem('family_tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        timestamp: new Date(),
      };

      const updatedTasks = [task, ...tasks].slice(0, 8); // Keep only last 8 tasks
      setTasks(updatedTasks);
      setNewTask('');
      setIsAdding(false);
      await saveTasks(updatedTasks);
      onTaskAdded?.(task);
    }
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        if (!task.completed) {
          onTaskCompleted?.(updatedTask);
        }
        return updatedTask;
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.title}>Quick Tasks</Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {completedTasks}/{totalTasks}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }
                ]} 
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isAdding && (
            <View style={styles.addTaskContainer}>
              <TextInput
                style={styles.taskInput}
                placeholder="Add a task..."
                value={newTask}
                onChangeText={setNewTask}
                autoFocus
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
              <View style={styles.addTaskActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewTask('');
                    setIsAdding(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addTask}
                  disabled={!newTask.trim()}
                >
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {tasks.length === 0 && !isAdding ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={32} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  task.completed && styles.taskItemCompleted
                ]}
                onPress={() => toggleTask(task.id)}
              >
                <View style={styles.taskContent}>
                  <Ionicons
                    name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={task.completed ? "#10b981" : "rgba(255, 255, 255, 0.7)"}
                    style={styles.taskIcon}
                  />
                  <Text style={[
                    styles.taskText,
                    task.completed && styles.taskTextCompleted
                  ]}>
                    {task.text}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {!isAdding && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        )}
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
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  addTaskContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  taskInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  addTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  taskItemCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskText: {
    color: 'white',
    fontSize: 15,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

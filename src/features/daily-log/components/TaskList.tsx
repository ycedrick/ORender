import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, VStack, HStack, Button } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { TaskItem } from '../hooks/use-create-log-screen';

interface TaskListProps {
  tasks: TaskItem[];
  onChange: (tasks: TaskItem[]) => void;
  error?: string;
}

export const TaskList = ({ tasks, onChange, error }: TaskListProps) => {
  const { theme, isDark } = useTheme();
  const [newTaskText, setNewTaskText] = useState('');

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addTask = () => {
    if (newTaskText.trim().length === 0) return;
    const newTask: TaskItem = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
    };
    onChange([...tasks, newTask]);
    setNewTaskText(''); // clear input
  };

  const toggleTask = (id: string) => {
    onChange(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: string) => {
    onChange(tasks.filter(task => task.id !== id));
  };

  return (
    <VStack spacing="sm">
      <Text variant="sm" weight="medium">Tasks & Activities</Text>
      
      {/* List */}
      {tasks.length > 0 && (
        <VStack spacing="xs" style={styles.listContainer}>
          {tasks.map((task) => (
            <HStack key={task.id} style={styles.taskItem} spacing="sm">
              <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox, 
                  { borderColor: theme.colors.border.default },
                  task.completed && { backgroundColor: theme.colors.action.primary, borderColor: theme.colors.action.primary }
                ]}>
                  {task.completed && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={isDark ? '#000000' : '#FFFFFF'}
                    />
                  )}
                </View>
              </TouchableOpacity>
              
              <Text 
                style={[styles.taskText, task.completed && { color: theme.colors.text.tertiary, textDecorationLine: 'line-through' }]}
              >
                {task.text}
              </Text>

              <TouchableOpacity onPress={() => removeTask(task.id)} style={styles.removeBtn}>
                <Text color={theme.colors.action.danger} variant="xs">Remove</Text>
              </TouchableOpacity>
            </HStack>
          ))}
        </VStack>
      )}

      {/* Add New */}
      <HStack spacing="sm" style={styles.inputRow}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface.input, 
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.default 
          }]}
          placeholder="What did you work on?"
          placeholderTextColor={theme.colors.text.tertiary}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={addTask}
        />
        <Button 
          title="Add" 
          size="sm" 
          onPress={addTask} 
          disabled={newTaskText.trim().length === 0}
        />
      </HStack>
      {error && <Text variant="xs" color={theme.colors.action.danger}>{error}</Text>}
    </VStack>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: 8,
  },
  taskItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  inputRow: {
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  }
});

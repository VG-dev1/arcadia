"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

interface Task {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

interface UserProfile {
  uid: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  allTasks: Record<string, Task[]>;
  setAllTasks: (tasks: Record<string, Task[]>) => void;
  addTask: (date: string, task: Task) => Promise<void>;
  updateTask: (date: string, taskId: string, task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (date: string, taskId: string) => Promise<void>;
  loadTasks: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.uid);
        await loadTasksFromFirestore(currentUser.uid);
      } else {
        setUserProfile(null);
        setAllTasks({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          uid: userId,
          email: data.email || '',
          username: data.username || '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadTasksFromFirestore = async (userId: string) => {
    try {
      const tasks: Record<string, Task[]> = {};
      const tasksCollectionRef = collection(db, 'users', userId, 'tasks');

      const dateSnapshots = await getDocs(tasksCollectionRef);

      for (const dateDoc of dateSnapshots.docs) {
        const dateStr = dateDoc.id;
        const itemsRef = collection(db, 'users', userId, 'tasks', dateStr, 'items');
        const itemSnapshots = await getDocs(itemsRef);

        tasks[dateStr] = itemSnapshots.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
      }
      console.log("Loaded Tasks:", tasks)
      setAllTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setAllTasks({});
    }
  };

  const loadTasks = async () => {
    if (user) await loadTasksFromFirestore(user.uid);
  };

  const saveTaskToFirestore = async (date: string, taskId: string, taskData: Omit<Task, 'id'>) => {
    if (!user) return;
    try {
      const dateDocRef = doc(db, 'users', user.uid, 'tasks', date);
      await setDoc(dateDocRef, { initialized: true }, { merge: true });

      const taskDocRef = doc(db, 'users', user.uid, 'tasks', date, 'items', taskId);
      await setDoc(taskDocRef, { ...taskData, id: taskId });
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  };

  const addTask = async (date: string, task: Task) => {
    const prev = { ...allTasks };
    setAllTasks({ ...allTasks, [date]: [...(allTasks[date] || []), task] });
    try {
      await saveTaskToFirestore(date, task.id, { ...task });
    } catch (e) {
      setAllTasks(prev);
      throw e;
    }
  };

  const updateTask = async (date: string, taskId: string, updatedTask: Omit<Task, 'id'>) => {
    const prev = { ...allTasks };
    setAllTasks({
      ...allTasks,
      [date]: (allTasks[date] || []).map((t) => t.id === taskId ? { ...updatedTask, id: taskId } : t),
    });
    try {
      await saveTaskToFirestore(date, taskId, updatedTask);
    } catch (e) {
      setAllTasks(prev);
      throw e;
    }
  };

  const deleteTask = async (date: string, taskId: string) => {
    const prev = { ...allTasks };
    setAllTasks({
      ...allTasks,
      [date]: (allTasks[date] || []).filter((t) => t.id !== taskId),
    });
    try {
      const taskDocRef = doc(db, 'users', user!.uid, 'tasks', date, 'items', taskId);
      await deleteDoc(taskDocRef);
    } catch (e) {
      setAllTasks(prev);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, allTasks, setAllTasks, addTask, updateTask, deleteTask, loadTasks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
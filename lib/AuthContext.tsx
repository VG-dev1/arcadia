"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  collectionGroup, 
  query 
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface RepeatConfig {
  count: number;
  unit: 'days' | 'weeks' | 'months' | 'years' | 'weekdays';
}

export interface Task {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  categoryId?: string;
  repeat?: RepeatConfig;
  repeatOrigin?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  username?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  allTasks: Record<string, Task[]>;
  categories: Category[];
  setAllTasks: (tasks: Record<string, Task[]>) => void;
  addTask: (date: string, task: Task) => Promise<void>;
  updateTask: (date: string, taskId: string, task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (date: string, taskId: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.uid);
        await loadCategoriesFromFirestore(currentUser.uid);
        await loadTasksFromFirestore(currentUser.uid);
      } else {
        setUserProfile(null);
        setAllTasks({});
        setCategories([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserProfile({ uid, ...userDoc.data() } as UserProfile);
      } else {
        const initialProfile: UserProfile = {
          uid, 
          email: auth.currentUser?.email || null, 
          username: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
          createdAt: new Date() 
        };
        await setDoc(userDocRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error managing user profile:', error);
    }
  };

  const loadCategoriesFromFirestore = async (userId: string) => {
    try {
      const categoriesCollectionRef = collection(db, 'users', userId, 'categories');
      const snapshot = await getDocs(categoriesCollectionRef);
      
      let loadedCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      if (loadedCategories.length === 0) {
        const defaultDocRef = doc(db, 'users', userId, 'categories', 'general');
        await setDoc(defaultDocRef, { name: 'General' });
        loadedCategories = [{ id: 'general', name: 'General' }];
      }

      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([{ id: 'general', name: 'General' }]);
    }
  };

  const addCategory = async (name: string): Promise<Category> => {
    if (!user) throw new Error("User not authenticated");

    const id = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newCategory = { id, name: name.trim() };

    try {
      const catDocRef = doc(db, 'users', user.uid, 'categories', id);
      await setDoc(catDocRef, { name: name.trim() });
      
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Error saving category document:", error);
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    const catDocRef = doc(db, 'users', user.uid, 'categories', id);
    await setDoc(catDocRef, { name: name.trim() }, { merge: true });
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: name.trim() } : c));
  };

  const loadTasksFromFirestore = async (userId: string) => {
    try {
      const itemsQuery = query(collectionGroup(db, 'items'));
      const querySnapshot = await getDocs(itemsQuery);
      const tasksMap: Record<string, Task[]> = {};
      
      querySnapshot.docs.forEach((docSnapshot) => {
        const path = docSnapshot.ref.path;
        if (path.startsWith(`users/${userId}/`)) {
          // docSnapshot.ref.parent.parent is the subcollection's parent document (the date folder)
          const dateKey = docSnapshot.ref.parent.parent?.id;
          if (dateKey) {
            const data = docSnapshot.data();
            const task: Task = {
              id: docSnapshot.id,
              name: data.name,
              start: data.start,
              end: data.end,
              color: data.color,
              categoryId: data.categoryId || 'general',
              repeat: data.repeat,
              // FIX: If repeatOrigin field doesn't exist on the document, fall back to its actual dateKey folder name
              repeatOrigin: data.repeatOrigin || dateKey,
            };
            if (!tasksMap[dateKey]) {
              tasksMap[dateKey] = [];
            }
            tasksMap[dateKey].push(task);
          }
        }
      });
      setAllTasks(tasksMap);
    } catch (error) {
      console.error('Error querying system tasks collection group:', error);
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

      const cleanData = Object.fromEntries(
        Object.entries(taskData).filter(([_, value]) => value !== undefined)
      );

      const taskDocRef = doc(db, 'users', user.uid, 'tasks', date, 'items', taskId);
      await setDoc(taskDocRef, { ...cleanData, id: taskId });
    } catch (error) {
      console.error('Error processing Firestore setDoc layout write:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const migratePromises: Promise<void>[] = [];
    Object.entries(allTasks).forEach(([date, dayTasks]) => {
      dayTasks.forEach((task) => {
        if (task.categoryId === id) {
          migratePromises.push(saveTaskToFirestore(date, task.id, { ...task, categoryId: 'general' }));
        }
      });
    });
    await Promise.all(migratePromises);

    setAllTasks(prev => {
      const updated: Record<string, Task[]> = {};
      for (const [date, dayTasks] of Object.entries(prev)) {
        updated[date] = dayTasks.map(t => t.categoryId === id ? { ...t, categoryId: 'general' } : t);
      }
      return updated;
    });

    const catDocRef = doc(db, 'users', user.uid, 'categories', id);
    await deleteDoc(catDocRef);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addTask = async (date: string, task: Task) => {
    const { id, ...taskData } = task;
    await saveTaskToFirestore(date, id, taskData);
    setAllTasks(prev => {
      const dayTasks = prev[date] || [];
      return { ...prev, [date]: [...dayTasks, task] };
    });
  };

  const updateTask = async (date: string, taskId: string, taskData: Omit<Task, 'id'>) => {
    await saveTaskToFirestore(date, taskId, taskData);
    setAllTasks(prev => {
      const dayTasks = prev[date] || [];
      const updated = dayTasks.map(t => t.id === taskId ? { ...taskData, id: taskId } : t);
      return { ...prev, [date]: updated };
    });
  };

  const deleteTask = async (date: string, taskId: string) => {
    if (!user) return;
    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', date, 'items', taskId);
      await deleteDoc(taskDocRef);
      
      setAllTasks(prev => {
        const dayTasks = prev[date] || [];
        const updated = dayTasks.filter(t => t.id !== taskId);
        return { ...prev, [date]: updated };
      });
    } catch (error) {
      console.error('Error processing item deletion write operation:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, userProfile, loading, allTasks, categories,
      setAllTasks, addTask, updateTask, deleteTask, loadTasks, addCategory, updateCategory, deleteCategory
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be called from inside an AuthProvider element scope');
  }
  return context;
};
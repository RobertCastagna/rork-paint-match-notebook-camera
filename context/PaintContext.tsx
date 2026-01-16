import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { PaintColor } from '@/types/paint';

const STORAGE_KEY = 'paint_colors';

export const [PaintProvider, usePaints] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<PaintColor[]>([]);

  const colorsQuery = useQuery({
    queryKey: ['paintColors'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) as PaintColor[] : [];
      } catch (error) {
        console.log('Error loading paint colors:', error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (colorsQuery.data) {
      setColors(colorsQuery.data);
    }
  }, [colorsQuery.data]);

  const { mutate: saveColors } = useMutation({
    mutationFn: async (updatedColors: PaintColor[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedColors));
      return updatedColors;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['paintColors'], data);
    },
  });

  const addColor = useCallback((color: Omit<PaintColor, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newColor: PaintColor = {
      ...color,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newColor, ...colors];
    setColors(updated);
    saveColors(updated);
    return newColor;
  }, [colors, saveColors]);

  const updateColor = useCallback((id: string, updates: Partial<Omit<PaintColor, 'id' | 'createdAt'>>) => {
    const updated = colors.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
    );
    setColors(updated);
    saveColors(updated);
  }, [colors, saveColors]);

  const deleteColor = useCallback((id: string) => {
    const updated = colors.filter((c) => c.id !== id);
    setColors(updated);
    saveColors(updated);
  }, [colors, saveColors]);

  const getColorById = useCallback((id: string) => {
    return colors.find((c) => c.id === id);
  }, [colors]);

  return {
    colors,
    isLoading: colorsQuery.isLoading,
    addColor,
    updateColor,
    deleteColor,
    getColorById,
  };
});

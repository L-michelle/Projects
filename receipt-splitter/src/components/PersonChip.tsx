import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

type Props = {
  name: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
};

export default function PersonChip({ name, selected, onPress, onRemove }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {name}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.remove, selected ? styles.removeSelected : styles.removeUnselected]}>
            {' ✕'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: '#009688',
    borderColor: '#009688',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#009688',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelUnselected: {
    color: '#009688',
  },
  remove: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeSelected: {
    color: '#FFFFFF',
  },
  removeUnselected: {
    color: '#009688',
  },
});

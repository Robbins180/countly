import React from 'react';
import { Pressable, View } from 'react-native';
import { useAccent } from '../app/_layout'; // path depends on where your _layout lives

const SWATCHES = ['indigo', 'emerald', 'amber'] as const;

export function PalettePicker() {
  const { accent, setAccent } = useAccent();

  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {SWATCHES.map((c) => (
        <Pressable
          key={c}
          onPress={() => setAccent(c)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            opacity: accent === c ? 1 : 0.6,
            borderWidth: accent === c ? 2 : 0,
            borderColor: '#00000033',
            backgroundColor:
              c === 'indigo' ? '#4f46e5' :
              c === 'emerald' ? '#10b981' :
              c === 'amber' ? '#f59e0b' :
              '#4f46e5',
          }}
        />
      ))}
    </View>
  );
}


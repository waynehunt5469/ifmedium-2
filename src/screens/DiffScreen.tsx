import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { getInterpretationHistory } from '../db';
import { InterpretationVersion } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Diff'>;

const fields: (keyof InterpretationVersion)[] = [
  'intentLabel',
  'toneLabel',
  'certainty',
  'concernsJson',
  'notes',
];

export function DiffScreen({ route }: Props) {
  const { messageId } = route.params;
  const [versions, setVersions] = useState<InterpretationVersion[]>([]);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const loaded = await getInterpretationHistory(messageId);
      setVersions(loaded);
      setLeftId(loaded[0]?.id ?? null);
      setRightId(loaded[1]?.id ?? loaded[0]?.id ?? null);
    })();
  }, [messageId]);

  const left = useMemo(() => versions.find((v) => v.id === leftId) ?? null, [versions, leftId]);
  const right = useMemo(() => versions.find((v) => v.id === rightId) ?? null, [versions, rightId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <Text>Select left version</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {versions.map((v) => (
          <Pressable
            key={`l-${v.id}`}
            onPress={() => setLeftId(v.id)}
            style={{ borderWidth: 1, borderColor: leftId === v.id ? '#1f6feb' : '#ccc', borderRadius: 8, padding: 8 }}
          >
            <Text>v{v.versionNumber}</Text>
          </Pressable>
        ))}
      </View>

      <Text>Select right version</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {versions.map((v) => (
          <Pressable
            key={`r-${v.id}`}
            onPress={() => setRightId(v.id)}
            style={{ borderWidth: 1, borderColor: rightId === v.id ? '#1f6feb' : '#ccc', borderRadius: 8, padding: 8 }}
          >
            <Text>v{v.versionNumber}</Text>
          </Pressable>
        ))}
      </View>

      {left && right ? (
        <View style={{ gap: 8 }}>
          {fields.map((field) => {
            const changed = left[field] !== right[field];
            return (
              <View key={field} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: changed ? '#fff4d6' : '#f8f8f8' }}>
                <Text style={{ fontWeight: '700' }}>{field}{changed ? ' (changed)' : ''}</Text>
                <Text>Left: {String(left[field] ?? '')}</Text>
                <Text>Right: {String(right[field] ?? '')}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text>Need at least one version.</Text>
      )}
    </ScrollView>
  );
}

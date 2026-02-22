import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { getInterpretationHistory } from '../db';
import { InterpretationVersion } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({ route }: Props) {
  const { messageId } = route.params;
  const [versions, setVersions] = useState<InterpretationVersion[]>([]);

  useEffect(() => {
    getInterpretationHistory(messageId).then(setVersions);
  }, [messageId]);

  return (
    <FlatList
      contentContainerStyle={{ padding: 12, gap: 8 }}
      data={versions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }}>
          <Text style={{ fontWeight: '700' }}>v{item.versionNumber}</Text>
          <Text>intent: {item.intentLabel}</Text>
          <Text>tone: {item.toneLabel}</Text>
          <Text>certainty: {item.certainty}</Text>
          <Text>concerns: {item.concernsJson}</Text>
          <Text>notes: {item.notes || '-'}</Text>
        </View>
      )}
    />
  );
}

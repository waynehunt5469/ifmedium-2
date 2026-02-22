import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { getLatestInterpretation, getMessage } from '../db';
import { InterpretationVersion, Message } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Message'>;

function Badge({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: '#e8eefc', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>
      <Text>{label}</Text>
    </View>
  );
}

export function MessageScreen({ route, navigation }: Props) {
  const { messageId } = route.params;
  const [message, setMessage] = useState<Message | null>(null);
  const [latest, setLatest] = useState<InterpretationVersion | null>(null);

  const load = useCallback(async () => {
    setMessage(await getMessage(messageId));
    setLatest(await getLatestInterpretation(messageId));
  }, [messageId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  if (!message) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Message not found</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      <Text style={{ fontWeight: '700' }}>Raw Text</Text>
      <Text style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }}>{message.rawText}</Text>

      {latest && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700' }}>Latest Interpretation (v{latest.versionNumber})</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Badge label={`intent: ${latest.intentLabel}`} />
            <Badge label={`tone: ${latest.toneLabel}`} />
            <Badge label={`certainty: ${latest.certainty}`} />
          </View>
        </View>
      )}

      <Button title="Edit Interpretation" onPress={() => navigation.navigate('EditInterpretation', { messageId })} />
      <Button title="History" onPress={() => navigation.navigate('History', { messageId })} />
      <Button title="Diff" onPress={() => navigation.navigate('Diff', { messageId })} />
    </View>
  );
}

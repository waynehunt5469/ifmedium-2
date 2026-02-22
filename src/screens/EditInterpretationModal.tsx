import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { createInterpretationVersion, getLatestInterpretation, getMessage } from '../db';
import { suggestInterpretation } from '../db/suggest';
import { INTENT_LABELS, InterpretationDraft, TONE_LABELS } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditInterpretation'>;

export function EditInterpretationModal({ route, navigation }: Props) {
  const { messageId } = route.params;
  const [draft, setDraft] = useState<InterpretationDraft>({
    intentLabel: 'inform',
    toneLabel: 'neutral',
    certainty: 50,
    concerns: [],
    notes: '',
  });
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    (async () => {
      const latest = await getLatestInterpretation(messageId);
      const msg = await getMessage(messageId);
      if (msg) setRawText(msg.rawText);
      if (latest) {
        setDraft({
          intentLabel: latest.intentLabel,
          toneLabel: latest.toneLabel,
          certainty: latest.certainty,
          concerns: JSON.parse(latest.concernsJson || '[]'),
          notes: latest.notes || '',
        });
      }
    })();
  }, [messageId]);

  const suggestion = suggestInterpretation(rawText);

  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Text style={{ fontWeight: '700' }}>Suggested (simulated)</Text>
      <Text>Intent: {suggestion.intentLabel} ({suggestion.intentConfidence})</Text>
      <Text>Tone: {suggestion.toneLabel} ({suggestion.toneConfidence})</Text>
      <Text>Certainty: {suggestion.suggestedCertainty}</Text>
      <Button
        title="Apply suggestion"
        onPress={() =>
          setDraft((current) => ({
            ...current,
            intentLabel: suggestion.intentLabel,
            toneLabel: suggestion.toneLabel,
            certainty: suggestion.suggestedCertainty,
          }))
        }
      />

      <Text style={{ fontWeight: '700' }}>Intent</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {INTENT_LABELS.map((item) => (
          <Button key={item} title={item} onPress={() => setDraft((v) => ({ ...v, intentLabel: item }))} />
        ))}
      </View>

      <Text style={{ fontWeight: '700' }}>Tone</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TONE_LABELS.map((item) => (
          <Button key={item} title={item} onPress={() => setDraft((v) => ({ ...v, toneLabel: item }))} />
        ))}
      </View>

      <Text>Certainty (0-100)</Text>
      <TextInput
        keyboardType="number-pad"
        value={String(draft.certainty)}
        onChangeText={(txt) => setDraft((v) => ({ ...v, certainty: Number(txt) || 0 }))}
        style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, padding: 10 }}
      />

      <Text>Concerns (comma-separated)</Text>
      <TextInput
        value={draft.concerns.join(', ')}
        onChangeText={(txt) =>
          setDraft((v) => ({
            ...v,
            concerns: txt
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
          }))
        }
        style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, padding: 10 }}
      />

      <Text>Notes</Text>
      <TextInput
        value={draft.notes}
        onChangeText={(notes) => setDraft((v) => ({ ...v, notes }))}
        multiline
        style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, padding: 10, minHeight: 70 }}
      />

      <Button
        title="Save as new version"
        onPress={async () => {
          await createInterpretationVersion(messageId, {
            ...draft,
            certainty: Math.max(0, Math.min(100, draft.certainty)),
          });
          navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

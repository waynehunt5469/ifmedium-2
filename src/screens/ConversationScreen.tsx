import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { createMessage, getMessages } from '../db';
import { Message } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ route, navigation }: Props) {
  const { conversationId, title } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [authorLabel, setAuthorLabel] = useState('me');
  const [rawText, setRawText] = useState('');

  const load = useCallback(async () => {
    setMessages(await getMessages(conversationId));
  }, [conversationId]);

  useEffect(() => {
    navigation.setOptions({ title });
    load();
  }, [navigation, title, load]);

  return (
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <TextInput
        placeholder="Author label"
        value={authorLabel}
        onChangeText={setAuthorLabel}
        style={{ borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="New message"
        value={rawText}
        onChangeText={setRawText}
        multiline
        style={{ borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 8, minHeight: 80 }}
      />
      <Button
        title="Add Message"
        onPress={async () => {
          if (!rawText.trim()) return;
          await createMessage(conversationId, authorLabel.trim(), rawText.trim());
          setRawText('');
          await load();
        }}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Message', { messageId: item.id })}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 8 }}
          >
            <Text style={{ fontWeight: '700' }}>{item.authorLabel}</Text>
            <Text numberOfLines={2}>{item.rawText}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

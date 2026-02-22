import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { createConversation, getConversations } from '../db';
import { Conversation } from '../db/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversations'>;

export function ConversationsListScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [title, setTitle] = useState('');

  const load = useCallback(async () => {
    setConversations(await getConversations());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, padding: 12, gap: 10 }}>
      <TextInput
        placeholder="New conversation title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 8 }}
      />
      <Button
        title="Create Conversation"
        onPress={async () => {
          await createConversation(title.trim());
          setTitle('');
          await load();
        }}
      />

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Conversation', { conversationId: item.id, title: item.title })}
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginTop: 8 }}
          >
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

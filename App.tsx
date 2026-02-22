import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initDb, seedIfNeeded } from './src/db';
import { ConversationScreen } from './src/screens/ConversationScreen';
import { ConversationsListScreen } from './src/screens/ConversationsListScreen';
import { DiffScreen } from './src/screens/DiffScreen';
import { EditInterpretationModal } from './src/screens/EditInterpretationModal';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { MessageScreen } from './src/screens/MessageScreen';

export type RootStackParamList = {
  Conversations: undefined;
  Conversation: { conversationId: string; title: string };
  Message: { messageId: string };
  EditInterpretation: { messageId: string };
  History: { messageId: string };
  Diff: { messageId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      await seedIfNeeded();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Conversations" component={ConversationsListScreen} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="Message" component={MessageScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Diff" component={DiffScreen} />
        <Stack.Screen
          name="EditInterpretation"
          component={EditInterpretationModal}
          options={{ presentation: 'modal', title: 'Edit Interpretation' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

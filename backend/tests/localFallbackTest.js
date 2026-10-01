import dotenv from 'dotenv';
dotenv.config();

import { handleLocalAssistantQuery } from '../services/localAssistantService.js';

const mockUserContext = {
  userId: '00000000-0000-0000-0000-000000000000',
  authToken: 'Bearer mock.jwt.token'
};

const runLocalFallbackTests = async () => {
  console.log('=== Testing Local Productivity Assistant Fallback (Stage 4) ===\n');

  const testQueries = [
    { name: '1. All Tasks', query: 'Show my tasks' },
    { name: '2. Pending Tasks', query: 'Show my pending tasks' },
    { name: '3. Completed Tasks', query: 'Show my completed tasks' },
    { name: '4. Overdue Tasks', query: 'Show my overdue tasks' },
    { name: '5. Today Tasks', query: "Show today's tasks" },
    { name: '6. Upcoming Deadlines', query: 'Show upcoming deadlines' },
    { name: '7. Productivity Stats', query: 'Show my productivity statistics' },
    { name: '8. Categories', query: 'Show my categories' },
    { name: '9. Unsupported Query', query: 'Explain quantum physics' }
  ];

  for (const t of testQueries) {
    const res = await handleLocalAssistantQuery(t.query, mockUserContext);
    console.log(`[TEST ${t.name}]`);
    console.log(`Query: "${t.query}"`);
    console.log(`Intent: ${res.intent}`);
    const msgText = typeof res.message === 'string' ? res.message : JSON.stringify(res);
    console.log(`Response Snippet:\n${msgText.substring(0, 100)}...`);
    console.log('--------------------------------------------------\n');
  }

  console.log('=== Local Fallback Tests Complete ===');
};

runLocalFallbackTests().catch(console.error);

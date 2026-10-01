import {
  get_tasks,
  get_task_by_id,
  create_task,
  update_task,
  complete_task,
  delete_task,
  get_categories,
  get_calendar_tasks,
  get_productivity_stats
} from '../services/assistantTools.js';

const mockUserContext = {
  userId: '00000000-0000-0000-0000-000000000000',
  authToken: 'Bearer mock.jwt.token'
};

const runToolUnitTests = async () => {
  console.log('--- Testing Assistant Tools ---');

  // 1. get_tasks
  const res1 = await get_tasks({ status: 'pending' }, mockUserContext);
  console.log('1. get_tasks result:', res1.success !== undefined);

  // 2. get_task_by_id (invalid UUID should return safe error)
  const res2 = await get_task_by_id({ task_id: '00000000-0000-0000-0000-000000000000' }, mockUserContext);
  console.log('2. get_task_by_id result:', res2.success === false);

  // 3. create_task (empty title should fail validation)
  const res3 = await create_task({ title: '' }, mockUserContext);
  console.log('3. create_task empty validation:', res3.success === false);

  // 4. update_task (invalid task_id)
  const res4 = await update_task({ task_id: '00000000-0000-0000-0000-000000000000', title: 'New' }, mockUserContext);
  console.log('4. update_task invalid ID:', res4.success === false);

  // 5. complete_task (invalid task_id)
  const res5 = await complete_task({ task_id: '00000000-0000-0000-0000-000000000000' }, mockUserContext);
  console.log('5. complete_task invalid ID:', res5.success === false);

  // 6. delete_task without confirmation
  const res6a = await delete_task({ task_id: '00000000-0000-0000-0000-000000000000', confirmed: false }, mockUserContext);
  console.log('6a. delete_task confirmation check:', res6a.confirmation_required === true || res6a.success === false);

  // 7. get_categories
  const res7 = await get_categories({}, mockUserContext);
  console.log('7. get_categories result:', res7.success !== undefined);

  // 8. get_calendar_tasks
  const res8 = await get_calendar_tasks({ start_date: '2026-01-01', end_date: '2026-12-31' }, mockUserContext);
  console.log('8. get_calendar_tasks result:', res8.success !== undefined);

  // 9. get_productivity_stats
  const res9 = await get_productivity_stats({}, mockUserContext);
  console.log('9. get_productivity_stats result:', res9.success !== undefined);

  console.log('--- Tool Unit Tests Complete ---');
};

runToolUnitTests().catch(console.error);

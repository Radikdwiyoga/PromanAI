/**
 * Test script for ProMan-AI email notification Cloud Functions triggers.
 *
 * This script uses the Firestore emulator directly to:
 *   1. Create a task with an assignee
 *   2. Update the task status (triggers onTaskUpdate)
 *   3. Create a comment (triggers onCommentCreate)
 *   4. Check deadline reminder logic
 *
 * Prerequisites:
 *   - Firebase emulators are running (functions + firestore + pubsub)
 *   - .runtimeconfig.json exists in functions/ with gmail config
 *
 * Usage:
 *   node functions/test/emulatorTest.js
 */
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Connect to the local emulator (no auth needed)
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FUNCTIONS_EMULATOR_HOST = '127.0.0.1:5001';

// Initialize with dummy creds for emulator use
const app = initializeApp({
  projectId: 'proman-83c57',
  // Emulator doesn't need real credentials
});

const db = getFirestore(app);

// Test data
const TEST_USER_ID = 'test-user-1';
const TEST_USER = {
  id: TEST_USER_ID,
  name: 'Test User',
  email: 'radik.dwiyoga@bitcorp.id',
  avatar: '',
  role: 'member',
  department: 'Engineering',
};

const TEST_USER2_ID = 'test-user-2';
const TEST_USER2 = {
  id: TEST_USER2_ID,
  name: 'Test User 2',
  email: 'radik.dwiyoga@bitcorp.id',
  avatar: '',
  role: 'member',
  department: 'Engineering',
};

const TEST_PROJECT_ID = 'test-project-1';
const TEST_PROJECT = {
  id: TEST_PROJECT_ID,
  name: 'Test Project',
  description: 'Project for testing email notifications',
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedData() {
  console.log('🌱 Seeding test data...');

  // Users
  await db.collection('users').doc(TEST_USER_ID).set(TEST_USER);
  await db.collection('users').doc(TEST_USER2_ID).set(TEST_USER2);
  console.log('  ✅ Users created');

  // Project
  await db.collection('projects').doc(TEST_PROJECT_ID).set(TEST_PROJECT);
  console.log('  ✅ Project created');
}

async function createTask() {
  console.log('\n📋 Creating test task...');
  const taskRef = db.collection('tasks').doc();
  const taskId = taskRef.id;

  await taskRef.set({
    id: taskId,
    projectId: TEST_PROJECT_ID,
    title: 'Test Task - Email Notification',
    description: 'This task was created to test email notification triggers.',
    status: 'todo',
    priority: 'medium',
    assigneeIds: [TEST_USER_ID],
    tags: ['test'],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 2,
    loggedHours: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`  ✅ Task created: ${taskId}`);
  return { taskId, taskRef };
}

async function updateTaskStatus(taskId, taskRef) {
  console.log('\n🔄 Updating task status (todo → in_progress)...');
  await taskRef.update({
    status: 'in_progress',
    updatedAt: new Date().toISOString(),
  });
  console.log('  ✅ Status updated → should trigger onTaskUpdate!');
}

async function assignNewUser(taskId, taskRef) {
  console.log('\n👥 Assigning new user to task...');
  await taskRef.update({
    assigneeIds: [TEST_USER_ID, TEST_USER2_ID],
    updatedAt: new Date().toISOString(),
  });
  console.log('  ✅ New assignee added → should trigger onTaskUpdate assignment email!');
}

async function addComment(taskId) {
  console.log('\n💬 Adding comment to task...');
  const commentRef = db.collection('comments').doc();
  await commentRef.set({
    id: commentRef.id,
    taskId,
    userId: TEST_USER2_ID,
    content: 'Test comment to trigger email notification to assignees.',
    createdAt: new Date().toISOString(),
    mentions: [],
  });
  console.log('  ✅ Comment created → should trigger onCommentCreate!');
}

async function main() {
  console.log('🧪 ==============================================');
  console.log('🧪  ProMan-AI Email Notification Trigger Test');
  console.log('🧪 ==============================================');
  console.log('\n📌 Watching emulator logs for these events:');
  console.log('   1. onTaskUpdate     → status changed');
  console.log('   2. onTaskUpdate     → new assignee');
  console.log('   3. onCommentCreate  → new comment');
  console.log('-----------------------------------------------');

  try {
    // 1. Seed data
    await seedData();

    // 2. Create task and trigger status update
    const { taskId, taskRef } = await createTask();

    // Wait for the onTaskUpdate trigger to execute
    console.log('⏳ Waiting for triggers to fire (2s)...');
    await delay(2000);

    // 3. Update status
    await updateTaskStatus(taskId, taskRef);
    await delay(2000);

    // 4. Assign new user
    await assignNewUser(taskId, taskRef);
    await delay(2000);

    // 5. Add comment
    await addComment(taskId);
    await delay(2000);

    console.log('\n✅ =============================================');
    console.log('✅  All test actions executed!');
    console.log('✅ =============================================');
    console.log('\n📊 Next steps:');
    console.log('  1. Open Firebase Emulator UI: http://127.0.0.1:4000');
    console.log('  2. Go to Functions tab → see logs');
    console.log('  3. Check if onTaskUpdate / onCommentCreate executed without errors');
    console.log('  4. With real Gmail config, emails would be sent to:');
    console.log(`     - ${TEST_USER.email}`);
    console.log(`     - ${TEST_USER2.email}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.delete();
  }
}

main();

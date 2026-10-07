// These tests exercise the real Express stack with stubbed Prisma delegates.
// They never connect to PostgreSQL and do not verify database behavior.
const { test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'taskflow-regression-tests-only-secret';
process.env.TRUST_PROXY = 'false';

const app = require('../dist/app.js').default;
const { prisma } = require('../dist/config/database.js');
const { generateToken } = require('../dist/utils/jwt.js');
const { Prisma } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const projectService = require('../dist/services/project.service.js');
const taskService = require('../dist/services/task.service.js');

const userId = '11111111-1111-4111-8111-111111111111';
const projectId = '22222222-2222-4222-8222-222222222222';
const otherProjectId = '33333333-3333-4333-8333-333333333333';
const taskId = '44444444-4444-4444-8444-444444444444';
const token = generateToken(userId);
const project = { id: projectId, userId, name: 'Project', startDate: null, endDate: null };
const task = { id: taskId, projectId, name: 'Task' };
const originals = [];
let server;
let baseUrl;

function stub(model, method, implementation) {
  originals.push([model, method, prisma[model][method]]);
  prisma[model][method] = implementation;
}

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  for (const model of ['user', 'project', 'task']) {
    for (const method of ['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']) {
      stub(model, method, async () => { throw new Error(`Unexpected database call: ${model}.${method}`); });
    }
  }
});

afterEach(() => {
  for (const [model, method, original] of originals.reverse()) prisma[model][method] = original;
  originals.length = 0;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});

async function request(path, { method = 'GET', body, auth = true, headers = {}, rawBody } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(auth ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined || rawBody !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
    signal: AbortSignal.timeout(5000),
  });
  assert.match(response.headers.get('content-type'), /application\/json/);
  return { status: response.status, body: await response.json() };
}

test('health and missing API routes return JSON without database access', async () => {
  assert.deepEqual(await request('/health', { auth: false }), {
    status: 200, body: { status: 'ok', message: 'TaskFlow API is running' },
  });
  const missing = await request('/api/does-not-exist', { auth: false });
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.body.message, 'string');
});

test('UUIDs, enums and non-string filters fail before Prisma', async () => {
  for (const path of ['/api/projects/not-a-uuid', '/api/tasks/123',
    '/api/projects?status=INVALID', '/api/tasks?status=INVALID',
    '/api/tasks?priority=URGENT', '/api/tasks?projectId=123',
    '/api/tasks?search[unexpected]=value', '/api/projects?status=COMPLETED&status=IN_PROGRESS']) {
    assert.equal((await request(path)).status, 400, path);
  }
  for (const resource of ['projects', 'tasks']) {
    for (const method of ['PUT', 'DELETE']) {
      assert.equal((await request(`/api/${resource}/invalid`, { method, body: method === 'PUT' ? {} : undefined })).status, 400);
    }
  }
});

test('missing, expired, malformed-owner and wrong-algorithm JWTs cannot reach Prisma', async () => {
  assert.equal((await request('/api/projects', { auth: false })).status, 401);
  const invalidTokens = [
    'not-a-token',
    jwt.sign({}, process.env.JWT_SECRET),
    jwt.sign({ userId: 'not-a-uuid' }, process.env.JWT_SECRET),
    jwt.sign({ userId }, process.env.JWT_SECRET, { algorithm: 'HS384' }),
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: -1 }),
  ];
  for (const invalidToken of invalidTokens) {
    assert.equal((await request('/api/projects', { headers: { Authorization: `Bearer ${invalidToken}` } })).status, 401);
  }
});

test('source ownership is checked on reads, updates and deletes, and on task creation', async () => {
  stub('project', 'findFirst', async ({ where }) => {
    assert.equal(where.userId, userId);
    return null;
  });
  stub('task', 'findFirst', async ({ where }) => {
    assert.equal(where.project.userId, userId);
    return null;
  });
  for (const [resource, id] of [['projects', projectId], ['tasks', taskId]]) {
    for (const method of ['GET', 'PUT', 'DELETE']) {
      assert.equal((await request(`/api/${resource}/${id}`, {
        method, body: method === 'PUT' ? { name: 'Attempted edit' } : undefined,
      })).status, 404);
    }
  }
  assert.equal((await request('/api/tasks', { method: 'POST', body: { projectId: otherProjectId, name: 'Attempted task' } })).status, 404);
});

test('unknown ownership, timestamps and nested relations are rejected', async () => {
  for (const [field, value] of Object.entries({ userId, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), user: { connect: { id: userId } },
    project: { connect: { id: otherProjectId } }, tasks: { deleteMany: {} } })) {
    for (const [path, method, valid] of [
      ['/api/projects', 'POST', { name: 'Safe' }],
      [`/api/projects/${projectId}`, 'PUT', { name: 'Safe' }],
      ['/api/tasks', 'POST', { name: 'Safe', projectId }],
      [`/api/tasks/${taskId}`, 'PUT', { name: 'Safe' }],
    ]) {
      assert.equal((await request(path, { method, body: { ...valid, [field]: value } })).status, 400, `${method} ${path}: ${field}`);
    }
  }
});

test('parsed names and query filters are sanitized before persistence', async () => {
  stub('project', 'create', async ({ data }) => {
    assert.equal(data.name, 'Trimmed');
    assert.equal(data.userId, userId);
    return { ...project, ...data };
  });
  assert.equal((await request('/api/projects', { method: 'POST', body: { name: '  Trimmed  ' } })).status, 201);
  stub('task', 'findMany', async ({ where }) => {
    assert.equal(where.name.contains, 'find me');
    assert.ok(!where.status && !where.priority && !where.projectId);
    assert.equal(where.project.userId, userId);
    return [];
  });
  assert.equal((await request('/api/tasks?search=%20find%20me%20&status=&priority=%20&projectId=')).status, 200);
});

test('required names, password length and project dates reject invalid input', async () => {
  const invalidRequests = [
    ['/api/projects', { name: '   ' }],
    ['/api/tasks', { name: '   ', projectId }],
    ['/api/projects', { name: 'X', startDate: 'not-a-date' }],
    ['/api/projects', { name: 'X', startDate: '2026-02-30T00:00:00.000Z' }],
    ['/api/projects', { name: 'X', startDate: '2026-10-09T00:00:00Z', endDate: '2026-10-08T00:00:00Z' }],
    ['/api/auth/register', { fullName: '   ', email: 'user@example.com', password: 'password123' }],
    ['/api/auth/register', { fullName: 'User', email: 'user@example.com', password: '1234567' }],
  ];
  for (const [path, body] of invalidRequests) assert.equal((await request(path, { method: 'POST', body })).status, 400);
});

test('email normalization is used by registration and login; bad credentials stay 401', async () => {
  stub('user', 'findUnique', async ({ where }) => {
    assert.equal(where.email, 'demo@example.com');
    return null;
  });
  stub('user', 'create', async ({ data }) => {
    assert.equal(data.email, 'demo@example.com');
    assert.equal(data.fullName, 'Demo User');
    assert.notEqual(data.passwordHash, 'password123');
    return { id: userId, fullName: data.fullName, email: data.email, createdAt: new Date() };
  });
  assert.equal((await request('/api/auth/register', { method: 'POST', auth: false,
    body: { fullName: '  Demo User  ', email: ' DEMO@EXAMPLE.COM ', password: 'password123' } })).status, 201);
  const login = await request('/api/auth/login', { method: 'POST', auth: false,
    body: { email: ' DEMO@EXAMPLE.COM ', password: 'password123' } });
  assert.equal(login.status, 401);
  assert.equal(login.body.message, 'Invalid email or password');
});

test('auth/me returns the user directly', async () => {
  stub('user', 'findUnique', async ({ where }) => {
    assert.equal(where.id, userId);
    return { id: userId, fullName: 'User', email: 'user@example.com', createdAt: new Date() };
  });
  const result = await request('/api/auth/me');
  assert.equal(result.status, 200);
  assert.equal(result.body.id, userId);
  assert.equal(result.body.user, undefined);
});

test('task moves reject another owner and allow an owned destination', async () => {
  stub('task', 'findFirst', async ({ where }) => {
    assert.equal(where.project.userId, userId);
    return task;
  });
  stub('project', 'findFirst', async ({ where }) => {
    assert.equal(where.id, otherProjectId);
    assert.equal(where.userId, userId);
    return null;
  });
  assert.equal((await request(`/api/tasks/${taskId}`, { method: 'PUT', body: { projectId: otherProjectId } })).status, 404);
  stub('project', 'findFirst', async () => ({ ...project, id: otherProjectId }));
  stub('task', 'update', async ({ where, data }) => {
    assert.equal(where.id, taskId);
    assert.equal(where.project.userId, userId);
    assert.equal(data.projectId, otherProjectId);
    return { ...task, ...data };
  });
  assert.equal((await request(`/api/tasks/${taskId}`, { method: 'PUT', body: { projectId: otherProjectId } })).status, 200);
});

test('task due dates accept ISO strings and null clearing', async () => {
  stub('project', 'findFirst', async () => project);
  stub('task', 'create', async ({ data }) => {
    assert.equal(data.dueDate, '2026-10-07T00:00:00.000Z');
    return { ...task, ...data };
  });
  assert.equal((await request('/api/tasks', { method: 'POST', body: {
    projectId, name: 'Scheduled task', dueDate: '2026-10-07T00:00:00.000Z',
  } })).status, 201);
  stub('task', 'findFirst', async () => task);
  stub('task', 'update', async ({ data }) => {
    assert.equal(data.dueDate, null);
    return { ...task, ...data };
  });
  assert.equal((await request(`/api/tasks/${taskId}`, { method: 'PUT', body: { dueDate: null } })).status, 200);
  assert.equal((await request(`/api/tasks/${taskId}`, { method: 'PUT', body: { dueDate: '2026-02-30T00:00:00Z' } })).status, 400);
});

test('service write allowlists ignore injected fields even without middleware', async () => {
  const injected = { name: 'Safe', userId: 'attacker', createdAt: 'bad', updatedAt: 'bad',
    user: { connect: { id: 'attacker' } }, project: { connect: { id: otherProjectId } },
    tasks: { deleteMany: {} } };
  function assertNoInjected(data) {
    for (const key of ['createdAt', 'updatedAt', 'user', 'project', 'tasks']) assert.equal(data[key], undefined);
    assert.notEqual(data.userId, 'attacker');
  }
  stub('project', 'findFirst', async () => project);
  stub('task', 'findFirst', async () => task);
  for (const model of ['project', 'task']) {
    for (const method of ['create', 'update']) {
      stub(model, method, async ({ data }) => { assertNoInjected(data); return data; });
    }
  }
  await projectService.createProject(userId, injected);
  await projectService.updateProject(projectId, userId, injected);
  await taskService.createTask(userId, { ...injected, projectId });
  await taskService.updateTask(taskId, userId, injected);
});

test('partial project date changes check stored dates and allow null clearing', async () => {
  stub('project', 'findFirst', async () => ({ ...project,
    startDate: new Date('2026-10-10T00:00:00Z'), endDate: new Date('2026-10-20T00:00:00Z') }));
  assert.equal((await request(`/api/projects/${projectId}`, { method: 'PUT',
    body: { endDate: '2026-10-09T00:00:00Z' } })).status, 400);
  assert.equal((await request(`/api/projects/${projectId}`, { method: 'PUT',
    body: { startDate: '2026-10-21T00:00:00Z' } })).status, 400);
  stub('project', 'update', async ({ data }) => { assert.equal(data.endDate, null); return { ...project, ...data }; });
  assert.equal((await request(`/api/projects/${projectId}`, { method: 'PUT', body: { endDate: null } })).status, 200);
});

test('production errors hide Prisma details and malformed JSON is a safe 400', async () => {
  const result = await request('/api/projects', { method: 'POST', rawBody: '{broken' });
  assert.equal(result.status, 400);
  assert.equal(result.body.stack, undefined);
  for (const [error, status] of [
    [new Prisma.PrismaClientValidationError('SECRET query content', { clientVersion: 'test' }), 400],
    [new Prisma.PrismaClientKnownRequestError('SECRET constraint details', { code: 'P2002', clientVersion: 'test' }), 409],
    [new Prisma.PrismaClientKnownRequestError('SECRET row details', { code: 'P2025', clientVersion: 'test' }), 404],
    [new Error('SECRET internal details'), 500],
  ]) {
    stub('project', 'findMany', async () => { throw error; });
    const response = await request('/api/projects');
    assert.equal(response.status, status);
    assert.equal(response.body.stack, undefined);
    assert.ok(!JSON.stringify(response.body).includes('SECRET'));
  }
});

test('login and registration are limited despite spoofed forwarding headers', async () => {
  assert.equal(app.get('trust proxy'), false);
  for (const endpoint of ['login', 'register']) {
    let limited = false;
    for (let i = 0; i < 25; i++) {
      const response = await request(`/api/auth/${endpoint}`, { method: 'POST', auth: false, body: {},
        headers: { 'X-Forwarded-For': `198.51.100.${i + 1}` } });
      if (response.status === 429) { limited = true; break; }
      assert.equal(response.status, 400);
    }
    assert.ok(limited, `${endpoint} should be rate limited`);
  }
  stub('project', 'findMany', async () => []);
  assert.equal((await request('/api/projects')).status, 200);
});

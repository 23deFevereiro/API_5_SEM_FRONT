import { describe, expect, it, vi } from 'vitest'

const { createRouterSpy, createWebHistorySpy, routesMock } = vi.hoisted(() => ({
  createRouterSpy: vi.fn((config: unknown) => ({ config })),
  createWebHistorySpy: vi.fn(() => 'history-stub'),
  routesMock: [{ path: '/programas', component: {} }],
}))

vi.mock('vue-router', () => ({
  createRouter: createRouterSpy,
  createWebHistory: createWebHistorySpy,
}))

vi.mock('vue-router/auto-routes', () => ({
  routes: routesMock,
}))

describe('router', () => {
  it('cria o router com as rotas geradas automaticamente', async () => {
    const routerModule = await import('./index')

    expect(routerModule.default).toEqual({
      config: {
        history: 'history-stub',
        routes: routesMock,
      },
    })
    expect(createWebHistorySpy).toHaveBeenCalled()
    expect(createRouterSpy).toHaveBeenCalled()
  })
})

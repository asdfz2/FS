import { describe, expect, it } from 'vitest'
import { adminSchemas } from '@/admin/schemas'

describe('admin schemas', () => {
  it('keeps unique endpoints and required table operations for active admin pages', () => {
    const schemas = Object.values(adminSchemas)
    const endpoints = schemas.map((schema) => schema.endpoint)

    expect(new Set(endpoints).size).toBe(endpoints.length)
    expect(endpoints).toEqual(
      expect.arrayContaining(['meishijianshang', 'yonghu', 'discussmeishijianshang', 'config']),
    )
    schemas.forEach((schema) => {
      expect(schema.columns.length).toBeGreaterThan(0)
      expect(schema.fields.length).toBeGreaterThan(0)
    })
  })

  it('keeps the comment drill-down query on the food schema', () => {
    const action = adminSchemas.food.rowActions.find((item) => item.key === 'comments')

    expect(action.to({ id: 22 })).toEqual({
      path: '/discussmeishijianshang',
      query: { refid: 22 },
    })
  })
})

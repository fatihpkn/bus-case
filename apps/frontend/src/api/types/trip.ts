import type { paths } from '@/api/types'

export type Trip = paths['/collections/trips/{id}']['get']['responses']['200']['content']['application/json']

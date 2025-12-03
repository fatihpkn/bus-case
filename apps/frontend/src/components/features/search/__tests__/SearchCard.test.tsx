import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchCard, type Trip } from '../SearchCard'

// Basit Link mock'u - router context'ine ihtiyaç duymadan render edebilmek için
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

const useQueryMock = vi.fn()

vi.mock('@/api', () => ({
  __esModule: true,
  default: {
    useQuery: (...args: any[]) => useQueryMock(...args),
  },
}))

const mockSeatSchema = {
  id: 'schema-1',
  seatLayouts: [
    {
      id: 'layout-1',
      // 3 sütun x 2 satır = 6 koltuk
      cells: JSON.stringify([
        ['seat', 'seat'],
        ['seat', 'seat'],
        ['seat', 'seat'],
      ]),
    },
  ],
  seats: [
    { id: 's1', seatNo: 1, row: 1, col: 1, status: 'empty' },
    { id: 's2', seatNo: 2, row: 1, col: 2, status: 'empty' },
    { id: 's3', seatNo: 3, row: 1, col: 3, status: 'empty' },
    { id: 's4', seatNo: 4, row: 2, col: 1, status: 'empty' },
    { id: 's5', seatNo: 5, row: 2, col: 2, status: 'empty' },
    { id: 's6', seatNo: 6, row: 2, col: 3, status: 'empty' },
  ],
}

const defaultTrip: Trip = {
  id: 'trip-1',
  price: 100,
  company: { id: 'c1', name: 'Test Company', color: '#000000' },
  fromAgency: { id: 'a1', name: 'From', city: 'From City' },
  toAgency: { id: 'a2', name: 'To', city: 'To City' },
  departure: new Date().toISOString(),
  arrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
}

const setup = (trip: Trip = defaultTrip) => {
  useQueryMock.mockReturnValue({ data: { data: [mockSeatSchema] } })
  return render(<SearchCard trip={trip} />)
}

describe('SearchCard seat selection', () => {
  beforeEach(() => {
    useQueryMock.mockClear()
  })

  it('4 koltuktan fazlasına izin vermez ve uyarı gösterir', async () => {
    const user = userEvent.setup()
    setup()

    const toggleButton = screen.getByRole('button', {
      name: 'features.search.results.actions.selectSeats',
    })

    await user.click(toggleButton)

    const [seat1] = await screen.findAllByRole('button', { name: '1' })
    const [seat2] = await screen.findAllByRole('button', { name: '2' })
    const [seat3] = await screen.findAllByRole('button', { name: '3' })
    const [seat4] = await screen.findAllByRole('button', { name: '4' })
    const [seat5] = await screen.findAllByRole('button', { name: '5' })

    await user.click(seat1)
    await user.click(seat2)
    await user.click(seat3)
    await user.click(seat4)

    // 4 koltuk seçilmiş olmalı (summary count satırı içinde)
    const countLabel = screen.getByText('features.search.results.summary.count')
    const countRow = countLabel.closest('div') as HTMLElement
    expect(within(countRow).getByText('4')).toBeTruthy()

    // 5. koltuğu seçmeye çalışınca seçim sayısı artmamalı ve uyarı çıkmalı
    await user.click(seat5)

    expect(within(countRow).getByText('4')).toBeTruthy()

    const alertTitle = await screen.findByText('features.search.results.seats.maxSeatsTitle')
    expect(alertTitle).toBeTruthy()
  })

  it('seçilen koltuk sayısına göre toplam fiyatı doğru hesaplar', async () => {
    const user = userEvent.setup()
    setup({ ...defaultTrip, price: 100 })

    const toggleButton = screen.getByRole('button', {
      name: 'features.search.results.actions.selectSeats',
    })

    await user.click(toggleButton)

    const [seat1] = await screen.findAllByRole('button', { name: '1' })
    const [seat2] = await screen.findAllByRole('button', { name: '2' })
    const [seat3] = await screen.findAllByRole('button', { name: '3' })

    await user.click(seat1)
    await user.click(seat2)
    await user.click(seat3)

    // toplam satırındaki fiyatın, seat count * birim fiyata eşit olduğunu doğrula
    const [countLabel] = screen.getAllByText('features.search.results.summary.count')
    const countRow = countLabel.closest('div') as HTMLElement
    const countText = within(countRow).getByText(/\d+/).textContent || '0'
    const seatCount = Number(countText)

    const [totalLabel] = screen.getAllByText('features.search.results.summary.total')
    const totalRow = totalLabel.closest('div') as HTMLElement
    const totalText = within(totalRow).getByText(/\d+\.\d+/).textContent || '0'
    const totalNumber = parseFloat(totalText.replace(',', '.'))

    expect(totalNumber).toBe(seatCount * 100)
  })
})

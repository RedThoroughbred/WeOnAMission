import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { DollarSign } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'
import { formatCurrency } from '../../lib/utils'

export default function AdminPayments() {
  const { churchId, church } = useTenant()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadPayments()
    }
  }, [churchId])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await api.getAllPayments(churchId)
      setPayments(data)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <PortalLayout title="Payment Management" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            Payments
          </h1>
          {church && (
            <p className="text-gray-600 dark:text-gray-400">
              Managing payments for {church.name}
            </p>
          )}
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Collected</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{payments.length} Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{payment.students?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}

import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Label, Progress, Skeleton, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { DollarSign, Plus, TrendingUp, Calendar, CreditCard, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function Payments() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'check',
    notes: ''
  })

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockStudents = [
        {
          id: 1,
          full_name: 'John Doe',
          total_cost: 2500,
          total_paid: 1500,
          balance_due: 1000
        },
        {
          id: 2,
          full_name: 'Jane Doe',
          total_cost: 2500,
          total_paid: 1000,
          balance_due: 1500
        }
      ]

      const mockHistory = [
        { id: 1, student_id: 1, student_name: 'John Doe', amount: 500, payment_date: '2025-11-01', payment_type: 'check', notes: 'Initial deposit' },
        { id: 2, student_id: 1, student_name: 'John Doe', amount: 1000, payment_date: '2025-11-15', payment_type: 'card', notes: '' },
        { id: 3, student_id: 2, student_name: 'Jane Doe', amount: 1000, payment_date: '2025-11-10', payment_type: 'cash', notes: 'Fundraiser proceeds' }
      ]

      setStudents(mockStudents)
      setPaymentHistory(mockHistory)
      if (mockStudents.length > 0) {
        setSelectedStudent(mockStudents[0])
      }
    } catch (error) {
      console.error('Error loading payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = () => {
    setFormData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_type: 'check',
      notes: ''
    })
    setShowAddPaymentModal(true)
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    if (!selectedStudent) return

    try {
      // TODO: Replace with actual API call
      const newPayment = {
        id: Date.now(),
        student_id: selectedStudent.id,
        student_name: selectedStudent.full_name,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_type: formData.payment_type,
        notes: formData.notes
      }

      setPaymentHistory([newPayment, ...paymentHistory])

      // Update student totals
      setStudents(students.map(s =>
        s.id === selectedStudent.id
          ? {
              ...s,
              total_paid: s.total_paid + newPayment.amount,
              balance_due: s.balance_due - newPayment.amount
            }
          : s
      ))

      setShowAddPaymentModal(false)
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const getProgressVariant = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 50) return 'warning'
    return 'default'
  }

  const getTotalPaid = () => students.reduce((sum, s) => sum + s.total_paid, 0)
  const getTotalCost = () => students.reduce((sum, s) => sum + s.total_cost, 0)
  const getTotalDue = () => students.reduce((sum, s) => sum + s.balance_due, 0)

  if (loading) {
    return (
      <PortalLayout title="Payments" role="parent">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="Payments" role="parent">
      <div className="space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Tracking</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage trip payments and view payment history</p>
          </div>
          <Button onClick={handleAddPayment} disabled={!selectedStudent}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Paid
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(getTotalPaid())}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Across {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Balance Due
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(getTotalDue())}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Remaining balance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Cost
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(getTotalCost())}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Trip cost per student: {formatCurrency(getTotalCost() / students.length)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student Payment Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Progress</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {students.map((student) => {
              const percentage = (student.total_paid / student.total_cost) * 100
              return (
                <Card
                  key={student.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStudent?.id === student.id ? 'ring-2 ring-primary-600' : ''
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{student.full_name}</CardTitle>
                      <Badge variant={percentage >= 100 ? 'success' : percentage >= 50 ? 'warning' : 'default'}>
                        {Math.round(percentage)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Paid</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(student.total_paid)}
                        </span>
                      </div>
                      <Progress
                        value={student.total_paid}
                        max={student.total_cost}
                        variant={getProgressVariant(percentage)}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Due</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(student.balance_due)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {selectedStudent
                  ? `Showing payments for ${selectedStudent.full_name}`
                  : 'All payment transactions'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {paymentHistory.filter(p => !selectedStudent || p.student_id === selectedStudent.id).length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No payments yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add your first payment to start tracking
                </p>
                <Button onClick={handleAddPayment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory
                        .filter(p => !selectedStudent || p.student_id === selectedStudent.id)
                        .map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(payment.payment_date)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{payment.student_name}</TableCell>
                            <TableCell>
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                {formatCurrency(payment.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{payment.payment_type}</Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {payment.notes || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {paymentHistory
                    .filter(p => !selectedStudent || p.student_id === selectedStudent.id)
                    .map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {payment.student_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(payment.payment_date)}</span>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Badge variant="secondary">{payment.payment_type}</Badge>
                          {payment.notes && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate ml-2">
                              {payment.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Payment Modal */}
        <Modal
          isOpen={showAddPaymentModal}
          onClose={() => setShowAddPaymentModal(false)}
          title="Add Payment"
        >
          <form onSubmit={handleSubmitPayment}>
            <ModalContent>
              <div className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedStudent?.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Balance due: {formatCurrency(selectedStudent?.balance_due || 0)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="amount" required>Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="payment_date" required>Payment Date</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment_type" required>Payment Method</Label>
                  <select
                    id="payment_type"
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="w-full h-11 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., Fundraiser proceeds, Final payment"
                  />
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Payment
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}

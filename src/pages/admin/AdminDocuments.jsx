import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { FileText } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminDocuments() {
  const { churchId, church } = useTenant()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadDocuments()
    }
  }, [churchId])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const data = await api.getAllDocuments(churchId)
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Document Management" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            Documents
          </h1>
          {church && (
            <p className="text-gray-600 dark:text-gray-400">
              Managing documents for {church.name}
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{documents.length} Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{doc.document_type}</p>
                    <p className="text-sm text-gray-600">{doc.status}</p>
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

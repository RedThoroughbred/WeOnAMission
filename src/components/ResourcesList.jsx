import React from 'react'
import { Button } from './ui'
import { FileText, Edit, Trash2, ExternalLink } from 'lucide-react'

const RESOURCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'website', label: 'Website' },
  { value: 'form', label: 'Form' },
  { value: 'guide', label: 'Guide' },
  { value: 'other', label: 'Other' },
]

const RESOURCE_TYPE_COLORS = {
  document: 'blue',
  video: 'purple',
  website: 'green',
  form: 'amber',
  guide: 'pink',
  other: 'gray',
}

export default function ResourcesList({ resources, canEdit = false, onEdit, onDelete }) {
  const getTypeColor = (type) => {
    return RESOURCE_TYPE_COLORS[type] || 'gray'
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No resources available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {resource.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded bg-${getTypeColor(resource.resource_type)}-100 text-${getTypeColor(resource.resource_type)}-800 dark:bg-${getTypeColor(resource.resource_type)}-900 dark:text-${getTypeColor(resource.resource_type)}-200`}>
                  {RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.label || resource.resource_type}
                </span>
              </div>
              {resource.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
              )}
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Access Resource
              </a>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(resource)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(resource)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

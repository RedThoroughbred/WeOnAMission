import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '../hooks/useTenant'
import { Button } from '../components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui'
import { Badge } from '../components/ui'
import { Church, Users, Heart, Sparkles, ArrowRight, Globe } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { churches, loading } = useTenant()
  const [selectedChurch, setSelectedChurch] = useState(null)

  const handleChurchSelect = (church) => {
    setSelectedChurch(church)
    // Set church context and navigate to home
    localStorage.setItem('selectedChurch', church.slug)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center animate-fadeInUp">
              {/* Logo/Brand */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                  <Globe className="w-6 h-6 text-primary-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    WeOnAMission
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight px-4 sm:px-0">
                Empowering Churches
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  One Mission at a Time
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                A beautiful platform to coordinate mission trips, manage registrations, track payments, and build lasting memories together.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-16">
                <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm">
                  <Church className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{churches?.length || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Churches</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm">
                  <Users className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Students Served</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">50+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Missions Completed</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  variant="primary"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
                  onClick={() => document.getElementById('select-church')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-white dark:text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4 text-base px-4 py-1">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Mission Coordinators
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Streamline your entire mission trip workflow with our all-in-one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover:scale-105 transition-transform duration-200 animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Church Selection Section */}
      <div id="select-church" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Select Your Church
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose your church to get started with your mission trip journey
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : churches?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No churches available yet. Contact your administrator.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {churches?.map((church) => (
                <Card
                  key={church.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => handleChurchSelect(church)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                        <Church className="w-7 h-7 text-white" />
                      </div>
                      {church.settings?.active && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{church.name}</CardTitle>
                    {church.settings?.trip_name && (
                      <CardDescription className="text-base mb-3">
                        🌍 {church.settings.trip_name}
                      </CardDescription>
                    )}
                    {church.settings?.departure_date && (
                      <CardDescription>
                        📅 Departing {new Date(church.settings.departure_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group">
                      View Portal
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} WeOnAMission. Built with ❤️ for churches.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Feature data
const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Easily manage student registrations, permissions, and medical information in one place.'
  },
  {
    icon: Church,
    title: 'Multi-Church Support',
    description: 'Each church gets its own isolated instance with complete data privacy.'
  },
  {
    icon: Heart,
    title: 'Payment Tracking',
    description: 'Monitor payment progress, set custom amounts, and keep families informed.'
  },
  {
    icon: Globe,
    title: 'Event Calendar',
    description: 'Keep everyone on the same page with fundraisers, meetings, and deadlines.'
  },
  {
    icon: Sparkles,
    title: 'Trip Memories',
    description: 'Students can share photos and stories to create a beautiful memory book.'
  },
  {
    icon: Users,
    title: 'Document Management',
    description: 'Collect, approve, and organize important documents with ease.'
  }
]

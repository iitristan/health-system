'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  icon?: ReactNode;
  color?: string;
  children?: ReactNode;
}

export default function EHRDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health System</h1>
              <p className="mt-1 text-sm text-gray-600">Comprehensive healthcare management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Profile
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <DashboardCard 
            title="Patient Information"
            description="View and manage patient demographics and personal details"
            onClick={() => router.push('/patient-information')}
            icon={<UserIcon />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          
          {/* Vital Signs */}
          <DashboardCard 
            title="Vital Signs"
            description="Record and track patient vitals over time"
            onClick={() => router.push('/vital-signs')}
            icon={<HeartIcon />}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
          
          {/* Health History */}
          <DashboardCard 
            title="Health History"
            description="Document past medical conditions and treatments"
            onClick={() => router.push('/health-history')}
            icon={<HistoryIcon />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          
          {/* Health Assessment */}
          <DashboardCard 
            title="Health Assessment"
            description="Comprehensive health evaluation tools"
            onClick={() => router.push('/health-assessment')}
            icon={<ClipboardIcon />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          >
            <div className="mt-4 space-y-2">
              <Link href="/health-assessment/physical" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Physical & Health Status
              </Link>
              <Link href="/health-assessment/dietary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Dietary & Nutrition Assessment
              </Link>
              <Link href="/health-assessment/psychosocial" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Psychosocial & Behavioral Factors
              </Link>
            </div>
          </DashboardCard>
          
          {/* Medication Administration */}
          <DashboardCard 
            title="Medication Administration"
            description="Track and manage medication schedules"
            onClick={() => router.push('/medication-admin')}
            icon={<PillIcon />}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          
          {/* Nurse's Notes */}
          <DashboardCard 
            title="Nurse's Notes"
            description="Clinical observations and assessments"
            icon={<NotebookIcon />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
          >
            <div className="mt-4 space-y-2">
              <Link href="/nurse-notes/nurses-notes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Nurse Notes
              </Link>
              <Link href="/nurse-notes/skin-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Skin Assessment
              </Link>
              <Link href="/nurse-notes/hair-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Hair Assessment
              </Link>
              <Link href="/nurse-notes/nail-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Nail Assessment
              </Link>
            </div>
          </DashboardCard>
          
          {/* Services */}
          <DashboardCard 
            title="Services"
            description="Access various healthcare services"
            icon={<ServicesIcon />}
            color="bg-gradient-to-br from-teal-500 to-teal-600"
          >
            <div className="mt-4 space-y-2">
              <Link href="/services/medical-checkup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Medical Checkup Booking
              </Link>
              <Link href="/services/nutrition-diet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Nutrition & Diet Record
              </Link>
              <Link href="/services/vaccination" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Vaccination Record
              </Link>
              <Link href="/services/emergency-response" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Emergency Response
              </Link>
              <Link href="/services/deworming" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Deworming Services
              </Link>
              <Link href="/services/extensive-medical-assistance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Request Medical Assistance
              </Link>
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, description, onClick, icon, color, children }: DashboardCardProps) {
  return (
    <div 
      className={`rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${color}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-3 rounded-lg bg-white bg-opacity-20">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white text-opacity-90">{description}</p>
          </div>
        </div>
        {children && (
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function UserIcon() { return <span className="text-2xl">👤</span> }
function HeartIcon() { return <span className="text-2xl">❤️</span> }
function HistoryIcon() { return <span className="text-2xl">📜</span> }
function ClipboardIcon() { return <span className="text-2xl">📋</span> }
function PillIcon() { return <span className="text-2xl">💊</span> }
function NotebookIcon() { return <span className="text-2xl">📓</span> }
function ServicesIcon() { return <span className="text-2xl">🏥</span> }
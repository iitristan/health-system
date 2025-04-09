'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EHRDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Electronic Health Record System</h1>
          <p className="mt-2">Comprehensive patient health management</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Patient Information */}
          <DashboardCard 
            title="Patient Information"
            description="View and manage patient demographics and personal details"
            onClick={() => router.push('/patient-information')}
            icon={<UserIcon />}
            color="bg-blue-100"
          />
          
          {/* Vital Signs */}
          <DashboardCard 
            title="Vital Signs"
            description="Record and track patient vitals over time"
            onClick={() => router.push('/vital-signs')}
            icon={<HeartIcon />}
            color="bg-red-100"
          />
          
          {/* Health History */}
          <DashboardCard 
            title="Health History"
            description="Document past medical conditions and treatments"
            onClick={() => router.push('/health-history')}
            icon={<HistoryIcon />}
            color="bg-green-100"
          />
          
          {/* Anemia Tracker */}
          <DashboardCard 
            title="Anemia Tracker"
            description="Monitor hemoglobin levels and anemia indicators"
            onClick={() => router.push('/anemia-tracker')}
            icon={<DropletIcon />}
            color="bg-purple-100"
          />
          
          {/* Health Assessment */}
          <DashboardCard 
            title="Health Assessment"
            description="Comprehensive health evaluation tools"
            onClick={() => router.push('/health-assessment')}
            icon={<ClipboardIcon />}
            color="bg-yellow-100"
          >
            <div className="mt-2 text-sm">
              <Link href="/health-assessment/physical" className="block py-1 hover:text-blue-600">Physical & Health Status</Link>
              <Link href="/health-assessment/dietary" className="block py-1 hover:text-blue-600">Dietary & Nutrition Assessment</Link>
              <Link href="/health-assessment/psychosocial" className="block py-1 hover:text-blue-600">Psychosocial & Behavioral Factors</Link>
            </div>
          </DashboardCard>
          
          {/* Medication Administration */}
          <DashboardCard 
            title="Medication Administration"
            description="Track and manage medication schedules"
            onClick={() => router.push('/medication-admin')}
            icon={<PillIcon />}
            color="bg-indigo-100"
          />
          
          {/* Nurse's Notes */}
          <DashboardCard 
            title="Nurse's Notes"
            description="Clinical observations and assessments"
       
            icon={<NotebookIcon />}
            color="bg-pink-100"
          >
            <div className="mt-2 text-sm">
              <Link href="/nurse-notes/nurses-notes" className="block py-1 hover:text-blue-600">Nurse Notes</Link>
              <Link href="/nurse-notes/skin-assessment" className="block py-1 hover:text-blue-600">Skin Assessment</Link>
              <Link href="/nurse-notes/hair-assessment" className="block py-1 hover:text-blue-600">Hair Assessment</Link>
              <Link href="/nurse-notes/nail-assessment" className="block py-1 hover:text-blue-600">Nail Assessment</Link>
            </div>
          </DashboardCard>
          
          {/* Services */}
          <DashboardCard 
            title="Services"
            description="Access various healthcare services"
            
            icon={<ServicesIcon />}
            color="bg-teal-100"
          >
            <div className="mt-2 text-sm">
              <Link href="/services/medical-checkup" className="block py-1 hover:text-blue-600">Medical Checkup Booking</Link>
              <Link href="/services/nutrition-diet" className="block py-1 hover:text-blue-600">Nutrition & Diet Record</Link>
              <Link href="/services/vaccination" className="block py-1 hover:text-blue-600">Vaccination Record</Link>
              <Link href="/services/emergency-response" className="block py-1 hover:text-blue-600">Emergency Response</Link>
              <Link href="/services/deworming" className="block py-1 hover:text-blue-600">Deworming Services</Link>
              <Link href="/services/extensive-medical-assistance" className="block py-1 hover:text-blue-600">Request Medical Assistance</Link>
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, description, onClick, icon, color, children }: any) {
  return (
    <div 
      className={`rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${color}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-3 rounded-md bg-white bg-opacity-50">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// Simple Icons (Replace with actual icons from your library)
function UserIcon() { return <span>👤</span> }
function HeartIcon() { return <span>❤️</span> }
function HistoryIcon() { return <span>📜</span> }
function DropletIcon() { return <span>💧</span> }
function ClipboardIcon() { return <span>📋</span> }
function PillIcon() { return <span>💊</span> }
function NotebookIcon() { return <span>📓</span> }
function ServicesIcon() { return <span>🏥</span> }
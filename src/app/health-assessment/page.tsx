'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface FormData {
  dob: string;
  dateOfService: string;
  requestRelated: string[];
  documentationSentTo: string;
  riskLevel: string;
  assessmentTimeFrame: string;
  sentBy: string[];
  exercisesRegularly: string;
  medicalConditionsPrecludingExercise: string;
  exerciseFrequency: string;
  exerciseType: string;
  exerciseDuration: string;
  exerciseIntensity: string;
  exerciseGoals: string;
  exerciseBarriers: string;
  exerciseMotivation: string;
  exerciseSupport: string;
  emotionalHealth: {
    anxiety: boolean;
    depression: boolean;
    stress: boolean;
    other: string;
  };
}

export default function HealthAssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientName = searchParams.get('patient');

  const [patientInfo, setPatientInfo] = useState({
    fullName: '',
    dateOfService: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    physician: 'Dr. Alena Santos, Pediatrician'
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  // Fetch all patients and patient info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients for the dropdown
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('full_name')
          .order('full_name');

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        // If patient name is in URL, fetch their info
        if (patientName) {
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('full_name', patientName)
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            setPatientInfo(prev => ({
              ...prev,
              fullName: patientData.full_name
            }));
            setSelectedPatient(patientData.full_name);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [patientName]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(`/health-assessment?patient=${encodeURIComponent(selectedName)}`);
    } else {
      router.push('/health-assessment');
    }
  };

  // State management for all form fields
  const [formData, setFormData] = useState({
    // Basic Information
    dob: '',
    dateOfService: '',
    
    // Request Related
    requestRelated: [],
    documentationSentTo: '',
    riskLevel: '',
    assessmentTimeFrame: '',
    sentBy: ['Hard Copy'],
    
    // Physical Activity
    exercisesRegularly: '',
    medicalConditionsPrecludingExercise: '',
    exerciseConditions: '',
    activities: {
      walking: { does: '', frequency: '' },
      running: { does: '', frequency: '' },
      bicycle: { does: '', frequency: '' },
      stretching: { does: '', frequency: '' },
      dancing: { does: '', frequency: '' }
    },
    
    // General Appearance
    posture: '',
    cleanliness: '',
    
    // Physical Findings
    eyes: {
      normal: false,
      paleConjunctiva: { present: false, severity: '' },
      dryEyes: { present: false, frequency: '' }
    },
    muscleMass: {
      normal: false,
      loss: { present: false, type: '' },
      weakness: { present: false, type: '', location: '' },
      symptoms: {
        fatigue: false,
        dizziness: false,
        nerveInvolvement: false
      }
    },
    
    // Lab Results
    labResults: {
      cbc: {
        hgb: '',
        hct: '',
        rbc: '',
        wbc: '',
        platelets: ''
      },
      electrolytes: {
        sodium: '',
        potassium: '',
        calcium: '',
        magnesium: ''
      }
    },
    
    // Diet/Nutrition
    dietRecall: {
      day1: { breakfast: '', lunch: '', dinner: '' },
      day2: { breakfast: '', lunch: '', dinner: '' },
      day3: { breakfast: '', lunch: '', dinner: '' }
    },
    waterIntake: {
      glasses: '',
      temperature: ''
    },
    appetite: '',
    dietHistory: {
      foodGroups: {
        milk: false,
        fruits: false,
        meat: false,
        bread: false,
        vegetables: false,
        fat: false
      },
      junkFoodFrequency: '',
      fastFoodFrequency: '',
      skippedMeals: {
        breakfast: false,
        lunch: false,
        dinner: false,
        reason: ''
      }
    },
    malnutrition: {
      weightLoss: { yes: false, amount: '' },
      poorEating: false,
      difficultyEating: false,
      allergies: { yes: false, details: '' }
    },
    foodInsecurity: {
      skippingMeals: false,
      limitedAccess: false,
      foodAssistance: false,
      other: ''
    },
    
    // Child Behavior
    eatingBehavior: {
      appetite: '',
      mealFrequency: '',
      foodPreferences: '',
      feedingDifficulties: {
        refusesFood: false,
        chokingRisk: false,
        textureAversion: false
      }
    },
    
    // Emotional Health
    emotionalHealth: {
      parentalBonding: '',
      developmentalMilestones: '',
      traumaExposure: false,
      emotionalDistress: {
        irritability: false,
        apathy: false,
        anxiety: false
      }
    }
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (path: string, value: string) => {
    setFormData(prev => {
      const current = prev[path as keyof FormData] as string[];
      return {
        ...prev,
        [path]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  const setNestedValue = (obj: Record<string, any>, path: string[], value: any): void => {
    const [head, ...rest] = path;
    if (rest.length === 0) {
      obj[head] = value;
    } else {
      if (!(head in obj)) {
        obj[head] = {};
      }
      setNestedValue(obj[head], rest, value);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Electronic Health Record</h1>
            <p className="mt-1 text-lg text-indigo-200">Health Assessment</p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Health Assessment Form</h2>
          </div>

          <div className="p-8">
            {/* Patient Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/patient-information')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Patient
                </button>
        </div>
              <select
                value={selectedPatient}
                onChange={handlePatientChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.full_name} value={patient.full_name}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
      </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
                <p className="text-sm font-medium text-gray-500">Patient Name</p>
                <p className="text-lg font-semibold text-gray-900">{patientInfo.fullName || 'Not selected'}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Date of Service</p>
                <p className="text-lg font-semibold text-gray-900">{patientInfo.dateOfService}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Physician</p>
                <p className="text-lg font-semibold text-gray-900">{patientInfo.physician}</p>
          </div>
        </div>

            <form onSubmit={handleSubmit} className="space-y-8">
        {/* Request Related */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Request Related</h3>
          <p className="text-sm text-gray-600 mb-2">CHECK ALL THAT APPLY</p>
          
          <div className="space-y-2">
            {['Physical and Health Status', 'Dietary and Nutritional Assessment', 'Psychosocial and Behavioral Factors'].map(item => (
              <label key={item} className="flex items-center">
                <input
                  type="checkbox"
                  name="requestRelated"
                  value={item}
                  checked={formData.requestRelated.includes(item)}
                        onChange={() => handleArrayChange('requestRelated', item)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{item}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Documentation to be sent back to:</label>
            <input
              type="text"
              name="documentationSentTo"
              value={formData.documentationSentTo}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Risk Level */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Level of Risk</h3>
          <div className="flex space-x-4">
            {['High Risk', 'Low Risk'].map(risk => (
              <label key={risk} className="flex items-center">
                <input
                  type="radio"
                  name="riskLevel"
                  checked={formData.riskLevel === risk}
                        onChange={() => handleInputChange({ target: { name: 'riskLevel', value: risk } } as React.ChangeEvent<HTMLInputElement>)}
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{risk}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assessment Time Frame */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Assessment Time Frame</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Admission', 'Weekly', 'Change in Condition', 'Quarterly'].map(time => (
              <label key={time} className="flex items-center">
                <input
                  type="radio"
                  name="assessmentTimeFrame"
                  checked={formData.assessmentTimeFrame === time}
                        onChange={() => handleInputChange({ target: { name: 'assessmentTimeFrame', value: time } } as React.ChangeEvent<HTMLInputElement>)}
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sent By */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">By:</h3>
          <div className="flex space-x-4">
            {['Email', 'Fax', 'Hard Copy'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  name="sentBy"
                  value={method}
                  checked={formData.sentBy.includes(method)}
                        onChange={() => handleArrayChange('sentBy', method)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Physical Activity Level */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">PHYSICAL ACTIVITY LEVEL</h3>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">1. Do you exercise regularly?</p>
              <div className="flex space-x-4">
                {['Yes', 'No'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="exercisesRegularly"
                      checked={formData.exercisesRegularly === option}
                            onChange={() => handleInputChange({ target: { name: 'exercisesRegularly', value: option } } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 text-blue-600"
                      required
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">2. Are there any medical conditions that preclude you from exercising?</p>
              <div className="flex space-x-4">
                {['Yes', 'No'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="medicalConditionsPrecludingExercise"
                      checked={formData.medicalConditionsPrecludingExercise === option}
                            onChange={() => handleInputChange({ target: { name: 'medicalConditionsPrecludingExercise', value: option } } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 text-blue-600"
                      required
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {formData.medicalConditionsPrecludingExercise === 'Yes' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specify:</label>
                  <input
                    type="text"
                    name="exerciseConditions"
                    value={formData.exerciseConditions}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
            
            {formData.exercisesRegularly === 'Yes' && (
              <div className="mt-4">
                <p className="mb-2 italic">If you answered yes to Q1, please answer the following:</p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Activity</th>
                        <th className="px-4 py-2 text-left">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['walking', 'running', 'bicycle', 'stretching', 'dancing'].map(activity => (
                        <tr key={activity} className="border-b">
                          <td className="px-4 py-2">
                            <p className="capitalize">{activity}</p>
                            <div className="flex space-x-4 mt-1">
                              {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`activities.${activity}.does`}
                                    checked={formData.activities[activity].does === option}
                                          onChange={() => setNestedValue(formData.activities, ['activities', activity, 'does'], option)}
                                    className="h-4 w-4 text-blue-600"
                                    required
                                  />
                                  <span className="ml-2">{option}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {['Daily or almost daily', '3-5 times weekly', '1-2 times weekly'].map(freq => (
                              <label key={freq} className="flex items-center mb-1">
                                <input
                                  type="radio"
                                  name={`activities.${activity}.frequency`}
                                  checked={formData.activities[activity].frequency === freq}
                                        onChange={() => setNestedValue(formData.activities, ['activities', activity, 'frequency'], freq)}
                                  className="h-4 w-4 text-blue-600"
                                  required
                                />
                                <span className="ml-2">{freq}</span>
                              </label>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* General Appearance */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">GENERAL APPEARANCE</h3>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">Posture:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Healthy', 'Kyphosis', 'Flat back', 'Swayback', 'Forward head'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="posture"
                      checked={formData.posture === option}
                            onChange={() => handleInputChange({ target: { name: 'posture', value: option } } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 text-blue-600"
                      required
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Cleanliness:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Clean', 'Unkempt', 'Dirt buildup', 'Excessive sweating', 'Body odor'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="cleanliness"
                      checked={formData.cleanliness === option}
                            onChange={() => handleInputChange({ target: { name: 'cleanliness', value: option } } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 text-blue-600"
                      required
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Findings - Eyes */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">PHYSICAL FINDINGS - Eyes</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.eyes.normal}
                      onChange={(e) => setNestedValue(formData.eyes, ['normal'], e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Normal</span>
            </label>
            
            <div className="ml-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.eyes.paleConjunctiva.present}
                        onChange={(e) => setNestedValue(formData.eyes.paleConjunctiva, ['present'], e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Pale conjunctiva</span>
              </label>
              {formData.eyes.paleConjunctiva.present && (
                <div className="ml-6 mt-2">
                  <div className="flex space-x-4">
                    {['Mild', 'Moderate', 'Severe'].map(severity => (
                      <label key={severity} className="flex items-center">
                        <input
                          type="radio"
                                name={`eyes.paleConjunctiva.severity`}
                          checked={formData.eyes.paleConjunctiva.severity === severity}
                                onChange={(e) => setNestedValue(formData.eyes.paleConjunctiva, ['severity'], severity)}
                          className="h-4 w-4 text-blue-600"
                          required
                        />
                        <span className="ml-2">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diet Recall */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">DIET RECALL</h3>
          
          {[1, 2, 3].map(day => (
            <div key={day} className="mb-6">
              <h4 className="font-medium mb-2">Day {day}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['breakfast', 'lunch', 'dinner'].map(meal => (
                  <div key={meal}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{meal}</label>
                    <input
                      type="text"
                      value={formData.dietRecall[`day${day}`][meal]}
                            onChange={(e) => setNestedValue(formData.dietRecall, [`day${day}`, meal], e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Diet History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">DIET HISTORY</h3>
          
          <div className="mb-4">
            <p className="mb-2">Daily consumption of foods from each food group:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['Milk products', 'Fruits', 'Meat', 'Bread and cereals', 'Vegetables', 'Fat'].map(item => (
                <label key={item} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietHistory.foodGroups[item.toLowerCase().replace(' ', '')]}
                          onChange={(e) => setNestedValue(formData.dietHistory.foodGroups, [item.toLowerCase().replace(' ', '')], e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How often do you take junk food?
            </label>
            <input
              type="text"
              value={formData.dietHistory.junkFoodFrequency}
                    onChange={(e) => setNestedValue(formData.dietHistory, ['junkFoodFrequency'], e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Process/fast foods consumption: <input
                type="text"
                value={formData.dietHistory.fastFoodFrequency}
                      onChange={(e) => setNestedValue(formData.dietHistory, ['fastFoodFrequency'], e.target.value)}
                className="inline-block w-16 p-1 border border-gray-300 rounded-md"
              /> times/week
            </label>
          </div>

          <div className="mb-4">
            <p className="mb-2">Do you skip meals? If yes, which meals and why?</p>
            <div className="flex space-x-4 mb-2">
              {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                <label key={meal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietHistory.skippedMeals[meal.toLowerCase()]}
                          onChange={(e) => setNestedValue(formData.dietHistory.skippedMeals, [meal.toLowerCase()], e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{meal}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={formData.dietHistory.skippedMeals.reason}
                    onChange={(e) => setNestedValue(formData.dietHistory.skippedMeals, ['reason'], e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Specify reason"
            />
          </div>
        </div>

        {/* Malnutrition Screening */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Malnutrition Screening</h3>
          
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2">
                  Have you lost weight recently without trying?<br />
                  {formData.malnutrition.weightLoss.yes && (
                    <span className="text-sm">If yes, please specify how much: 
                      <input
                        type="text"
                        value={formData.malnutrition.weightLoss.amount}
                              onChange={(e) => setNestedValue(formData.malnutrition.weightLoss, ['amount'], e.target.value)}
                        className="ml-2 w-16 p-1 border border-gray-300 rounded-md"
                      /> kg
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.malnutrition.weightLoss.yes === (option === 'Yes')}
                                onChange={(e) => setNestedValue(formData.malnutrition.weightLoss, ['yes'], option === 'Yes')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Have you been eating poorly because of decreased appetite?</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.malnutrition.poorEating === (option === 'Yes')}
                                onChange={(e) => setNestedValue(formData.malnutrition, ['poorEating'], option === 'Yes')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Have you experienced any difficulty in eating?</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.malnutrition.difficultyEating === (option === 'Yes')}
                                onChange={(e) => setNestedValue(formData.malnutrition, ['difficultyEating'], option === 'Yes')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Do you have any allergies? {formData.malnutrition.allergies.yes && (
                    <span className="text-sm">If yes, specify:
                      <input
                        type="text"
                        value={formData.malnutrition.allergies.details}
                              onChange={(e) => setNestedValue(formData.malnutrition.allergies, ['details'], e.target.value)}
                        className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                      />
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.malnutrition.allergies.yes === (option === 'Yes')}
                                onChange={(e) => setNestedValue(formData.malnutrition.allergies, ['yes'], option === 'Yes')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Food Insecurity */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Food Insecurity</h3>
          
          <div className="space-y-2">
            {[
              'Reports skipping meals due to financial constraints',
              'Limited access to nutritious food due to picky eating habits',
              'Relies on food assistance programs',
              'Others, please specify:'
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.foodInsecurity[`option${index}`]}
                        onChange={(e) => setNestedValue(formData.foodInsecurity, [`option${index}`], e.target.checked)}
                  className="h-4 w-4 mt-1 text-blue-600"
                />
                <span className="ml-2">
                  {item}
                  {index === 3 && formData.foodInsecurity.option3 && (
                    <input
                      type="text"
                      value={formData.foodInsecurity.other}
                            onChange={(e) => setNestedValue(formData.foodInsecurity, ['other'], e.target.value)}
                      className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Child's Eating Behavior & Habits */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Child&apos;s Eating Behavior & Habits</h3>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">Appetite Level:</p>
              <div className="flex space-x-4">
                {['Normal', 'Poor', 'Selective eating'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="eatingBehavior.appetite"
                      checked={formData.eatingBehavior.appetite === option}
                            onChange={() => setNestedValue(formData.eatingBehavior, ['appetite'], option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Meal Frequency per Day:</p>
              <div className="flex space-x-4">
                {['1-2', '3-4', '5+'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="eatingBehavior.mealFrequency"
                      checked={formData.eatingBehavior.mealFrequency === option}
                            onChange={() => setNestedValue(formData.eatingBehavior, ['mealFrequency'], option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Food Preferences:</p>
              <div className="flex space-x-4">
                {['Balanced diet', 'High in processed food', 'Low in variety'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="eatingBehavior.foodPreferences"
                      checked={formData.eatingBehavior.foodPreferences === option}
                            onChange={() => setNestedValue(formData.eatingBehavior, ['foodPreferences'], option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Signs of Feeding Difficulties:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Refuses food', 'Choking risk', 'Texture aversion'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.eatingBehavior.feedingDifficulties[option.toLowerCase().replace(' ', '')]}
                            onChange={(e) => setNestedValue(formData.eatingBehavior.feedingDifficulties, [option.toLowerCase().replace(' ', '')], e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Child's Emotional & Mental Health */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Child&apos;s Emotional & Mental Health</h3>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">Parental Bonding & Emotional Support:</p>
              <div className="flex space-x-4">
                {['Strong', 'Moderate', 'Weak'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="emotionalHealth.parentalBonding"
                      checked={formData.emotionalHealth.parentalBonding === option}
                            onChange={() => setNestedValue(formData.emotionalHealth, ['parentalBonding'], option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Developmental Milestones:</p>
              <div className="flex space-x-4">
                {['On track', 'Delayed', 'Severely delayed'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="emotionalHealth.developmentalMilestones"
                      checked={formData.emotionalHealth.developmentalMilestones === option}
                            onChange={() => setNestedValue(formData.emotionalHealth, ['developmentalMilestones'], option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Exposure to Trauma (Neglect, Abuse, Domestic Violence):</p>
              <div className="flex space-x-4">
                {['Yes', 'No'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="emotionalHealth.traumaExposure"
                      checked={formData.emotionalHealth.traumaExposure === (option === 'Yes')}
                            onChange={(e) => setNestedValue(formData.emotionalHealth, ['traumaExposure'], option === 'Yes')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="mb-2">Signs of Emotional Distress:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Irritability', 'Apathy', 'Anxiety'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emotionalHealth.emotionalDistress[option.toLowerCase()]}
                            onChange={(e) => setNestedValue(formData.emotionalHealth.emotionalDistress, [option.toLowerCase()], e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
              <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
          <button 
            type="button" 
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Assessment
          </button>
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}
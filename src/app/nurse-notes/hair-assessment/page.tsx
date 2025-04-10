'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';

const HairAssessmentPage: NextPage = () => {
  const [formData, setFormData] = useState({
    hairType: {
      straight: true,
      wavy: false,
      curly: false,
      oily: false
    },
    hairTexture: {
      fine: true,
      medium: false,
      coarse: false
    },
    hairColor: {
      natural: true,
      dyed: false,
      highlightsLowlights: false
    },
    hairLength: {
      short: true,
      medium: false,
      long: false
    },
    scalpSensitivity: {
      nonSensitive: true,
      mildlySensitive: false,
      moderatelySensitive: false,
      highlySensitive: false
    },
    scalpCondition: {
      dry: false,
      oily: false,
      flaky: false,
      irritated: false,
      normal: true
    },
    hairDensity: {
      thick: false,
      medium: true,
      thin: false
    },
    hairElasticity: {
      elastic: true,
      brittle: false,
      proneToBreakage: false
    },
    hairPorosity: {
      lowPorosity: false,
      normalPorosity: true,
      highPorosity: false
    },
    dandruff: {
      yes: false,
      no: true,
      amount: ''
    },
    scalpConditions: {
      psoriasis: false,
      seborrheicDermatitis: false,
      scalpAcne: false,
      folliculitis: false,
      na: true
    },
    hairLoss: {
      present: false,
      pattern: '',
      amount: '',
      duration: ''
    },
    hairBreakage: {
      present: false,
      length: '',
      frequency: '',
      possibleCauses: ''
    },
    splitEnds: {
      present: false,
      severity: {
        mild: false,
        moderate: false,
        severe: false
      },
      distribution: {
        localized: false,
        widespread: false
      }
    },
    hairCareRoutine: {
      shampoo: 'O.D',
      conditioner: 'O.D',
      stylingProducts: 'NONE',
      heatStyling: 'NONE'
    },
    hairGrowth: {
      symmetricallyDirection: true,
      asymmetricallyDistributed: false,
      normalAmount: false,
      excessiveAmount: false
    },
    bodyHair: {
      symmetricallyDirection: true,
      asymmetricallyDistributed: false,
      normalAmount: false,
      excessiveAmount: false
    }
  });

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const [parent, child, subChild] = name.split('.');
    
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [subChild]: checked,
            },
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked,
          },
        }));
      }
    } else {
      const [parent, child, subChild] = name.split('.');
    
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [subChild]: value,
            },
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      }
    }
    
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
            <p className="mt-1 text-lg text-indigo-200">Hair Assessment</p>
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
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Hair Assessment Form</h2>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Hair Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Type</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairType).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairType.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Texture</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairTexture).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairTexture.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Color</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairColor).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairColor.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.split(/(?=[A-Z])/).join('/')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Length</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairLength).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairLength.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Scalp Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Scalp Sensitivity</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.scalpSensitivity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`scalpSensitivity.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.split(/(?=[A-Z])/).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Scalp Condition</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.scalpCondition).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`scalpCondition.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Presence of Dandruff</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dandruff.yes"
                      checked={formData.dandruff.yes}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dandruff.no"
                      checked={formData.dandruff.no}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount of Visibility</label>
                  <input
                    type="text"
                    name="dandruff.amount"
                    value={formData.dandruff.amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Hair Health Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Density</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairDensity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairDensity.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Elasticity</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairElasticity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairElasticity.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.split(/(?=[A-Z])/).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Hair Porosity</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.hairPorosity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`hairPorosity.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.split(/(?=[A-Z])/).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Hair Care Routine</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hair Care Routine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Shampoo</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="hairCareRoutine.shampoo"
                          value={formData.hairCareRoutine.shampoo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Conditioner</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="hairCareRoutine.conditioner"
                          value={formData.hairCareRoutine.conditioner}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Styling products</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="hairCareRoutine.stylingProducts"
                          value={formData.hairCareRoutine.stylingProducts}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Heat styling</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="hairCareRoutine.heatStyling"
                          value={formData.hairCareRoutine.heatStyling}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Hair Growth Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Amount of Body Hair</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.bodyHair).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`bodyHair.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.split(/(?=[A-Z])/).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Hair Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairAssessmentPage; 
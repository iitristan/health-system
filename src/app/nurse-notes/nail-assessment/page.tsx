'use client';

import { useState } from 'react';
import type { NextPage } from 'next';

interface NailAssessmentForm {
  nailShape: {
    oval: boolean;
    square: boolean;
    round: boolean;
    almond: boolean;
    squoval: boolean;
    pointed: boolean;
  };
  nailLength: {
    short: boolean;
    medium: boolean;
    long: boolean;
  };
  nailTexture: {
    firm: boolean;
    soft: boolean;
    brittle: boolean;
  };
  nailColor: {
    pinkish: boolean;
    discolored: boolean;
    yellow: boolean;
    whiteSpots: boolean;
    bluePurple: boolean;
    other: boolean;
  };
  nailSurface: {
    smooth: boolean;
    ridged: boolean;
    pitted: boolean;
    grooved: boolean;
    brittle: boolean;
  };
  nailHydration: {
    hydrated: boolean;
    dehydrated: boolean;
    brittle: boolean;
  };
  cuticleCondition: {
    intact: boolean;
    overgrown: boolean;
    dry: boolean;
    inflamed: boolean;
    damaged: boolean;
  };
  nailBedCondition: {
    pink: boolean;
    pale: boolean;
    red: boolean;
    cyanotic: boolean;
    capillaryRefill: string;
  };
  nailDisorders: {
    onychomycosis: boolean;
    paronychia: boolean;
    beausLines: boolean;
    koilonychia: boolean;
    leukonychia: boolean;
    onycholysis: boolean;
  };
  nailGrowthRate: {
    moderate: boolean;
    slow: boolean;
    rapid: boolean;
  };
  nailCareRoutine: {
    nailTrimming: string;
    nailPolish: string;
    acrylicNails: string;
    harshChemicals: string;
  };
  nailTrauma: {
    present: boolean;
    description: string;
    evidence: string;
  };
}

const NailAssessmentPage: NextPage = () => {
  const [formData, setFormData] = useState<NailAssessmentForm>({
    nailShape: {
      oval: false,
      square: true,
      round: false,
      almond: false,
      squoval: false,
      pointed: false
    },
    nailLength: {
      short: false,
      medium: true,
      long: false
    },
    nailTexture: {
      firm: true,
      soft: false,
      brittle: false
    },
    nailColor: {
      pinkish: true,
      discolored: false,
      yellow: false,
      whiteSpots: false,
      bluePurple: false,
      other: false
    },
    nailSurface: {
      smooth: true,
      ridged: false,
      pitted: false,
      grooved: false,
      brittle: false
    },
    nailHydration: {
      hydrated: true,
      dehydrated: false,
      brittle: false
    },
    cuticleCondition: {
      intact: true,
      overgrown: false,
      dry: false,
      inflamed: false,
      damaged: false
    },
    nailBedCondition: {
      pink: true,
      pale: false,
      red: false,
      cyanotic: false,
      capillaryRefill: ''
    },
    nailDisorders: {
      onychomycosis: false,
      paronychia: false,
      beausLines: false,
      koilonychia: false,
      leukonychia: false,
      onycholysis: false
    },
    nailGrowthRate: {
      moderate: true,
      slow: false,
      rapid: false
    },
    nailCareRoutine: {
      nailTrimming: 'Weekly',
      nailPolish: 'No',
      acrylicNails: 'No',
      harshChemicals: 'Once a week (detergents)'
    },
    nailTrauma: {
      present: false,
      description: '',
      evidence: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const [parent, child, subChild] = name.split('.');
    
    if (type === 'checkbox') {
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Nail Assessment</h1>
          <p className="mt-1 text-lg text-indigo-200">Comprehensive Nail Assessment Documentation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Nail Assessment Form</h2>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Nail Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Shape</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailShape).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailShape.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Length</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailLength).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailLength.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Texture</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailTexture).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailTexture.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Color</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailColor).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailColor.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'pinkish' ? 'Pinkish in color' :
                           key === 'whiteSpots' ? 'White spots' :
                           key === 'bluePurple' ? 'Blue/purple (indicating cyanosis)' :
                           key === 'other' ? 'Other abnormalities' :
                           key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Nail Health Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Surface</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailSurface).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailSurface.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'ridged' ? 'Ridged (lengthwise or across)' :
                           key === 'grooved' ? 'Grooved' :
                           key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Hydration</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailHydration).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailHydration.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Cuticle Condition</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.cuticleCondition).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`cuticleCondition.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Bed Condition</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailBedCondition).map(([key, value]) => (
                      key !== 'capillaryRefill' ? (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`nailBedCondition.${key}`}
                            checked={value as boolean}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key === 'pink' ? 'Pink (normal)' :
                             key === 'cyanotic' ? 'Cyanotic' :
                             key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      ) : (
                        <div key={key} className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capillary refill time
                          </label>
                          <input
                            type="text"
                            name={`nailBedCondition.${key}`}
                            value={value as string}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Normal or delayed"
                          />
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Nail Disorders</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nail Disorders / Diseases</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presence</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Onychomycosis (fungal infection)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onychomycosis"
                              checked={formData.nailDisorders.onychomycosis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onychomycosis"
                              checked={!formData.nailDisorders.onychomycosis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Paronychia (bacterial infection)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.paronychia"
                              checked={formData.nailDisorders.paronychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.paronychia"
                              checked={!formData.nailDisorders.paronychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Beau's lines (transverse depressions)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.beausLines"
                              checked={formData.nailDisorders.beausLines}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.beausLines"
                              checked={!formData.nailDisorders.beausLines}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Koilonychia (spoon-shaped nails)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.koilonychia"
                              checked={formData.nailDisorders.koilonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.koilonychia"
                              checked={!formData.nailDisorders.koilonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Leukonychia (white spots)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.leukonychia"
                              checked={formData.nailDisorders.leukonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.leukonychia"
                              checked={!formData.nailDisorders.leukonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Onycholysis (separation of the nail from the nail bed)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onycholysis"
                              checked={formData.nailDisorders.onycholysis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onycholysis"
                              checked={!formData.nailDisorders.onycholysis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Nail Growth and Care</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Growth Rate</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailGrowthRate).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailGrowthRate.${key}`}
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
                <h4 className="text-lg font-medium text-gray-700 mb-4">Nail Care Routine</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nail Care Routine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Nail trimming</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.nailTrimming"
                            value={formData.nailCareRoutine.nailTrimming}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Use of nail polish</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.nailPolish"
                            value={formData.nailCareRoutine.nailPolish}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Use of acrylic nails</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.acrylicNails"
                            value={formData.nailCareRoutine.acrylicNails}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Exposure to harsh chemicals</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.harshChemicals"
                            value={formData.nailCareRoutine.harshChemicals}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Nail Trauma Assessment</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Do you experience any nail trauma? (e.g., crush injury, nail biting)
                  </label>
                  <textarea
                    name="nailTrauma.description"
                    value={formData.nailTrauma.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidence of recent or past trauma (bruising, lacerations)?
                  </label>
                  <textarea
                    name="nailTrauma.evidence"
                    value={formData.nailTrauma.evidence}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Nail Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NailAssessmentPage; 
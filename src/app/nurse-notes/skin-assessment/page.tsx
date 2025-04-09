'use client';

import { useState } from 'react';
import type { NextPage } from 'next';

const SkinAssessmentPage: NextPage = () => {
  const [formData, setFormData] = useState({
    injuries: {
      pressureUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      venousUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      diabeticUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      arterialUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      surgicalUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      bruiseHematoma: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      abrasion: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      burn: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      rash: { yes: true, no: false, bodyPart: '11 at posterior', size: '18 cm in width 8cm in height', color: 'Red in color', shape: 'Distinctive cluster' },
      redness: { yes: true, no: false, bodyPart: '11 at posterior', size: '18 cm in width 8cm in height', color: 'Red in color', shape: 'Distinctive cluster' },
      blister: { yes: true, no: false, bodyPart: '11 at posterior', size: '18 cm in width 8cm in height', color: 'Red in color', shape: 'Distinctive cluster with a presence of fluid filled' },
      traumaLaceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      ostomyPegTube: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      maceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' }
    },
    skinType: {
      normal: false,
      dry: true,
      oily: false,
      combination: false,
      sensitive: true
    },
    skinColor: {
      pale: false,
      fair: true,
      medium: false,
      olive: false,
      dark: false
    },
    skinTexture: {
      smooth: false,
      rough: true,
      flaky: false,
      bumpy: false,
      uneven: false
    },
    skinHydration: {
      hydrated: false,
      dehydrated: false,
      moist: false,
      dry: true
    },
    skinElasticity: {
      elastic: false,
      sagging: false,
      tight: false,
      wrinkled: true
    },
    skinSensitivity: {
      nonSensitive: false,
      mildlySensitive: false,
      moderatelySensitive: true,
      highlySensitive: false
    },
    pigmentation: {
      freckles: false,
      ageSpots: true,
      sunSpots: true,
      hyperpigmentation: false,
      hypopigmentation: false
    },
    skinConditions: {
      acne: false,
      eczema: false,
      psoriasis: false,
      rosacea: false,
      dermatitis: false,
      na: true
    },
    sunDamage: {
      sunburn: false,
      sunspots: false,
      wrinkles: true,
      textureChanges: false
    },
    elasticityAssessment: {
      goesBackWithin1Second: true,
      doesNotGoBackWithin1Second: false
    },
    temperatureAssessment: {
      warmth: true,
      cool: false,
      abnormalChanges: false
    },
    otherAssessment: {
      sensitiveSkin: true,
      medicineAllergy: false,
      skincareRoutine: 'None',
      productsUsed: 'None',
      frequencyOfUse: ''
    }
  });

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
      }
       else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: checked
          }
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
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Skin Assessment</h1>
          <p className="mt-1 text-lg text-indigo-200">Comprehensive Skin Assessment Documentation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Skin Assessment Form</h2>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Anatomical Number</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Injuries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yes/No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Body Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (cm)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shape</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(formData.injuries).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key.split(/(?=[A-Z])/).join(' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name={`injuries.${key}.yes`}
                                checked={value.yes}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name={`injuries.${key}.no`}
                                checked={value.no}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name={`injuries.${key}.bodyPart`}
                            value={value.bodyPart}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name={`injuries.${key}.size`}
                            value={value.size}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name={`injuries.${key}.color`}
                            value={value.color}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name={`injuries.${key}.shape`}
                            value={value.shape}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Skin Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Type</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinType).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinType.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Color</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinColor).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinColor.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Texture</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinTexture).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinTexture.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Hydration</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinHydration).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinHydration.${key}`}
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
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Additional Assessments</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Elasticity</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinElasticity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinElasticity.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Sensitivity</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinSensitivity).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinSensitivity.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Presence of Pigmentation</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.pigmentation).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`pigmentation.${key}`}
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
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Conditions</h4>
                  <div className="space-y-2">
                    {Object.entries(formData.skinConditions).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`skinConditions.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{key.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Other Assessment</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you have sensitive skin?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="otherAssessment.sensitiveSkin"
                        checked={formData.otherAssessment.sensitiveSkin}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any allergy to medicine?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="otherAssessment.medicineAllergy"
                        checked={formData.otherAssessment.medicineAllergy}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What is your current skincare routine?</label>
                  <input
                    type="text"
                    name="otherAssessment.skincareRoutine"
                    value={formData.otherAssessment.skincareRoutine}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency of Use</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="otherAssessment.productsUsed"
                            value={formData.otherAssessment.productsUsed}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="otherAssessment.frequencyOfUse"
                            value={formData.otherAssessment.frequencyOfUse}
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

            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Skin Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAssessmentPage; 
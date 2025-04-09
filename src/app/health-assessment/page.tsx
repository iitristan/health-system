'use client';
import { useState } from 'react';

export default function HealthAssessment() {
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
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => {
        const newValue = checked
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value);
        return { ...prev, [name]: newValue };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle nested state changes
  const handleNestedChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const nested = keys.reduce((obj, key) => obj[key], prev);
      nested[lastKey] = value;
      return { ...prev };
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        {/* Client Information */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Health Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">Charlene Olayvar</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Service</label>
              <input
                type="date"
                name="dateOfService"
                value={formData.dateOfService}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physician</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">Dr. Alena Santos</div>
            </div>
          </div>
        </div>

        {/* Request Related */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Related</h3>
          <p className="text-sm text-gray-600 mb-2">CHECK ALL THAT APPLY</p>
          
          <div className="space-y-2">
            {['Physical and Health Status', 'Dietary and Nutritional Assessment', 'Psychosocial and Behavioral Factors'].map(item => (
              <label key={item} className="flex items-center">
                <input
                  type="checkbox"
                  name="requestRelated"
                  value={item}
                  checked={formData.requestRelated.includes(item)}
                  onChange={handleInputChange}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Level of Risk</h3>
          <div className="flex space-x-4">
            {['High Risk', 'Low Risk'].map(risk => (
              <label key={risk} className="flex items-center">
                <input
                  type="radio"
                  name="riskLevel"
                  checked={formData.riskLevel === risk}
                  onChange={() => handleNestedChange('riskLevel', risk)}
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{risk}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assessment Time Frame */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Time Frame</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Admission', 'Weekly', 'Change in Condition', 'Quarterly'].map(time => (
              <label key={time} className="flex items-center">
                <input
                  type="radio"
                  name="assessmentTimeFrame"
                  checked={formData.assessmentTimeFrame === time}
                  onChange={() => handleNestedChange('assessmentTimeFrame', time)}
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sent By */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">By:</h3>
          <div className="flex space-x-4">
            {['Email', 'Fax', 'Hard Copy'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  name="sentBy"
                  value={method}
                  checked={formData.sentBy.includes(method)}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Physical Activity Level */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">PHYSICAL ACTIVITY LEVEL</h3>
          
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
                      onChange={() => handleNestedChange('exercisesRegularly', option)}
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
                      onChange={() => handleNestedChange('medicalConditionsPrecludingExercise', option)}
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
                                    onChange={() => handleNestedChange(`activities.${activity}.does`, option)}
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
                                  onChange={() => handleNestedChange(`activities.${activity}.frequency`, freq)}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">GENERAL APPEARANCE</h3>
          
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
                      onChange={() => handleNestedChange('posture', option)}
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
                      onChange={() => handleNestedChange('cleanliness', option)}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">PHYSICAL FINDINGS - Eyes</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.eyes.normal}
                onChange={(e) => handleNestedChange('eyes.normal', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Normal</span>
            </label>
            
            <div className="ml-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.eyes.paleConjunctiva.present}
                  onChange={(e) => handleNestedChange('eyes.paleConjunctiva.present', e.target.checked)}
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
                          name="eyes.paleConjunctiva.severity"
                          checked={formData.eyes.paleConjunctiva.severity === severity}
                          onChange={() => handleNestedChange('eyes.paleConjunctiva.severity', severity)}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">DIET RECALL</h3>
          
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
                      onChange={(e) => handleNestedChange(`dietRecall.day${day}.${meal}`, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Diet History */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">DIET HISTORY</h3>
          
          <div className="mb-4">
            <p className="mb-2">Daily consumption of foods from each food group:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['Milk products', 'Fruits', 'Meat', 'Bread and cereals', 'Vegetables', 'Fat'].map(item => (
                <label key={item} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietHistory.foodGroups[item.toLowerCase().replace(' ', '')]}
                    onChange={(e) => handleNestedChange(`dietHistory.foodGroups.${item.toLowerCase().replace(' ', '')}`, e.target.checked)}
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
              onChange={(e) => handleNestedChange('dietHistory.junkFoodFrequency', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Process/fast foods consumption: <input
                type="text"
                value={formData.dietHistory.fastFoodFrequency}
                onChange={(e) => handleNestedChange('dietHistory.fastFoodFrequency', e.target.value)}
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
                    onChange={(e) => handleNestedChange(`dietHistory.skippedMeals.${meal.toLowerCase()}`, e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{meal}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={formData.dietHistory.skippedMeals.reason}
              onChange={(e) => handleNestedChange('dietHistory.skippedMeals.reason', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Specify reason"
            />
          </div>
        </div>

        {/* Malnutrition Screening */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Malnutrition Screening</h3>
          
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
                        onChange={(e) => handleNestedChange('malnutrition.weightLoss.amount', e.target.value)}
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
                          onChange={() => handleNestedChange('malnutrition.weightLoss.yes', option === 'Yes')}
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
                          onChange={() => handleNestedChange('malnutrition.poorEating', option === 'Yes')}
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
                          onChange={() => handleNestedChange('malnutrition.difficultyEating', option === 'Yes')}
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
                        onChange={(e) => handleNestedChange('malnutrition.allergies.details', e.target.value)}
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
                          onChange={() => handleNestedChange('malnutrition.allergies.yes', option === 'Yes')}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Insecurity</h3>
          
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
                  onChange={(e) => handleNestedChange(`foodInsecurity.option${index}`, e.target.checked)}
                  className="h-4 w-4 mt-1 text-blue-600"
                />
                <span className="ml-2">
                  {item}
                  {index === 3 && formData.foodInsecurity.option3 && (
                    <input
                      type="text"
                      value={formData.foodInsecurity.other}
                      onChange={(e) => handleNestedChange('foodInsecurity.other', e.target.value)}
                      className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Child's Eating Behavior & Habits */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Child's Eating Behavior & Habits</h3>
          
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
                      onChange={() => handleNestedChange('eatingBehavior.appetite', option)}
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
                      onChange={() => handleNestedChange('eatingBehavior.mealFrequency', option)}
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
                      onChange={() => handleNestedChange('eatingBehavior.foodPreferences', option)}
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
                      onChange={(e) => handleNestedChange(`eatingBehavior.feedingDifficulties.${option.toLowerCase().replace(' ', '')}`, e.target.checked)}
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Child's Emotional & Mental Health</h3>
          
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
                      onChange={() => handleNestedChange('emotionalHealth.parentalBonding', option)}
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
                      onChange={() => handleNestedChange('emotionalHealth.developmentalMilestones', option)}
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
                      onChange={() => handleNestedChange('emotionalHealth.traumaExposure', option === 'Yes')}
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
                      onChange={(e) => handleNestedChange(`emotionalHealth.emotionalDistress.${option.toLowerCase()}`, e.target.checked)}
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
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            type="button" 
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Assessment
          </button>
        </div>
      </form>
    </div>
  );
}
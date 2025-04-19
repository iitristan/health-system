'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/app/context/SessionContext';
import { Suspense } from 'react';

interface SkinAssessmentRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  // Injuries
  pressure_ulcer_present: boolean;
  pressure_ulcer_body_part: string;
  pressure_ulcer_size: string;
  pressure_ulcer_color: string;
  pressure_ulcer_shape: string;
  venous_ulcer_present: boolean;
  venous_ulcer_body_part: string;
  venous_ulcer_size: string;
  venous_ulcer_color: string;
  venous_ulcer_shape: string;
  diabetic_ulcer_present: boolean;
  diabetic_ulcer_body_part: string;
  diabetic_ulcer_size: string;
  diabetic_ulcer_color: string;
  diabetic_ulcer_shape: string;
  arterial_ulcer_present: boolean;
  arterial_ulcer_body_part: string;
  arterial_ulcer_size: string;
  arterial_ulcer_color: string;
  arterial_ulcer_shape: string;
  surgical_ulcer_present: boolean;
  surgical_ulcer_body_part: string;
  surgical_ulcer_size: string;
  surgical_ulcer_color: string;
  surgical_ulcer_shape: string;
  bruise_hematoma_present: boolean;
  bruise_hematoma_body_part: string;
  bruise_hematoma_size: string;
  bruise_hematoma_color: string;
  bruise_hematoma_shape: string;
  abrasion_present: boolean;
  abrasion_body_part: string;
  abrasion_size: string;
  abrasion_color: string;
  abrasion_shape: string;
  burn_present: boolean;
  burn_body_part: string;
  burn_size: string;
  burn_color: string;
  burn_shape: string;
  rash_present: boolean;
  rash_body_part: string;
  rash_size: string;
  rash_color: string;
  rash_shape: string;
  redness_present: boolean;
  redness_body_part: string;
  redness_size: string;
  redness_color: string;
  redness_shape: string;
  blister_present: boolean;
  blister_body_part: string;
  blister_size: string;
  blister_color: string;
  blister_shape: string;
  trauma_laceration_present: boolean;
  trauma_laceration_body_part: string;
  trauma_laceration_size: string;
  trauma_laceration_color: string;
  trauma_laceration_shape: string;
  ostomy_peg_tube_present: boolean;
  ostomy_peg_tube_body_part: string;
  ostomy_peg_tube_size: string;
  ostomy_peg_tube_color: string;
  ostomy_peg_tube_shape: string;
  maceration_present: boolean;
  maceration_body_part: string;
  maceration_size: string;
  maceration_color: string;
  maceration_shape: string;
  // Skin Type
  skin_type_normal: boolean;
  skin_type_dry: boolean;
  skin_type_oily: boolean;
  skin_type_combination: boolean;
  skin_type_sensitive: boolean;
  // Skin Color
  skin_color_pale: boolean;
  skin_color_fair: boolean;
  skin_color_medium: boolean;
  skin_color_olive: boolean;
  skin_color_dark: boolean;
  // Skin Texture
  skin_texture_smooth: boolean;
  skin_texture_rough: boolean;
  skin_texture_flaky: boolean;
  skin_texture_bumpy: boolean;
  skin_texture_uneven: boolean;
  // Skin Hydration
  skin_hydration_hydrated: boolean;
  skin_hydration_dehydrated: boolean;
  skin_hydration_moist: boolean;
  skin_hydration_dry: boolean;
  // Skin Elasticity
  skin_elasticity_elastic: boolean;
  skin_elasticity_sagging: boolean;
  skin_elasticity_tight: boolean;
  skin_elasticity_wrinkled: boolean;
  // Skin Sensitivity
  skin_sensitivity_non_sensitive: boolean;
  skin_sensitivity_mildly_sensitive: boolean;
  skin_sensitivity_moderately_sensitive: boolean;
  skin_sensitivity_highly_sensitive: boolean;
  // Pigmentation
  pigmentation_freckles: boolean;
  pigmentation_age_spots: boolean;
  pigmentation_sun_spots: boolean;
  pigmentation_hyperpigmentation: boolean;
  pigmentation_hypopigmentation: boolean;
  // Skin Conditions
  skin_condition_acne: boolean;
  skin_condition_eczema: boolean;
  skin_condition_psoriasis: boolean;
  skin_condition_rosacea: boolean;
  skin_condition_dermatitis: boolean;
  skin_condition_na: boolean;
  // Sun Damage
  sun_damage_sunburn: boolean;
  sun_damage_sunspots: boolean;
  sun_damage_wrinkles: boolean;
  sun_damage_texture_changes: boolean;
  // Elasticity Assessment
  elasticity_assessment_goes_back_within_1_second: boolean;
  elasticity_assessment_does_not_go_back_within_1_second: boolean;
  // Temperature Assessment
  temperature_assessment_warmth: boolean;
  temperature_assessment_cool: boolean;
  temperature_assessment_abnormal_changes: boolean;
  // Other Assessment
  other_assessment_sensitive_skin: boolean;
  other_assessment_medicine_allergy: boolean;
  other_assessment_skincare_routine: string;
  other_assessment_products_used: string;
  other_assessment_frequency_of_use: string;
  other_assessment_products: Array<{ name: string; frequency: string }>;
  other_assessment_physician_notes: string;
  other_assessment_allergy_details: string;
  other_assessment_diagnosis: string;
  other_assessment_medications_and_treatments: string;
}

interface FormData {
  injuries: {
    pressureUlcer: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    venousUlcer: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    diabeticUlcer: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    arterialUlcer: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    surgicalUlcer: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    bruiseHematoma: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    abrasion: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    burn: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    rash: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    redness: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    blister: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    traumaLaceration: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    ostomyPegTube: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
    maceration: { yes: boolean; no: boolean; bodyPart: string; size: string; color: string; shape: string };
  };
  skinType: {
    normal: boolean;
    dry: boolean;
    oily: boolean;
    combination: boolean;
    sensitive: boolean;
  };
  skinColor: {
    pale: boolean;
    fair: boolean;
    medium: boolean;
    olive: boolean;
    dark: boolean;
  };
  skinTexture: {
    smooth: boolean;
    rough: boolean;
    flaky: boolean;
    bumpy: boolean;
    uneven: boolean;
  };
  skinHydration: {
    hydrated: boolean;
    dehydrated: boolean;
    moist: boolean;
    dry: boolean;
  };
  skinElasticity: {
    elastic: boolean;
    sagging: boolean;
    tight: boolean;
    wrinkled: boolean;
  };
  skinSensitivity: {
    nonSensitive: boolean;
    mildlySensitive: boolean;
    moderatelySensitive: boolean;
    highlySensitive: boolean;
  };
  pigmentation: {
    freckles: boolean;
    ageSpots: boolean;
    sunSpots: boolean;
    hyperpigmentation: boolean;
    hypopigmentation: boolean;
  };
  skinConditions: {
    acne: boolean;
    eczema: boolean;
    psoriasis: boolean;
    rosacea: boolean;
    dermatitis: boolean;
    na: boolean;
  };
  sunDamage: {
    sunburn: boolean;
    sunspots: boolean;
    wrinkles: boolean;
    textureChanges: boolean;
  };
  elasticityAssessment: {
    goesBackWithin1Second: boolean;
    doesNotGoBackWithin1Second: boolean;
  };
  temperatureAssessment: {
    warmth: boolean;
    cool: boolean;
    abnormalChanges: boolean;
  };
  otherAssessment: {
    sensitiveSkin: boolean;
    medicineAllergy: boolean;
    skincareRoutine: string;
    productsUsed: string;
    frequencyOfUse: string;
    products: Array<{ name: string; frequency: string }>;
    physicianNotes: string;
    allergyDetails: string;
    diagnosis: string;
    medicationsAndTreatments: string;
  };
}

const SkinAssessmentPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [patients, setPatients] = useState<Array<{ full_name: string; age: number; gender: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState(patientName || "");
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [attending, setAttending] = useState(selectedNurse ? `${selectedNurse.full_name}, ${selectedNurse.position}` : "N/A");
  const [historyRecords, setHistoryRecords] = useState<SkinAssessmentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SkinAssessmentRecord | null>(null);

  const [formData, setFormData] = useState<FormData>({
    injuries: {
      pressureUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      venousUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      diabeticUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      arterialUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      surgicalUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      bruiseHematoma: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      abrasion: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      burn: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      rash: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      redness: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      blister: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      traumaLaceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      ostomyPegTube: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
      maceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' }
    },
    skinType: {
      normal: false,
      dry: false,
      oily: false,
      combination: false,
      sensitive: false
    },
    skinColor: {
      pale: false,
      fair: false,
      medium: false,
      olive: false,
      dark: false
    },
    skinTexture: {
      smooth: false,
      rough: false,
      flaky: false,
      bumpy: false,
      uneven: false
    },
    skinHydration: {
      hydrated: false,
      dehydrated: false,
      moist: false,
      dry: false
    },
    skinElasticity: {
      elastic: false,
      sagging: false,
      tight: false,
      wrinkled: false
    },
    skinSensitivity: {
      nonSensitive: false,
      mildlySensitive: false,
      moderatelySensitive: false,
      highlySensitive: false
    },
    pigmentation: {
      freckles: false,
      ageSpots: false,
      sunSpots: false,
      hyperpigmentation: false,
      hypopigmentation: false
    },
    skinConditions: {
      acne: false,
      eczema: false,
      psoriasis: false,
      rosacea: false,
      dermatitis: false,
      na: false
    },
    sunDamage: {
      sunburn: false,
      sunspots: false,
      wrinkles: false,
      textureChanges: false
    },
    elasticityAssessment: {
      goesBackWithin1Second: false,
      doesNotGoBackWithin1Second: false
    },
    temperatureAssessment: {
      warmth: false,
      cool: false,
      abnormalChanges: false
    },
    otherAssessment: {
      sensitiveSkin: false,
      medicineAllergy: false,
      skincareRoutine: '',
      productsUsed: '',
      frequencyOfUse: '',
      products: [],
      physicianNotes: '',
      allergyDetails: '',
      diagnosis: '',
      medicationsAndTreatments: ''
    }
  });

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("full_name, age, gender")
          .order("full_name");

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Failed to load patients. Please try again.");
      }
    };

    fetchPatients();
  }, []);

  // Add effect to update attending info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setAttending(`${selectedNurse.full_name}, ${selectedNurse.position}`);
    }
  }, [selectedNurse]);

  // Add effect to check for nurse selection
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a nurse from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(`/skin-assessment?patient=${encodeURIComponent(selectedName)}`);
    } else {
      router.push("/skin-assessment");
    }
  };

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

  const selectedPatientData = patients.find(p => p.full_name === selectedPatient);

  const fetchHistoryRecords = async () => {
    if (!selectedPatient) return;
    try {
      const { data, error } = await supabase
        .from('skin_assessment_records')
        .select('*')
        .eq('full_name', selectedPatient)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHistoryRecords(data || []);
    } catch (error) {
      console.error('Error fetching history records:', error);
    }
  };

  const handleViewRecord = (record: SkinAssessmentRecord) => {
    setSelectedRecord(record);
    setFormData({
      injuries: {
        pressureUlcer: {
          yes: record.pressure_ulcer_present,
          no: !record.pressure_ulcer_present,
          bodyPart: record.pressure_ulcer_body_part,
          size: record.pressure_ulcer_size,
          color: record.pressure_ulcer_color,
          shape: record.pressure_ulcer_shape
        },
        venousUlcer: {
          yes: record.venous_ulcer_present,
          no: !record.venous_ulcer_present,
          bodyPart: record.venous_ulcer_body_part,
          size: record.venous_ulcer_size,
          color: record.venous_ulcer_color,
          shape: record.venous_ulcer_shape
        },
        diabeticUlcer: {
          yes: record.diabetic_ulcer_present,
          no: !record.diabetic_ulcer_present,
          bodyPart: record.diabetic_ulcer_body_part,
          size: record.diabetic_ulcer_size,
          color: record.diabetic_ulcer_color,
          shape: record.diabetic_ulcer_shape
        },
        arterialUlcer: {
          yes: record.arterial_ulcer_present,
          no: !record.arterial_ulcer_present,
          bodyPart: record.arterial_ulcer_body_part,
          size: record.arterial_ulcer_size,
          color: record.arterial_ulcer_color,
          shape: record.arterial_ulcer_shape
        },
        surgicalUlcer: {
          yes: record.surgical_ulcer_present,
          no: !record.surgical_ulcer_present,
          bodyPart: record.surgical_ulcer_body_part,
          size: record.surgical_ulcer_size,
          color: record.surgical_ulcer_color,
          shape: record.surgical_ulcer_shape
        },
        bruiseHematoma: {
          yes: record.bruise_hematoma_present,
          no: !record.bruise_hematoma_present,
          bodyPart: record.bruise_hematoma_body_part,
          size: record.bruise_hematoma_size,
          color: record.bruise_hematoma_color,
          shape: record.bruise_hematoma_shape
        },
        abrasion: {
          yes: record.abrasion_present,
          no: !record.abrasion_present,
          bodyPart: record.abrasion_body_part,
          size: record.abrasion_size,
          color: record.abrasion_color,
          shape: record.abrasion_shape
        },
        burn: {
          yes: record.burn_present,
          no: !record.burn_present,
          bodyPart: record.burn_body_part,
          size: record.burn_size,
          color: record.burn_color,
          shape: record.burn_shape
        },
        rash: {
          yes: record.rash_present,
          no: !record.rash_present,
          bodyPart: record.rash_body_part,
          size: record.rash_size,
          color: record.rash_color,
          shape: record.rash_shape
        },
        redness: {
          yes: record.redness_present,
          no: !record.redness_present,
          bodyPart: record.redness_body_part,
          size: record.redness_size,
          color: record.redness_color,
          shape: record.redness_shape
        },
        blister: {
          yes: record.blister_present,
          no: !record.blister_present,
          bodyPart: record.blister_body_part,
          size: record.blister_size,
          color: record.blister_color,
          shape: record.blister_shape
        },
        traumaLaceration: {
          yes: record.trauma_laceration_present,
          no: !record.trauma_laceration_present,
          bodyPart: record.trauma_laceration_body_part,
          size: record.trauma_laceration_size,
          color: record.trauma_laceration_color,
          shape: record.trauma_laceration_shape
        },
        ostomyPegTube: {
          yes: record.ostomy_peg_tube_present,
          no: !record.ostomy_peg_tube_present,
          bodyPart: record.ostomy_peg_tube_body_part,
          size: record.ostomy_peg_tube_size,
          color: record.ostomy_peg_tube_color,
          shape: record.ostomy_peg_tube_shape
        },
        maceration: {
          yes: record.maceration_present,
          no: !record.maceration_present,
          bodyPart: record.maceration_body_part,
          size: record.maceration_size,
          color: record.maceration_color,
          shape: record.maceration_shape
        }
      },
      skinType: {
        normal: record.skin_type_normal,
        dry: record.skin_type_dry,
        oily: record.skin_type_oily,
        combination: record.skin_type_combination,
        sensitive: record.skin_type_sensitive
      },
      skinColor: {
        pale: record.skin_color_pale,
        fair: record.skin_color_fair,
        medium: record.skin_color_medium,
        olive: record.skin_color_olive,
        dark: record.skin_color_dark
      },
      skinTexture: {
        smooth: record.skin_texture_smooth,
        rough: record.skin_texture_rough,
        flaky: record.skin_texture_flaky,
        bumpy: record.skin_texture_bumpy,
        uneven: record.skin_texture_uneven
      },
      skinHydration: {
        hydrated: record.skin_hydration_hydrated,
        dehydrated: record.skin_hydration_dehydrated,
        moist: record.skin_hydration_moist,
        dry: record.skin_hydration_dry
      },
      skinElasticity: {
        elastic: record.skin_elasticity_elastic,
        sagging: record.skin_elasticity_sagging,
        tight: record.skin_elasticity_tight,
        wrinkled: record.skin_elasticity_wrinkled
      },
      skinSensitivity: {
        nonSensitive: record.skin_sensitivity_non_sensitive,
        mildlySensitive: record.skin_sensitivity_mildly_sensitive,
        moderatelySensitive: record.skin_sensitivity_moderately_sensitive,
        highlySensitive: record.skin_sensitivity_highly_sensitive
      },
      pigmentation: {
        freckles: record.pigmentation_freckles,
        ageSpots: record.pigmentation_age_spots,
        sunSpots: record.pigmentation_sun_spots,
        hyperpigmentation: record.pigmentation_hyperpigmentation,
        hypopigmentation: record.pigmentation_hypopigmentation
      },
      skinConditions: {
        acne: record.skin_condition_acne,
        eczema: record.skin_condition_eczema,
        psoriasis: record.skin_condition_psoriasis,
        rosacea: record.skin_condition_rosacea,
        dermatitis: record.skin_condition_dermatitis,
        na: record.skin_condition_na
      },
      sunDamage: {
        sunburn: record.sun_damage_sunburn,
        sunspots: record.sun_damage_sunspots,
        wrinkles: record.sun_damage_wrinkles,
        textureChanges: record.sun_damage_texture_changes
      },
      elasticityAssessment: {
        goesBackWithin1Second: record.elasticity_assessment_goes_back_within_1_second,
        doesNotGoBackWithin1Second: record.elasticity_assessment_does_not_go_back_within_1_second
      },
      temperatureAssessment: {
        warmth: record.temperature_assessment_warmth,
        cool: record.temperature_assessment_cool,
        abnormalChanges: record.temperature_assessment_abnormal_changes
      },
      otherAssessment: {
        sensitiveSkin: record.other_assessment_sensitive_skin,
        medicineAllergy: record.other_assessment_medicine_allergy,
        skincareRoutine: record.other_assessment_skincare_routine,
        productsUsed: record.other_assessment_products_used,
        frequencyOfUse: record.other_assessment_frequency_of_use,
        products: record.other_assessment_products || [],
        physicianNotes: record.other_assessment_physician_notes,
        allergyDetails: record.other_assessment_allergy_details,
        diagnosis: record.other_assessment_diagnosis,
        medicationsAndTreatments: record.other_assessment_medications_and_treatments
      }
    });
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('skin_assessment_records')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      await fetchHistoryRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      otherAssessment: {
        ...prev.otherAssessment,
        products: [...(prev.otherAssessment.products || []), { name: '', frequency: '' }]
      }
    }));
  };

  const handleProductChange = (index: number, field: 'name' | 'frequency', value: string) => {
    setFormData(prev => ({
      ...prev,
      otherAssessment: {
        ...prev.otherAssessment,
        products: prev.otherAssessment.products.map((product, i) => 
          i === index ? { ...product, [field]: value } : product
        )
      }
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherAssessment: {
        ...prev.otherAssessment,
        products: prev.otherAssessment.products.filter((_, i) => i !== index)
      }
    }));
  };

  useEffect(() => {
    fetchHistoryRecords();
  }, [selectedPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert("No nurse selected. Please select a nurse from the dashboard first.");
      return;
    }

    try {
      // Transform the form data to match the database schema exactly
      const submissionData = {
        full_name: selectedPatient,
        physician_id: selectedNurse.id,
        physician_name: `${selectedNurse.full_name}, ${selectedNurse.position}`,
        date_of_service: new Date().toISOString().split("T")[0],
        
        // Transform injuries - using exact column names from schema
        pressure_ulcer_present: formData.injuries.pressureUlcer.yes,
        pressure_ulcer_body_part: formData.injuries.pressureUlcer.bodyPart,
        pressure_ulcer_size: formData.injuries.pressureUlcer.size,
        pressure_ulcer_color: formData.injuries.pressureUlcer.color,
        pressure_ulcer_shape: formData.injuries.pressureUlcer.shape,

        venous_ulcer_present: formData.injuries.venousUlcer.yes,
        venous_ulcer_body_part: formData.injuries.venousUlcer.bodyPart,
        venous_ulcer_size: formData.injuries.venousUlcer.size,
        venous_ulcer_color: formData.injuries.venousUlcer.color,
        venous_ulcer_shape: formData.injuries.venousUlcer.shape,

        diabetic_ulcer_present: formData.injuries.diabeticUlcer.yes,
        diabetic_ulcer_body_part: formData.injuries.diabeticUlcer.bodyPart,
        diabetic_ulcer_size: formData.injuries.diabeticUlcer.size,
        diabetic_ulcer_color: formData.injuries.diabeticUlcer.color,
        diabetic_ulcer_shape: formData.injuries.diabeticUlcer.shape,

        arterial_ulcer_present: formData.injuries.arterialUlcer.yes,
        arterial_ulcer_body_part: formData.injuries.arterialUlcer.bodyPart,
        arterial_ulcer_size: formData.injuries.arterialUlcer.size,
        arterial_ulcer_color: formData.injuries.arterialUlcer.color,
        arterial_ulcer_shape: formData.injuries.arterialUlcer.shape,

        surgical_ulcer_present: formData.injuries.surgicalUlcer.yes,
        surgical_ulcer_body_part: formData.injuries.surgicalUlcer.bodyPart,
        surgical_ulcer_size: formData.injuries.surgicalUlcer.size,
        surgical_ulcer_color: formData.injuries.surgicalUlcer.color,
        surgical_ulcer_shape: formData.injuries.surgicalUlcer.shape,

        bruise_hematoma_present: formData.injuries.bruiseHematoma.yes,
        bruise_hematoma_body_part: formData.injuries.bruiseHematoma.bodyPart,
        bruise_hematoma_size: formData.injuries.bruiseHematoma.size,
        bruise_hematoma_color: formData.injuries.bruiseHematoma.color,
        bruise_hematoma_shape: formData.injuries.bruiseHematoma.shape,

        abrasion_present: formData.injuries.abrasion.yes,
        abrasion_body_part: formData.injuries.abrasion.bodyPart,
        abrasion_size: formData.injuries.abrasion.size,
        abrasion_color: formData.injuries.abrasion.color,
        abrasion_shape: formData.injuries.abrasion.shape,

        burn_present: formData.injuries.burn.yes,
        burn_body_part: formData.injuries.burn.bodyPart,
        burn_size: formData.injuries.burn.size,
        burn_color: formData.injuries.burn.color,
        burn_shape: formData.injuries.burn.shape,

        rash_present: formData.injuries.rash.yes,
        rash_body_part: formData.injuries.rash.bodyPart,
        rash_size: formData.injuries.rash.size,
        rash_color: formData.injuries.rash.color,
        rash_shape: formData.injuries.rash.shape,

        redness_present: formData.injuries.redness.yes,
        redness_body_part: formData.injuries.redness.bodyPart,
        redness_size: formData.injuries.redness.size,
        redness_color: formData.injuries.redness.color,
        redness_shape: formData.injuries.redness.shape,

        blister_present: formData.injuries.blister.yes,
        blister_body_part: formData.injuries.blister.bodyPart,
        blister_size: formData.injuries.blister.size,
        blister_color: formData.injuries.blister.color,
        blister_shape: formData.injuries.blister.shape,

        trauma_laceration_present: formData.injuries.traumaLaceration.yes,
        trauma_laceration_body_part: formData.injuries.traumaLaceration.bodyPart,
        trauma_laceration_size: formData.injuries.traumaLaceration.size,
        trauma_laceration_color: formData.injuries.traumaLaceration.color,
        trauma_laceration_shape: formData.injuries.traumaLaceration.shape,

        ostomy_peg_tube_present: formData.injuries.ostomyPegTube.yes,
        ostomy_peg_tube_body_part: formData.injuries.ostomyPegTube.bodyPart,
        ostomy_peg_tube_size: formData.injuries.ostomyPegTube.size,
        ostomy_peg_tube_color: formData.injuries.ostomyPegTube.color,
        ostomy_peg_tube_shape: formData.injuries.ostomyPegTube.shape,

        maceration_present: formData.injuries.maceration.yes,
        maceration_body_part: formData.injuries.maceration.bodyPart,
        maceration_size: formData.injuries.maceration.size,
        maceration_color: formData.injuries.maceration.color,
        maceration_shape: formData.injuries.maceration.shape,

        // Skin Type
        skin_type_normal: formData.skinType.normal,
        skin_type_dry: formData.skinType.dry,
        skin_type_oily: formData.skinType.oily,
        skin_type_combination: formData.skinType.combination,
        skin_type_sensitive: formData.skinType.sensitive,

        // Skin Color
        skin_color_pale: formData.skinColor.pale,
        skin_color_fair: formData.skinColor.fair,
        skin_color_medium: formData.skinColor.medium,
        skin_color_olive: formData.skinColor.olive,
        skin_color_dark: formData.skinColor.dark,

        // Skin Texture
        skin_texture_smooth: formData.skinTexture.smooth,
        skin_texture_rough: formData.skinTexture.rough,
        skin_texture_flaky: formData.skinTexture.flaky,
        skin_texture_bumpy: formData.skinTexture.bumpy,
        skin_texture_uneven: formData.skinTexture.uneven,

        // Skin Hydration
        skin_hydration_hydrated: formData.skinHydration.hydrated,
        skin_hydration_dehydrated: formData.skinHydration.dehydrated,
        skin_hydration_moist: formData.skinHydration.moist,
        skin_hydration_dry: formData.skinHydration.dry,

        // Skin Elasticity
        skin_elasticity_elastic: formData.skinElasticity.elastic,
        skin_elasticity_sagging: formData.skinElasticity.sagging,
        skin_elasticity_tight: formData.skinElasticity.tight,
        skin_elasticity_wrinkled: formData.skinElasticity.wrinkled,

        // Skin Sensitivity
        skin_sensitivity_non_sensitive: formData.skinSensitivity.nonSensitive,
        skin_sensitivity_mildly_sensitive: formData.skinSensitivity.mildlySensitive,
        skin_sensitivity_moderately_sensitive: formData.skinSensitivity.moderatelySensitive,
        skin_sensitivity_highly_sensitive: formData.skinSensitivity.highlySensitive,

        // Pigmentation
        pigmentation_freckles: formData.pigmentation.freckles,
        pigmentation_age_spots: formData.pigmentation.ageSpots,
        pigmentation_sun_spots: formData.pigmentation.sunSpots,
        pigmentation_hyperpigmentation: formData.pigmentation.hyperpigmentation,
        pigmentation_hypopigmentation: formData.pigmentation.hypopigmentation,

        // Skin Conditions
        skin_condition_acne: formData.skinConditions.acne,
        skin_condition_eczema: formData.skinConditions.eczema,
        skin_condition_psoriasis: formData.skinConditions.psoriasis,
        skin_condition_rosacea: formData.skinConditions.rosacea,
        skin_condition_dermatitis: formData.skinConditions.dermatitis,
        skin_condition_na: formData.skinConditions.na,

        // Sun Damage
        sun_damage_sunburn: formData.sunDamage.sunburn,
        sun_damage_sunspots: formData.sunDamage.sunspots,
        sun_damage_wrinkles: formData.sunDamage.wrinkles,
        sun_damage_texture_changes: formData.sunDamage.textureChanges,

        // Elasticity Assessment
        elasticity_assessment_goes_back_within_1_second: formData.elasticityAssessment.goesBackWithin1Second,
        elasticity_assessment_does_not_go_back_within_1_second: formData.elasticityAssessment.doesNotGoBackWithin1Second,

        // Temperature Assessment
        temperature_assessment_warmth: formData.temperatureAssessment.warmth,
        temperature_assessment_cool: formData.temperatureAssessment.cool,
        temperature_assessment_abnormal_changes: formData.temperatureAssessment.abnormalChanges,

        // Other Assessment
        other_assessment_sensitive_skin: formData.otherAssessment.sensitiveSkin,
        other_assessment_medicine_allergy: formData.otherAssessment.medicineAllergy,
        other_assessment_skincare_routine: formData.otherAssessment.skincareRoutine,
        other_assessment_products_used: formData.otherAssessment.productsUsed,
        other_assessment_frequency_of_use: formData.otherAssessment.frequencyOfUse,
        other_assessment_products: formData.otherAssessment.products,
        other_assessment_physician_notes: formData.otherAssessment.physicianNotes,
        other_assessment_allergy_details: formData.otherAssessment.allergyDetails || '',
        other_assessment_diagnosis: formData.otherAssessment.diagnosis || '',
        other_assessment_medications_and_treatments: formData.otherAssessment.medicationsAndTreatments || ''
      };

      console.log("Submitting data:", submissionData);

      const { error } = await supabase
        .from("skin_assessment_records")
        .upsert(submissionData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      alert("Skin assessment saved successfully!");
      await fetchHistoryRecords();
      
      // Reset form
      setFormData({
        injuries: {
          pressureUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          venousUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          diabeticUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          arterialUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          surgicalUlcer: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          bruiseHematoma: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          abrasion: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          burn: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          rash: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          redness: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          blister: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          traumaLaceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          ostomyPegTube: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' },
          maceration: { yes: false, no: false, bodyPart: '', size: '', color: '', shape: '' }
        },
        skinType: {
          normal: false,
          dry: false,
          oily: false,
          combination: false,
          sensitive: false
        },
        skinColor: {
          pale: false,
          fair: false,
          medium: false,
          olive: false,
          dark: false
        },
        skinTexture: {
          smooth: false,
          rough: false,
          flaky: false,
          bumpy: false,
          uneven: false
        },
        skinHydration: {
          hydrated: false,
          dehydrated: false,
          moist: false,
          dry: false
        },
        skinElasticity: {
          elastic: false,
          sagging: false,
          tight: false,
          wrinkled: false
        },
        skinSensitivity: {
          nonSensitive: false,
          mildlySensitive: false,
          moderatelySensitive: false,
          highlySensitive: false
        },
        pigmentation: {
          freckles: false,
          ageSpots: false,
          sunSpots: false,
          hyperpigmentation: false,
          hypopigmentation: false
        },
        skinConditions: {
          acne: false,
          eczema: false,
          psoriasis: false,
          rosacea: false,
          dermatitis: false,
          na: false
        },
        sunDamage: {
          sunburn: false,
          sunspots: false,
          wrinkles: false,
          textureChanges: false
        },
        elasticityAssessment: {
          goesBackWithin1Second: false,
          doesNotGoBackWithin1Second: false
        },
        temperatureAssessment: {
          warmth: false,
          cool: false,
          abnormalChanges: false
        },
        otherAssessment: {
          sensitiveSkin: false,
          medicineAllergy: false,
          skincareRoutine: '',
          productsUsed: '',
          frequencyOfUse: '',
          products: [],
          physicianNotes: '',
          allergyDetails: '',
          diagnosis: '',
          medicationsAndTreatments: ''
        }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Error saving assessment. Please try again.");
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
            <p className="mt-1 text-lg text-indigo-200">Skin Assessment</p>
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
            <h2 className="text-2xl font-semibold text-white">Skin Assessment Form</h2>
          </div>

          <div className="p-8 space-y-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Patient Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push(`/patient-information?returnTo=/skin-assessment`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Patient Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.full_name || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Service
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Physician</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {attending || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.age || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.gender || "Not available"}
                  </p>
                </div>
              </div>

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
                          {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Skin Temperature</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="temperatureAssessment.warmth"
                        checked={formData.temperatureAssessment.warmth}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Warmth</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="temperatureAssessment.cool"
                        checked={formData.temperatureAssessment.cool}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cool</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="temperatureAssessment.abnormalChanges"
                        checked={formData.temperatureAssessment.abnormalChanges}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Abnormal temperature changes</span>
                    </label>
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
                  {Object.values(formData.skinElasticity).some(value => value) && (
                    <div className="mt-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Assessment of Skin Elasticity:</h5>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="elasticityAssessment.goesBackWithin1Second"
                            checked={formData.elasticityAssessment.goesBackWithin1Second}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">The skin goes back within 1 second</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="elasticityAssessment.doesNotGoBackWithin1Second"
                            checked={formData.elasticityAssessment.doesNotGoBackWithin1Second}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Did not go back within 1 second</span>
                        </label>
                      </div>
                    </div>
                  )}
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
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'nonSensitive' ? 'Non-sensitive' :
                           key === 'mildlySensitive' ? 'Mildly sensitive' :
                           key === 'moderatelySensitive' ? 'Moderately sensitive' :
                           'Highly sensitive'}
                        </span>
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
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'freckles' ? 'Freckles' :
                           key === 'ageSpots' ? 'Age spots' :
                           key === 'sunSpots' ? 'Sun spots' :
                           key === 'hyperpigmentation' ? 'Hyperpigmentation' :
                           'Hypopigmentation'}
                        </span>
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
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'acne' ? 'Acne' :
                           key === 'eczema' ? 'Eczema' :
                           key === 'psoriasis' ? 'Psoriasis' :
                           key === 'rosacea' ? 'Rosacea' :
                           key === 'dermatitis' ? 'Dermatitis' :
                           'N/A'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Sun Damage Assessment</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sunDamage.sunburn"
                        checked={formData.sunDamage.sunburn}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Presence of sunburn</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sunDamage.sunspots"
                        checked={formData.sunDamage.sunspots}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Sunspots</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sunDamage.wrinkles"
                        checked={formData.sunDamage.wrinkles}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Wrinkles</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sunDamage.textureChanges"
                        checked={formData.sunDamage.textureChanges}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Changes in skin texture due to sun exposure</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Other Assessment</h3>
              
              <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Do you have sensitive skin?</h4>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                          type="radio"
                        name="otherAssessment.sensitiveSkin"
                        checked={formData.otherAssessment.sensitiveSkin}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            otherAssessment: { ...prev.otherAssessment, sensitiveSkin: true }
                          }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="otherAssessment.sensitiveSkin"
                          checked={!formData.otherAssessment.sensitiveSkin}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            otherAssessment: { ...prev.otherAssessment, sensitiveSkin: false }
                          }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Do you have any allergy to medicine?</h4>
                    <div className="flex space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                          type="radio"
                        name="otherAssessment.medicineAllergy"
                        checked={formData.otherAssessment.medicineAllergy}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            otherAssessment: { ...prev.otherAssessment, medicineAllergy: true }
                          }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="otherAssessment.medicineAllergy"
                          checked={!formData.otherAssessment.medicineAllergy}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            otherAssessment: { ...prev.otherAssessment, medicineAllergy: false }
                          }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>

                    {formData.otherAssessment.medicineAllergy && (
                      <div className="pl-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Please specify which medicines you are allergic to:</label>
                        <input
                          type="text"
                          name="otherAssessment.allergyDetails"
                          value={formData.otherAssessment.allergyDetails || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          placeholder="List the medicines you are allergic to"
                        />
                      </div>
                    )}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.otherAssessment.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={product.name}
                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter product name"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={product.frequency}
                                onChange={(e) => handleProductChange(index, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="e.g., Daily, Weekly, Monthly"
                            />
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                                onClick={() => handleRemoveProduct(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <button
                      type="button"
                        onClick={handleAddProduct}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Product
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Physician Notes</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <textarea
                          name="otherAssessment.diagnosis"
                          value={formData.otherAssessment.diagnosis || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          placeholder="Enter diagnosis here..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medications and Treatments</label>
                        <textarea
                          name="otherAssessment.medicationsAndTreatments"
                          value={formData.otherAssessment.medicationsAndTreatments || ''}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          placeholder="Enter medications and treatments here..."
                        />
                      </div>
                    </div>
                </div>
              </div>
            </section>

              <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
              <button
                type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => router.push(`/`)}
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

            {/* Assessment History Table */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Assessment History</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nurse/Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.physician_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAssessmentPage; 
'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Activity, 
  Wind, 
  Battery, 
  Zap,
  MapPin,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  CalendarDays,
  Droplets,
  Moon,
  TrendingUp,
  Brain,
  Home,
  ChevronRight,
  Loader2,
  Save,
  X,
  MessageCircle,
  UserCircle,
  Send,
  Sparkles
} from 'lucide-react'

// Types
type Screen = 'landing' | 'consent' | 'symptoms' | 'risk-factors' | 'analyzing' | 'results' | 'save'
type RiskLevel = 'high' | 'medium' | 'low'

interface Symptom {
  id: string
  label: string
  icon: any
  selected: boolean
  severity?: 'mild' | 'moderate' | 'severe'
  onset?: 'today' | 'week' | 'longer'
}

interface RiskFactors {
  age: string
  smoking: 'yes' | 'no' | 'quit' | ''
  bloodPressure: 'yes' | 'no' | 'unsure' | ''
  familyHistory: 'yes' | 'no' | ''
  previousHeart: 'yes' | 'no' | ''
}

export default function CardioApp() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [consentGiven, setConsentGiven] = useState(false)
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: 'chest', label: 'Chest discomfort or pressure', icon: Heart, selected: false },
    { id: 'breath', label: 'Shortness of breath', icon: Wind, selected: false },
    { id: 'fatigue', label: 'Unusual fatigue', icon: Battery, selected: false },
    { id: 'dizzy', label: 'Dizziness or fainting', icon: Activity, selected: false },
    { id: 'irregular', label: 'Irregular heartbeat', icon: Zap, selected: false },
    { id: 'none', label: 'None of the above', icon: CheckCircle2, selected: false },
  ])
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    age: '',
    smoking: '',
    bloodPressure: '',
    familyHistory: '',
    previousHeart: ''
  })
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low')
  const [fastTrackCode, setFastTrackCode] = useState('')
  const [showAIChat, setShowAIChat] = useState(false)
  const [showDoctorChat, setShowDoctorChat] = useState(false)

  // Toggle symptom selection
  const toggleSymptom = (id: string) => {
    setSymptoms(prev => {
      const updated = prev.map(s => {
        if (id === 'none') {
          return s.id === 'none' ? { ...s, selected: !s.selected } : { ...s, selected: false }
        }
        if (s.id === id) {
          return { ...s, selected: !s.selected }
        }
        if (s.id === 'none' && id !== 'none') {
          return { ...s, selected: false }
        }
        return s
      })
      return updated
    })
  }

  // Update symptom details
  const updateSymptomDetail = (id: string, field: 'severity' | 'onset', value: any) => {
    setSymptoms(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  // Calculate risk level (mock logic)
  const calculateRisk = () => {
    const selectedSymptoms = symptoms.filter(s => s.selected && s.id !== 'none')
    const symptomCount = selectedSymptoms.length
    const hasSevereSymptoms = selectedSymptoms.some(s => s.severity === 'severe')
    const age = parseInt(riskFactors.age) || 0
    const hasRiskFactors = [
      riskFactors.smoking === 'yes',
      riskFactors.bloodPressure === 'yes',
      riskFactors.familyHistory === 'yes',
      riskFactors.previousHeart === 'yes'
    ].filter(Boolean).length

    if (hasSevereSymptoms || symptomCount >= 3 || (symptomCount >= 2 && hasRiskFactors >= 2)) {
      setRiskLevel('high')
    } else if (symptomCount >= 1 || hasRiskFactors >= 2 || age > 60) {
      setRiskLevel('medium')
    } else {
      setRiskLevel('low')
    }

    // Generate fake fast track code
    setFastTrackCode(`HT-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  // Start analysis
  const startAnalysis = () => {
    setScreen('analyzing')
    calculateRisk()
    setTimeout(() => {
      setScreen('results')
    }, 5000)
  }

  // Check if risk factors form is complete
  const isRiskFactorsComplete = (): boolean => {
    return (riskFactors.age !== '' && riskFactors.smoking !== '' && riskFactors.bloodPressure !== '' && 
           riskFactors.familyHistory !== '' && riskFactors.previousHeart !== '') as boolean
  }

  // Render different screens
  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return <LandingScreen onStart={() => setScreen('consent')} />
      
      case 'consent':
        return (
          <ConsentScreen 
            consentGiven={consentGiven}
            setConsentGiven={setConsentGiven}
            onContinue={() => setScreen('symptoms')}
          />
        )
      
      case 'symptoms':
        return (
          <SymptomsScreen 
            symptoms={symptoms}
            toggleSymptom={toggleSymptom}
            updateSymptomDetail={updateSymptomDetail}
            onContinue={() => setScreen('risk-factors')}
            onBack={() => setScreen('consent')}
          />
        )
      
      case 'risk-factors':
        return (
          <RiskFactorsScreen 
            riskFactors={riskFactors}
            setRiskFactors={setRiskFactors}
            onContinue={startAnalysis}
            onBack={() => setScreen('symptoms')}
            isComplete={isRiskFactorsComplete()}
          />
        )
      
      case 'analyzing':
        return <AnalyzingScreen />
      
      case 'results':
        return (
          <ResultsScreen 
            riskLevel={riskLevel}
            fastTrackCode={fastTrackCode}
            onSave={() => setScreen('save')}
            showAIChat={showAIChat}
            setShowAIChat={setShowAIChat}
            showDoctorChat={showDoctorChat}
            setShowDoctorChat={setShowDoctorChat}
            onRestart={() => {
              setScreen('landing')
              setShowAIChat(false)
              setShowDoctorChat(false)
              // Reset state
              setSymptoms(symptoms.map(s => ({ ...s, selected: false })))
              setRiskFactors({
                age: '',
                smoking: '',
                bloodPressure: '',
                familyHistory: '',
                previousHeart: ''
              })
            }}
          />
        )
      
      case 'save':
        return (
          <SaveScreen 
            onSave={() => setScreen('results')}
            onSkip={() => setScreen('results')}
          />
        )
      
      default:
        return <LandingScreen onStart={() => setScreen('consent')} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  )
}

// ============================================
// LANDING SCREEN
// ============================================
function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <Heart className="w-20 h-20 text-medical-500 animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-800 mb-6 leading-tight">
            Not feeling well?<br />
            Check your heart risk<br />
            <span className="text-medical-600">in 3 minutes.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Free. No registration. Based on symptoms, not diagnosis.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-semibold text-lg transition-smooth shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              Check my symptoms now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-lg transition-smooth border-2 border-slate-200 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              Find hospitals near me
            </button>
          </div>
          
          <button className="text-medical-600 hover:text-medical-700 font-medium flex items-center gap-2 mx-auto transition-smooth">
            <Info className="w-5 h-5" />
            How this works
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
          {[
            { icon: Heart, title: 'Evidence-Based', desc: 'Built on clinical guidelines' },
            { icon: Clock, title: '3 Minutes', desc: 'Quick and simple process' },
            { icon: CheckCircle2, title: 'Free & Private', desc: 'No registration needed' }
          ].map((item, i) => (
            <div 
              key={i} 
              className="text-center p-6 bg-white/60 backdrop-blur rounded-2xl border border-slate-200 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <item.icon className="w-10 h-10 text-medical-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// CONSENT SCREEN
// ============================================
function ConsentScreen({ 
  consentGiven, 
  setConsentGiven, 
  onContinue 
}: { 
  consentGiven: boolean
  setConsentGiven: (value: boolean) => void
  onContinue: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-200 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-medical-50 rounded-full">
              <Info className="w-12 h-12 text-medical-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-slate-800 text-center mb-6">
            Before we begin
          </h2>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border-l-4 border-medical-500">
            <p className="text-lg text-slate-700 leading-relaxed">
              This tool <span className="font-semibold">does not diagnose disease</span>.<br />
              It helps identify whether a medical check is recommended.
            </p>
          </div>

          <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-5 h-5 text-medical-600 rounded border-slate-300 focus:ring-medical-500"
              />
              <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                I understand this is a screening tool, not a medical diagnosis
              </span>
            </label>
          </div>

          <button
            onClick={onContinue}
            disabled={!consentGiven}
            className="w-full py-4 bg-medical-600 hover:bg-medical-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-smooth shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SYMPTOMS SCREEN
// ============================================
function SymptomsScreen({ 
  symptoms, 
  toggleSymptom, 
  updateSymptomDetail,
  onContinue,
  onBack 
}: { 
  symptoms: Symptom[]
  toggleSymptom: (id: string) => void
  updateSymptomDetail: (id: string, field: 'severity' | 'onset', value: any) => void
  onContinue: () => void
  onBack: () => void
}) {
  const hasSelections = symptoms.some(s => s.selected)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-800 mb-4">
            What are you feeling?
          </h2>
          <p className="text-slate-600">Select all symptoms that apply to you</p>
        </div>

        <div className="space-y-4 mb-8">
          {symptoms.map((symptom, index) => {
            const Icon = symptom.icon
            const isNone = symptom.id === 'none'
            
            return (
              <div 
                key={symptom.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-smooth text-left ${
                    symptom.selected
                      ? isNone
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-medical-50 border-medical-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      symptom.selected
                        ? isNone
                          ? 'bg-emerald-100'
                          : 'bg-medical-100'
                        : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        symptom.selected
                          ? isNone
                            ? 'text-emerald-600'
                            : 'text-medical-600'
                          : 'text-slate-600'
                      }`} />
                    </div>
                    <span className="text-lg font-medium text-slate-800 flex-1">
                      {symptom.label}
                    </span>
                    {symptom.selected && !isNone && (
                      <CheckCircle2 className="w-6 h-6 text-medical-600" />
                    )}
                  </div>
                </button>

                {/* Follow-up questions */}
                {symptom.selected && !isNone && (
                  <div className="mt-4 ml-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        When did it start?
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: 'today', label: 'Today' },
                          { value: 'week', label: 'This week' },
                          { value: 'longer', label: 'Longer than 1 week' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => updateSymptomDetail(symptom.id, 'onset', option.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                              symptom.onset === option.value
                                ? 'bg-medical-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-medical-500'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        How strong?
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: 'mild', label: 'Mild' },
                          { value: 'moderate', label: 'Moderate' },
                          { value: 'severe', label: 'Severe' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => updateSymptomDetail(symptom.id, 'severity', option.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                              symptom.severity === option.value
                                ? 'bg-medical-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-medical-500'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-smooth border-2 border-slate-200"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!hasSelections}
            className="flex-1 py-4 bg-medical-600 hover:bg-medical-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-smooth shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// RISK FACTORS SCREEN
// ============================================
function RiskFactorsScreen({ 
  riskFactors, 
  setRiskFactors, 
  onContinue,
  onBack,
  isComplete
}: { 
  riskFactors: RiskFactors
  setRiskFactors: (factors: RiskFactors) => void
  onContinue: () => void
  onBack: () => void
  isComplete: boolean
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-800 mb-4">
            A few questions about you
          </h2>
          <p className="text-slate-600">This helps us assess your heart health risk</p>
        </div>

        <div className="space-y-6 mb-8">
          {/* Age */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-slide-up">
            <label className="block text-lg font-medium text-slate-800 mb-3">
              Your age
            </label>
            <input
              type="number"
              value={riskFactors.age}
              onChange={(e) => setRiskFactors({ ...riskFactors, age: e.target.value })}
              placeholder="Enter your age"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-medical-500 focus:ring-0 text-lg"
            />
          </div>

          {/* Smoking */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-slide-up animation-delay-100">
            <label className="block text-lg font-medium text-slate-800 mb-3">
              Smoking status
            </label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'quit', label: 'Quit' },
                { value: 'no', label: 'No' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRiskFactors({ ...riskFactors, smoking: option.value as any })}
                  className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
                    riskFactors.smoking === option.value
                      ? 'bg-medical-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-slide-up animation-delay-200">
            <label className="block text-lg font-medium text-slate-800 mb-3">
              High blood pressure
            </label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unsure', label: 'Not sure' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRiskFactors({ ...riskFactors, bloodPressure: option.value as any })}
                  className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
                    riskFactors.bloodPressure === option.value
                      ? 'bg-medical-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Family History */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-slide-up animation-delay-300">
            <label className="block text-lg font-medium text-slate-800 mb-3">
              Family history of heart disease
            </label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRiskFactors({ ...riskFactors, familyHistory: option.value as any })}
                  className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
                    riskFactors.familyHistory === option.value
                      ? 'bg-medical-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Previous Heart Problems */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-slide-up animation-delay-400">
            <label className="block text-lg font-medium text-slate-800 mb-3">
              Previous heart problems
            </label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRiskFactors({ ...riskFactors, previousHeart: option.value as any })}
                  className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
                    riskFactors.previousHeart === option.value
                      ? 'bg-medical-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-smooth border-2 border-slate-200"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!isComplete}
            className="flex-1 py-4 bg-medical-600 hover:bg-medical-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-smooth shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Analyze my risk
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ANALYZING SCREEN
// ============================================
function AnalyzingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-block mb-8">
          <Heart className="w-24 h-24 text-medical-500 animate-heartbeat" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">
          Analyzing your symptoms...
        </h2>
        <p className="text-slate-600 mb-8">
          Please wait while we assess your cardiovascular health
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-medical-500 animate-spin" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// RESULTS SCREEN
// ============================================
function ResultsScreen({ 
  riskLevel, 
  fastTrackCode,
  onSave,
  onRestart,
  showAIChat,
  setShowAIChat,
  showDoctorChat,
  setShowDoctorChat
}: { 
  riskLevel: RiskLevel
  fastTrackCode: string
  onSave: () => void
  onRestart: () => void
  showAIChat: boolean
  setShowAIChat: (show: boolean) => void
  showDoctorChat: boolean
  setShowDoctorChat: (show: boolean) => void
}) {
  const config = {
    high: {
      icon: Heart,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      title: 'High Risk Detected',
      message: 'Your symptoms suggest a high cardiovascular risk.',
      subtext: 'This does not mean a diagnosis, but medical evaluation is strongly recommended.',
      action: 'Seek Medical Attention Now'
    },
    medium: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      title: 'Medical Attention Recommended',
      message: 'Your symptoms require medical attention, but are not urgent.',
      subtext: 'Schedule a check-up within 1-2 weeks to discuss these symptoms.',
      action: 'Schedule Appointment'
    },
    low: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      title: 'No Immediate Risk Detected',
      message: 'Based on your responses, no immediate cardiovascular risk was identified.',
      subtext: 'Continue monitoring your health and maintain healthy habits.',
      action: 'View Health Tips'
    }
  }

  const current = config[riskLevel]
  const Icon = current.icon

  // If AI Chat is open
  if (showAIChat) {
    return <AIChatInterface onClose={() => setShowAIChat(false)} riskLevel={riskLevel} />
  }

  // If Doctor Chat is open
  if (showDoctorChat) {
    return <DoctorChatInterface onClose={() => setShowDoctorChat(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Result Card */}
        <div className={`${current.bgColor} rounded-3xl p-8 md:p-12 border-2 ${current.borderColor} mb-8 animate-fade-in`}>
          <div className="text-center mb-8">
            <div className={`inline-flex p-6 ${current.bgColor} rounded-full mb-6`}>
              <Icon className={`w-20 h-20 ${current.iconColor}`} />
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-800 mb-4">
              {current.title}
            </h2>
            <p className="text-xl text-slate-700 mb-3">
              {current.message}
            </p>
            <p className="text-slate-600">
              {current.subtext}
            </p>
          </div>

          {/* High Risk: Fast Track Code & Hospitals */}
          {riskLevel === 'high' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Fast Track Code</h3>
                  <span className="text-2xl font-bold text-red-600">{fastTrackCode}</span>
                </div>
                <p className="text-sm text-slate-600">
                  Show this code at the hospital for priority access
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Nearest Hospitals</h3>
                <div className="space-y-3">
                  {[
                    { name: 'City General Hospital', distance: '1.2 km', wait: '15 min' },
                    { name: 'Heart Care Center', distance: '2.8 km', wait: '25 min' },
                    { name: 'Regional Medical', distance: '4.1 km', wait: '30 min' }
                  ].map((hospital, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-smooth cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-800">{hospital.name}</p>
                        <p className="text-sm text-slate-600">{hospital.distance} • ~{hospital.wait} wait</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Medium Risk: Action Items */}
          {riskLevel === 'medium' && (
            <div className="space-y-4">
              <button className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-smooth flex items-center justify-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Schedule Check-up (1-2 weeks)
              </button>
              <button className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-xl font-semibold transition-smooth flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Set Reminder
              </button>
            </div>
          )}

          {/* Low Risk: Health Tips */}
          {riskLevel === 'low' && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {[
                { icon: Droplets, title: 'Stay Hydrated', desc: 'Drink 8 glasses of water daily' },
                { icon: Moon, title: 'Rest Well', desc: '7-9 hours of quality sleep' },
                { icon: TrendingUp, title: 'Stay Active', desc: '30 min moderate exercise daily' },
                { icon: Brain, title: 'Manage Stress', desc: 'Practice mindfulness & relaxation' }
              ].map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <tip.icon className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 mb-2">{tip.title}</h4>
                  <p className="text-sm text-slate-600">{tip.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Options - Available for ALL risk levels */}
        <div className="mb-8 space-y-4">
          {/* AI Chat Option - For all risk levels */}
          <button
            onClick={() => setShowAIChat(true)}
            className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold transition-smooth shadow-lg hover:shadow-xl flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Chat with AI Health Assistant</h3>
                <p className="text-blue-100 text-sm">Get instant answers to your health questions</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Doctor Chat Option - Only for HIGH risk */}
          {riskLevel === 'high' && (
            <button
              onClick={() => setShowDoctorChat(true)}
              className="w-full p-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-semibold transition-smooth shadow-lg hover:shadow-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">Chat with Dr. Rasul Sultangaziev</h3>
                  <p className="text-red-100 text-sm">Leading cardiovascular surgeon • Available now</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={onSave}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-smooth border-2 border-slate-200 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Result
          </button>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-semibold transition-smooth flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// AI CHAT INTERFACE
// ============================================
function AIChatInterface({ onClose, riskLevel }: { onClose: () => void, riskLevel: RiskLevel }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Health Assistant. Based on your ${riskLevel} risk screening results, I'm here to answer any questions you may have about cardiovascular health. How can I help you today?`
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSend = () => {
    if (!inputMessage.trim()) return
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: inputMessage }]
    setMessages(newMessages)
    
    // Simulate AI response
    setTimeout(() => {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Thank you for your question. This is a demo interface showing how AI chat would work. In a real implementation, an AI would provide personalized health guidance based on your screening results and medical knowledge."
      }])
    }, 1000)
    
    setInputMessage('')
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] md:h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-3xl flex-shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-white">AI Health Assistant</h2>
              <p className="text-blue-100 text-xs md:text-sm">Powered by medical AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 border-t border-slate-200 flex-shrink-0">
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-0 text-sm md:text-base"
            />
            <button
              onClick={handleSend}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-smooth flex items-center gap-2"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 md:mt-3 text-center">
            Demo interface • Real AI would provide medical guidance
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// DOCTOR CHAT INTERFACE
// ============================================
function DoctorChatInterface({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    {
      role: 'doctor',
      content: "Hello, I'm Dr. Rasul Sultangaziev. I've reviewed your screening results and I'm here to help. What concerns would you like to discuss?"
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showProfile, setShowProfile] = useState(true)

  const handleSend = () => {
    if (!inputMessage.trim()) return
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: inputMessage }]
    setMessages(newMessages)
    
    // Simulate doctor response
    setTimeout(() => {
      setMessages([...newMessages, {
        role: 'doctor',
        content: "Thank you for reaching out. This is a demo interface. In a real implementation, you would be connected to Dr. Sultangaziev for a live consultation about your cardiovascular health."
      }])
    }, 1500)
    
    setInputMessage('')
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row gap-4 animate-fade-in">
        
        {/* Doctor Profile Card - Collapsible on Mobile */}
        <div className={`${showProfile ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 md:p-6 overflow-y-auto flex-shrink-0`}>
          <button 
            onClick={() => setShowProfile(false)}
            className="lg:hidden absolute top-2 right-2 p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Dr. Rasul Sultangaziev</h3>
            <p className="text-red-600 font-semibold text-sm md:text-base">Cardiovascular Surgeon</p>
            <p className="text-xs md:text-sm text-slate-600">Doctor of Medical Sciences</p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-700">Leading surgeon in Kyrgyzstan</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-700">25+ years of experience</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-700">Complex cases specialist</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 md:p-4 mb-4">
            <h4 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">About</h4>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              One of Kyrgyzstan's leading cardiovascular surgeons. His philosophy: "The greatest reward is when a patient forgets about me - because it means they're healthy."
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Available now</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Response: 2-5 min</span>
            </div>
          </div>

          <button
            onClick={() => setShowProfile(false)}
            className="lg:hidden w-full mt-4 py-2 bg-red-500 text-white rounded-xl font-semibold"
          >
            Start Chat
          </button>
        </div>

        {/* Chat Interface */}
        <div className={`${showProfile ? 'hidden lg:flex' : 'flex'} flex-1 bg-white rounded-3xl shadow-2xl border border-slate-200 flex-col min-h-0`}>
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-pink-500 rounded-t-3xl flex-shrink-0">
            <button
              onClick={() => setShowProfile(true)}
              className="lg:hidden p-2 hover:bg-white/20 rounded-lg mr-2"
            >
              <ChevronRight className="w-5 h-5 text-white transform rotate-180" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-white">Dr. Rasul Sultangaziev</h2>
                <p className="text-red-100 text-xs md:text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? '' : 'flex gap-2 md:gap-3'}`}>
                  {msg.role === 'doctor' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  )}
                  <div className={`p-3 md:p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-red-500 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 border-t border-slate-200 flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message the doctor..."
                className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-slate-300 rounded-xl focus:border-red-500 focus:ring-0 text-sm md:text-base"
              />
              <button
                onClick={handleSend}
                className="px-4 md:px-6 py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-smooth flex items-center gap-2"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 md:mt-3 text-center">
              Demo interface • Real consultation would occur here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SAVE SCREEN
// ============================================
function SaveScreen({ onSave, onSkip }: { onSave: () => void, onSkip: () => void }) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      onSave()
    }, 1500)
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
            Result Saved!
          </h2>
          <p className="text-slate-600">
            You can compare it with future screenings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-200 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-medical-50 rounded-full mb-6">
              <Save className="w-12 h-12 text-medical-600" />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">
              Save Your Results?
            </h2>
            <p className="text-slate-600">
              Keep this screening for future comparison and track changes over time
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-semibold text-lg transition-smooth shadow-lg hover:shadow-xl"
            >
              Save Result
            </button>
            <button
              onClick={onSkip}
              className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-smooth border-2 border-slate-200"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
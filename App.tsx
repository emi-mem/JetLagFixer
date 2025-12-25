import React, { useState } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { generatePlan, UserInputs, JetLagPlan } from './src/core/planGenerator'
import { COMMON_TIMEZONES } from './src/utils/timezones'

export default function App() {
  const [showHomeTzPicker, setShowHomeTzPicker] = useState(false)
  const [showDestTzPicker, setShowDestTzPicker] = useState(false)
  const [homeTimeZone, setHomeTimeZone] = useState('America/New_York')
  const [destinationTimeZone, setDestinationTimeZone] = useState('Europe/London')
  const [arrivalDate, setArrivalDate] = useState(new Date())
  const [arrivalTime, setArrivalTime] = useState('10:00')
  const [usualBedtime, setUsualBedtime] = useState('23:00')
  const [usualWakeTime, setUsualWakeTime] = useState('07:00')
  const [napsAllowed, setNapsAllowed] = useState(true)
  const [caffeineUse, setCaffeineUse] = useState(true)
  const [plan, setPlan] = useState<JetLagPlan | null>(null)

  const handleGeneratePlan = () => {
    // Parse arrival date and time
    const [hours, minutes] = arrivalTime.split(':').map(Number)
    const arrivalDateTime = new Date(arrivalDate)
    arrivalDateTime.setHours(hours, minutes, 0, 0)

    const inputs: UserInputs = {
      homeTimeZone,
      destinationTimeZone,
      arrivalDateTime,
      usualBedtime,
      usualWakeTime,
      napsAllowed,
      caffeineUse,
    }

    const generatedPlan = generatePlan(inputs)
    setPlan(generatedPlan)
  }

  const renderTimeZonePicker = (
    visible: boolean,
    onClose: () => void,
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <FlatList
              data={COMMON_TIMEZONES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timezoneItem,
                    selectedValue === item.value && styles.timezoneItemSelected
                  ]}
                  onPress={() => {
                    onSelect(item.value)
                    onClose()
                  }}
                >
                  <Text style={[
                    styles.timezoneItemText,
                    selectedValue === item.value && styles.timezoneItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>🌍 Jet Lag Fixer</Text>
        <Text style={styles.subtitle}>Your Personalized Arrival-Day Plan</Text>
        
        {!plan ? (
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>📍 Home Timezone</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowHomeTzPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {COMMON_TIMEZONES.find(tz => tz.value === homeTimeZone)?.label || homeTimeZone}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>✈️ Destination Timezone</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDestTzPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {COMMON_TIMEZONES.find(tz => tz.value === destinationTimeZone)?.label || destinationTimeZone}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>🛬 Arrival Date & Time (Destination Time)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.dateInput, { marginRight: 5 }]}
                  value={arrivalDate.toISOString().split('T')[0]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  onChangeText={(text) => {
                    const date = new Date(text)
                    if (!isNaN(date.getTime())) {
                      setArrivalDate(date)
                    }
                  }}
                />
                <TextInput
                  style={[styles.input, styles.timeInput, { marginLeft: 5 }]}
                  value={arrivalTime}
                  placeholder="HH:mm"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  onChangeText={setArrivalTime}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>💤 Usual Sleep Schedule (Home Time)</Text>
              <View style={styles.row}>
                <View style={[styles.timeInputContainer, { marginRight: 5 }]}>
                  <Text style={styles.inputLabel}>Bedtime</Text>
                  <TextInput
                    style={styles.input}
                    value={usualBedtime}
                    placeholder="23:00"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    onChangeText={setUsualBedtime}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.timeInputContainer, { marginLeft: 5 }]}>
                  <Text style={styles.inputLabel}>Wake Time</Text>
                  <TextInput
                    style={styles.input}
                    value={usualWakeTime}
                    placeholder="07:00"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    onChangeText={setUsualWakeTime}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>⚙️ Preferences</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Naps Allowed</Text>
                <Switch
                  value={napsAllowed}
                  onValueChange={setNapsAllowed}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={napsAllowed ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Caffeine Use</Text>
                <Switch
                  value={caffeineUse}
                  onValueChange={setCaffeineUse}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={caffeineUse ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
              <Text style={styles.generateButtonText}>Generate My Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planContainer}>
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Your Arrival-Day Plan</Text>
              
              <View style={styles.planSection}>
                <Text style={styles.sectionLabel}>🌙 Sleep Schedule</Text>
                <Text style={styles.planText}>Bedtime: <Text style={styles.highlight}>{plan.bedtime}</Text></Text>
                <Text style={styles.planText}>Wake Time: <Text style={styles.highlight}>{plan.wakeTime}</Text></Text>
                <Text style={styles.planText}>Direction: {plan.direction === 'advance' ? '⏰ Advance (eastbound)' : '🌙 Delay (westbound)'}</Text>
              </View>
              
              {plan.napWindow && (
                <View style={styles.planSection}>
                  <Text style={styles.sectionLabel}>😴 Nap Window</Text>
                  <Text style={styles.planText}>{plan.napWindow.start} - {plan.napWindow.end}</Text>
                  <Text style={styles.planTextSmall}>{plan.napWindow.description}</Text>
                </View>
              )}
              
              {plan.caffeineCutoff && (
                <View style={styles.planSection}>
                  <Text style={styles.sectionLabel}>☕ Caffeine Cutoff</Text>
                  <Text style={styles.planText}><Text style={styles.highlight}>{plan.caffeineCutoff}</Text></Text>
                </View>
              )}
              
              {plan.lightExposure.length > 0 && (
                <View style={styles.planSection}>
                  <Text style={styles.sectionLabel}>☀️ Seek Light</Text>
                  {plan.lightExposure.map((window, i) => (
                    <View key={i} style={{ marginTop: 4 }}>
                      <Text style={styles.planText}>{window.start} - {window.end}</Text>
                      <Text style={styles.planTextSmall}>{window.description}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {plan.lightAvoidance.length > 0 && (
                <View style={styles.planSection}>
                  <Text style={styles.sectionLabel}>🌑 Avoid Light</Text>
                  {plan.lightAvoidance.map((window, i) => (
                    <View key={i} style={{ marginTop: 4 }}>
                      <Text style={styles.planText}>{window.start} - {window.end}</Text>
                      <Text style={styles.planTextSmall}>{window.description}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {plan.fallbackRules.length > 0 && (
                <View style={styles.planSection}>
                  <Text style={styles.sectionLabel}>🛟 Fallback Rules</Text>
                  {plan.fallbackRules.map((rule, i) => (
                    <Text key={i} style={styles.planTextSmall}>• {rule}</Text>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.newPlanButton} 
                onPress={() => setPlan(null)}
              >
                <Text style={styles.newPlanButtonText}>Create New Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {renderTimeZonePicker(
          showHomeTzPicker,
          () => setShowHomeTzPicker(false),
          homeTimeZone,
          setHomeTimeZone,
          'Select Home Timezone'
        )}

        {renderTimeZonePicker(
          showDestTzPicker,
          () => setShowDestTzPicker(false),
          destinationTimeZone,
          setDestinationTimeZone,
          'Select Destination Timezone'
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  formContainer: {
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  pickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  timeInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  planContainer: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  planSection: {
    marginBottom: 20,
  },
  planText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    marginTop: 6,
  },
  planTextSmall: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 18,
    marginTop: 4,
    opacity: 0.9,
  },
  highlight: {
    fontWeight: '600',
    fontSize: 16,
  },
  newPlanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  newPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#667eea',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  timezoneItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timezoneItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timezoneItemText: {
    fontSize: 16,
    color: '#fff',
  },
  timezoneItemTextSelected: {
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})

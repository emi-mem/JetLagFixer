# JetLagFixer

Jet Lag Fixer is a smart arrival-day sleep recommendation app that helps travelers adjust to new time zones as fast as possible, without complicated schedules or unrealistic rules.

## 🚀 Getting Started

This is an Expo React Native app. To run it:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

4. Or run on a specific platform:
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser
   ```

## 📱 Current Status

✅ **Completed:**
- Time zone difference calculation
- Advance/delay direction detection (eastbound/westbound)
- React Native UI with test cases

🔄 **In Progress:**
- Plan generation logic

📋 **Planned:**
- Bedtime & wake time recommendations
- Nap recommendations
- Caffeine cutoff timing
- Light exposure/avoidance windows
- User input forms

---

Jet Lag Fixer is a smart arrival-day sleep recommendation app that helps travelers adjust to new time zones as fast as possible, without complicated schedules or unrealistic rules.
Instead of generic advice, Jet Lag Fixer generates a personalized plan for the day you arrive, including:
When to sleep
If and when to nap
When to stop caffeine
When to seek or avoid light
The goal: sync your body clock to local time ASAP.

#🚀 Features
🌍 Automatic time-zone adjustment
🛬 Arrival-day focused guidance (no multi-day planning required)
💤 Personalized bedtime & wake time
😴 Smart nap recommendations (optional)
☕ Caffeine cutoff timing
☀️ Light exposure & avoidance windows
⚡ Optimized for fastest circadian adjustment
🧠 Soft constraints — guidance, not rigid rules
🧠 How It Works (High Level)

Detects the time-zone difference between home and destination
Determines whether the user needs to advance (eastbound) or delay (westbound) their body clock
Generates a destination-time plan for:
Tonight’s sleep
Optional naps
Caffeine cutoff
Light exposure strategy
Adapts recommendations based on:
Arrival time
User’s usual sleep schedule
Nap and caffeine preferences
All recommendations are generated using established circadian principles and simplified into actionable steps.

#📋 Inputs
Home time zone
Destination time zone
Arrival date & time (destination local time)
Usual bedtime & wake time
Preferences:
Naps allowed (yes/no)
Caffeine use (yes/no)

#📤 Outputs
A single Arrival-Day Plan, shown entirely in destination time:
🌙 Recommended bedtime & wake time
😴 Nap window (if applicable)
☕ Caffeine cutoff time
☀️ Light exposure / avoidance windows
🛟 Fallback rules if the plan isn’t followed perfectly

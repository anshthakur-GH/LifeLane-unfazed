export const intents = [
  {
    tag: "greeting",
    patterns: ["hi", "hello", "hey", "hii", "hiii", "hiiii", "greetings", "good morning", "good afternoon", "good evening"],
    responses: [
      "Hello! I'm LifeBot, your emergency response assistant. How can I help you today?",
      "Hi there! I'm LifeBot, ready to assist you with emergency services. What can I do for you?",
      "Hello! I'm LifeBot, your emergency response assistant. How may I help you today?"
    ]
  },
  {
    tag: "goodbye",
    patterns: ["bye", "goodbye", "see you", "see you later", "thank you", "thanks"],
    responses: [
      "Thank you for using LifeLane. Stay safe!",
      "Goodbye! Remember, we're here 24/7 for emergencies.",
      "Take care! Don't hesitate to reach out if you need emergency assistance."
    ]
  },
  {
    tag: "what_is_lifelane",
    patterns: ["what is lifelane", "tell me about lifelane", "how does lifelane work", "what does lifelane do", "explain lifelane"],
    responses: [
      "LifeLane is an emergency response system that lets you turn your private car into an emergency vehicle during medical emergencies. Submit a request, get verified, and receive a 5-minute siren activation code.",
      "LifeLane helps you respond to medical emergencies by allowing you to activate emergency sirens on your car. Just submit a request, get verified, and you'll receive a 5-minute activation code."
    ]
  },
  {
    tag: "how_to_request",
    patterns: ["how to request", "how to get code", "how to activate", "how to use", "how to submit", "request process", "activation process"],
    responses: [
      "To request emergency assistance: 1) Submit an emergency request through the app, 2) Our admin team will verify your request, 3) Once approved, you'll receive a 5-minute siren activation code.",
      "The process is simple: Submit your emergency request, wait for admin verification, and you'll receive a 5-minute activation code for the emergency siren."
    ]
  },
  {
    tag: "emergency_help",
    patterns: ["emergency", "help", "urgent", "immediate assistance", "need help now", "emergency help", "urgent help"],
    responses: [
      "For immediate emergency assistance, please contact our 24/7 support at +91 73938 00862 or email lifelanesupport@gmail.com.",
      "In case of emergency, reach out to our 24/7 support team at +91 73938 00862 or lifelanesupport@gmail.com immediately."
    ]
  },
  {
    tag: "support_contact",
    patterns: ["contact support", "support number", "support email", "how to contact", "get help", "contact help"],
    responses: [
      "Our 24/7 support team is available at +91 73938 00862 or lifelanesupport@gmail.com. Don't hesitate to reach out!",
      "You can contact our support team 24/7 at +91 73938 00862 or email lifelanesupport@gmail.com for assistance."
    ]
  },
  {
    tag: "code_validity",
    patterns: ["how long is code valid", "code duration", "activation time", "how long does code last", "code expiry"],
    responses: [
      "The siren activation code is valid for 5 minutes after approval. Make sure to use it promptly when received.",
      "Once you receive the activation code, it will be valid for 5 minutes. Please use it immediately for emergency situations."
    ]
  },
  {
    tag: "misuse_warning",
    patterns: ["what if i misuse", "false emergency", "fake request", "wrong use", "misuse consequences"],
    responses: [
      "Misuse of the LifeLane system may result in account suspension or legal action. Please use this service responsibly and only for genuine emergencies.",
      "LifeLane is for genuine emergencies only. Misuse can lead to account suspension or legal consequences. Please use responsibly."
    ]
  },
  {
    tag: "default",
    patterns: [],
    responses: [
      "I'm not sure I understand. Could you please rephrase your question?",
      "I didn't quite catch that. Could you please ask in a different way?",
      "I'm here to help with LifeLane emergency services. Could you please clarify your question?"
    ]
  }
]; 
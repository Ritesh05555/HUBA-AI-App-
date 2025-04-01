// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons
// import DOMPurify from "dompurify";
// import WebView from "react-native-webview"; // For rendering HTML content

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);

//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);

//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";

//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );

//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }

//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName = response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;

//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };

//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);

//     try {
//       const token = await AsyncStorage.getItem("token");
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response,
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error) {
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }

//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     const { status } = await Audio.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "Microphone access is required.");
//       return;
//     }

//     const recording = new Audio.Recording();
//     try {
//       await recording.prepareToRecordAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       await recording.startAsync();
//       setIsRecording(true);

//       setTimeout(async () => {
//         await recording.stopAndUnloadAsync();
//         setIsRecording(false);
//         const uri = recording.getURI();
//         Alert.alert("Recording", "Voice recorded. Speech-to-text not implemented.");
//       }, 5000); // Record for 5 seconds
//     } catch (error) {
//       console.error("Voice recording error:", error);
//     }
//   };

//   const handleLogout = async () => {
//     const token = await AsyncStorage.getItem("token");
//     await axios.post(
//       "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//       {},
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("firstName");
//     navigation.replace("Auth");
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <View style={styles.aiMessage}>
//                 <WebView
//                   originWhitelist={["*"]}
//                   source={{
//                     html: DOMPurify.sanitize(msg.answer),
//                   }}
//                   style={{
//                     height: 100,
//                     backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
//                   }}
//                 />
//               </View>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
   
//       <Stack.Navigator
//         initialRouteName="Splash"
//         screenOptions={{ headerShown: false }}
//       >
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
   
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#f9fafb",
//     color: "#111827",
//     marginVertical: 10,
//   },
//   authButton: {
//     width: "100%",
//     padding: 12,
//     backgroundColor: "#3b82f6",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   authButtonDisabled: {
//     backgroundColor: "#6b7280",
//   },
//   authButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   authToggle: {
//     marginTop: 10,
//     color: "#3b82f6",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   chatScreen: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   darkTheme: {
//     backgroundColor: "#1f2937",
//   },
//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   welcomeMessage: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -100 }, { translateY: -10 }],
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   chatContent: {
//     flex: 1,
//     padding: 10,
//   },
//   chatItem: {
//     marginBottom: 15,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "60%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   aiMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "70%",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
// });

// export default App;


///////////////////////////////////////////////////////////





/////////////////////////////////////////////////////////////////


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import { SafeAreaView } from "react-native-safe-area-context";
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons
// import DOMPurify from "dompurify";

// const Stack = createStackNavigator();

// // Splash Screen Component
// const SplashScreen = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);

//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);

//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: string, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";

//     try {
//       const response = await axios.post(
//         url,
//         isSignup
//           ? dataToSend
//           : { email: formData.email, password: formData.password }
//       );

//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }

//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Chat Screen Component
// const ChatScreen = ({ route, navigation }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState([]);
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState("light");
//   const scrollViewRef = useRef(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;

//     const timestamp = new Date().toISOString();
//     const newMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };

//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);

//     try {
//       const token = await AsyncStorage.getItem("token");
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response,
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error) {
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }

//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     const { status } = await Audio.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "Microphone access is required.");
//       return;
//     }

//     const recording = new Audio.Recording();
//     try {
//       await recording.prepareToRecordAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       await recording.startAsync();
//       setIsRecording(true);

//       setTimeout(async () => {
//         await recording.stopAndUnloadAsync();
//         setIsRecording(false);
//         const uri = recording.getURI();
//         Alert.alert("Recording", "Voice recorded. Speech-to-text not implemented.");
//       }, 5000); // Record for 5 seconds
//     } catch (error) {
//       console.error("Voice recording error:", error);
//     }
//   };

//   const handleLogout = async () => {
//     const token = await AsyncStorage.getItem("token");
//     await axios.post(
//       "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//       {},
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("firstName");
//     navigation.replace("Auth");
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <SafeAreaView style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView ref={scrollViewRef} style={styles.chatContent}>
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <View style={styles.aiMessage}>
//                 {Platform.OS === "web" ? (
//                   <iframe
//                     srcDoc={DOMPurify.sanitize(msg.answer)}
//                     style={{
//                       width: "100%",
//                       height: 100,
//                       border: "none",
//                       backgroundColor:
//                         theme === "dark" ? "#374151" : "#f3f4f6",
//                     }}
//                   />
//                 ) : (
//                   <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.answer) }} />
//                 )}
//               </View>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Main App Component
// const App = () => {
//   return (
   
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
    
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#f9fafb",
//     color: "#111827",
//     marginVertical: 10,
//   },
//   authButton: {
//     width: "100%",
//     padding: 12,
//     backgroundColor: "#3b82f6",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   authButtonDisabled: {
//     backgroundColor: "#6b7280",
//   },
//   authButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   authToggle: {
//     marginTop: 10,
//     color: "#3b82f6",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   chatScreen: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   darkTheme: {
//     backgroundColor: "#1f2937",
//   },
//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   welcomeMessage: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -100 }, { translateY: -10 }],
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   chatContent: {
//     flex: 1,
//     padding: 10,
//   },
//   chatItem: {
//     marginBottom: 15,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "60%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   aiMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "70%",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
// });

// export default App;

///////////////////////////////////
// working perfect


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);

//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);

//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";

//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );

//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }

//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;

//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };

//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);

//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval

//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Backend Response:", response.data); // Debugging: Log backend response

//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors

//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }

//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     const { status } = await Audio.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "Microphone access is required.");
//       return;
//     }

//     const recording = new Audio.Recording();
//     try {
//       await recording.prepareToRecordAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       await recording.startAsync();
//       setIsRecording(true);

//       setTimeout(async () => {
//         await recording.stopAndUnloadAsync();
//         setIsRecording(false);
//         const uri = recording.getURI();
//         Alert.alert("Recording", "Voice recorded. Speech-to-text not implemented.");
//       }, 5000); // Record for 5 seconds
//     } catch (error) {
//       console.error("Voice recording error:", error);
//     }
//   };

//   const handleLogout = async () => {
//     const token = await AsyncStorage.getItem("token");
//     await axios.post(
//       "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//       {},
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("firstName");
//     navigation.replace("Auth");
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
   
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
  
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#f9fafb",
//     color: "#111827",
//     marginVertical: 10,
//   },
//   authButton: {
//     width: "100%",
//     padding: 12,
//     backgroundColor: "#3b82f6",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   authButtonDisabled: {
//     backgroundColor: "#6b7280",
//   },
//   authButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   authToggle: {
//     marginTop: 10,
//     color: "#3b82f6",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   chatScreen: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   darkTheme: {
//     backgroundColor: "#1f2937",
//   },
//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   welcomeMessage: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -100 }, { translateY: -10 }],
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   chatContent: {
//     flex: 1,
//     padding: 10,
//   },
//   chatItem: {
//     marginBottom: 15,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "60%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   aiMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     color: "#111827",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "70%",
//   },
//   darkAiMessage: {
//     backgroundColor: "#374151",
//     color: "#f3f4f6",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
// });

// export default App;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);
//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);
//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );
//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }
//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;
//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };
//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Backend Response:", response.data); // Debugging: Log backend response
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }
//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     const { status } = await Audio.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "Microphone access is required.");
//       return;
//     }
//     const recording = new Audio.Recording();
//     try {
//       await recording.prepareToRecordAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       await recording.startAsync();
//       setIsRecording(true);
//       setTimeout(async () => {
//         await recording.stopAndUnloadAsync();
//         setIsRecording(false);
//         const uri = recording.getURI();
//         Alert.alert("Recording", "Voice recorded. Speech-to-text not implemented.");
//       }, 5000); // Record for 5 seconds
//     } catch (error) {
//       console.error("Voice recording error:", error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token during logout:", token); // Debugging: Check token retrieval
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Auth" }],
//         });
//         return;
//       }

//       // Send logout request to the backend
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Logout response:", response.data); // Debugging: Log backend response
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");

//       // Reset navigation stack to Auth screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Auth" }],
//       });
//     } catch (error: any) {
//       console.error("Logout error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
    
//       <Stack.Navigator
//         initialRouteName="Splash"
//         screenOptions={{ headerShown: false }}
//       >
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
   
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#f9fafb",
//     color: "#111827",
//     marginVertical: 10,
//   },
//   authButton: {
//     width: "100%",
//     padding: 12,
//     backgroundColor: "#3b82f6",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   authButtonDisabled: {
//     backgroundColor: "#6b7280",
//   },
//   authButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   authToggle: {
//     marginTop: 10,
//     color: "#3b82f6",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   chatScreen: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   darkTheme: {
//     backgroundColor: "#1f2937",
//   },
//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   welcomeMessage: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -100 }, { translateY: -10 }],
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   chatContent: {
//     flex: 1,
//     padding: 10,
//   },
//   chatItem: {
//     marginBottom: 15,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "60%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   aiMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     color: "#111827",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "70%",
//   },
//   darkAiMessage: {
//     backgroundColor: "#374151",
//     color: "#f3f4f6",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
// });

// export default App;


//////////////////////////////////////////////////////////////////

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons
// import RNFetchBlob from "rn-fetch-blob";
// import * as FileSystem from "expo-file-system";

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);
//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);
//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );
//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }
//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;
//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };
//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Backend Response:", response.data); // Debugging: Log backend response
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }
//     setIsThinking(false);
//     setQuery("");
//   };


  

//   const handleVoiceInput = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "Microphone access is required.");
//         return;
//       }
  
//       const recording = new Audio.Recording();
//       try {
//         await recording.prepareToRecordAsync(
//           Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//         );
//         setIsRecording(true);
  
//         // Record for 5 seconds
//         setTimeout(async () => {
//           await recording.stopAndUnloadAsync();
//           setIsRecording(false);
  
//           // Get the recorded audio file URI
//           const uri = recording.getURI();
//           if (!uri) {
//             Alert.alert("Error", "Failed to record audio.");
//             return;
//           }
  
//           // Convert the audio file to base64 using expo-file-system
//           const base64Audio = await FileSystem.readAsStringAsync(uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
  
//           // Upload the audio file to AssemblyAI
//           const assemblyAiApiKey = "17ce099dc21f427fa7e895fd77609e57"; // Your AssemblyAI API key
//           const assemblyAiBaseUrl = "https://api.assemblyai.com/v1";
  
//           // Step 1: Upload the audio file to AssemblyAI
//           const uploadResponse = await axios.post(
//             `${assemblyAiBaseUrl}/upload`,
//             base64Audio,
//             {
//               headers: {
//                 Authorization: assemblyAiApiKey,
//                 "Content-Type": "application/octet-stream",
//               },
//             }
//           );
  
//           const audioUrl = uploadResponse.data.audio_url;
  
//           // Step 2: Transcribe the uploaded audio
//           const transcriptResponse = await axios.post(
//             `${assemblyAiBaseUrl}/transcript`,
//             {
//               audio_url: audioUrl,
//             },
//             {
//               headers: {
//                 Authorization: assemblyAiApiKey,
//               },
//             }
//           );
  
//           // Wait for transcription to complete
//           let transcriptText = "";
//           while (true) {
//             const statusResponse = await axios.get(
//               `${assemblyAiBaseUrl}/transcript/${transcriptResponse.data.id}`,
//               {
//                 headers: {
//                   Authorization: assemblyAiApiKey,
//                 },
//               }
//             );
  
//             if (statusResponse.data.status === "completed") {
//               transcriptText = statusResponse.data.text;
//               break;
//             }
  
//             // Wait for 1 second before checking again
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//           }
  
//           // Set the query from the transcribed text
//           setQuery(transcriptText);
//         }, 5000); // Record for 5 seconds
//       } catch (error) {
//         console.error("Voice recognition error:", error);
//         setIsRecording(false);
//       }
//     } catch (error) {
//       console.error("Voice recognition error:", error);
//       setIsRecording(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token during logout:", token); // Debugging: Check token retrieval
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Auth" }],
//         });
//         return;
//       }

//       // Send logout request to the backend
//       await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Logged out successfully"); // Debugging: Log success
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");

//       // Reset navigation stack to Auth screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Auth" }],
//       });
//     } catch (error: any) {
//       console.error("Logout error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
   
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
   
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#f9fafb",
//     color: "#111827",
//     marginVertical: 10,
//   },
//   authButton: {
//     width: "100%",
//     padding: 12,
//     backgroundColor: "#3b82f6",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   authButtonDisabled: {
//     backgroundColor: "#6b7280",
//   },
//   authButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   authToggle: {
//     marginTop: 10,
//     color: "#3b82f6",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   chatScreen: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   darkTheme: {
//     backgroundColor: "#1f2937",
//   },
//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   welcomeMessage: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -100 }, { translateY: -10 }],
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   chatContent: {
//     flex: 1,
//     padding: 10,
//   },
//   chatItem: {
//     marginBottom: 15,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "60%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   aiMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     color: "#111827",
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: "70%",
//   },
//   darkAiMessage: {
//     backgroundColor: "#374151",
//     color: "#f3f4f6",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
// });

// export default App;


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import * as FileSystem from "expo-file-system"; // Use expo-file-system for file operations
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);
//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);
//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );
//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }
//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;
//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };
//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Backend Response:", response.data); // Debugging: Log backend response
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }
//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "Microphone access is required.");
//         return;
//       }

//       const recording = new Audio.Recording();
//       try {
//         await recording.prepareToRecordAsync(
//           Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//         );
//         await recording.startAsync();
//         setIsRecording(true);

//         // Record for 5 seconds
//         setTimeout(async () => {
//           try {
//             await recording.stopAndUnloadAsync();
//             setIsRecording(false);

//             // Get the recorded audio file URI
//             const uri = recording.getURI();
//             if (!uri) {
//               Alert.alert("Error", "Failed to record audio.");
//               return;
//             }

//             // Convert the audio file to base64 using expo-file-system
//             const base64Audio = await FileSystem.readAsStringAsync(uri, {
//               encoding: FileSystem.EncodingType.Base64,
//             });

//             // Upload the audio file to AssemblyAI
//             const assemblyAiApiKey = "17ce099dc21f427fa7e895fd77609e57"; // Your AssemblyAI API key
//             const assemblyAiBaseUrl = "https://api.assemblyai.com/v1";

//             // Step 1: Upload the audio file to AssemblyAI
//             const uploadResponse = await axios.post(
//               `${assemblyAiBaseUrl}/upload`,
//               base64Audio,
//               {
//                 headers: {
//                   Authorization: assemblyAiApiKey,
//                   "Content-Type": "application/octet-stream",
//                 },
//               }
//             );

//             const audioUrl = uploadResponse.data.audio_url;

//             // Step 2: Transcribe the uploaded audio
//             const transcriptResponse = await axios.post(
//               `${assemblyAiBaseUrl}/transcript`,
//               {
//                 audio_url: audioUrl,
//               },
//               {
//                 headers: {
//                   Authorization: assemblyAiApiKey,
//                 },
//               }
//             );

//             // Wait for transcription to complete
//             let transcriptText = "";
//             while (true) {
//               const statusResponse = await axios.get(
//                 `${assemblyAiBaseUrl}/transcript/${transcriptResponse.data.id}`,
//                 {
//                   headers: {
//                     Authorization: assemblyAiApiKey,
//                   },
//                 }
//               );

//               if (statusResponse.data.status === "completed") {
//                 transcriptText = statusResponse.data.text;
//                 break;
//               }

//               // Wait for 1 second before checking again
//               await new Promise((resolve) => setTimeout(resolve, 1000));
//             }

//             // Set the query from the transcribed text
//             setQuery(transcriptText);
//           } catch (error) {
//             console.error("Error processing audio:", error);
//             setIsRecording(false);
//           }
//         }, 5000); // Record for 5 seconds
//       } catch (error) {
//         console.error("Error starting recording:", error);
//         setIsRecording(false);
//       }
//     } catch (error) {
//       console.error("Voice recognition error:", error);
//       setIsRecording(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token during logout:", token); // Debugging: Check token retrieval
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Auth" }],
//         });
//         return;
//       }

//       // Send logout request to the backend
//       await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Logged out successfully"); // Debugging: Log success
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");

//       // Reset navigation stack to Auth screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Auth" }],
//       });
//     } catch (error: any) {
//       console.error("Logout error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
    
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
   
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//         width: "100%",
//         padding: 12,
//         borderWidth: 1,
//         borderColor: "#d1d5db",
//         borderRadius: 8,
//         backgroundColor: "#f9fafb",
//         color: "#111827",
//         marginVertical: 10,
//       },
//       authButton: {
//         width: "100%",
//         padding: 12,
//         backgroundColor: "#3b82f6",
//         borderRadius: 8,
//         alignItems: "center",
//       },
//       authButtonDisabled: {
//         backgroundColor: "#6b7280",
//       },
//       authButtonText: {
//         color: "#ffffff",
//         fontSize: 16,
//         fontWeight: "600",
//       },
//       authToggle: {
//         marginTop: 10,
//         color: "#3b82f6",
//         textAlign: "center",
//       },
//       errorText: {
//         color: "red",
//         textAlign: "center",
//         marginBottom: 10,
//       },
//       chatScreen: {
//         flex: 1,
//         backgroundColor: "#f9fafb",
//       },
//       darkTheme: {
//         backgroundColor: "#1f2937",
//       },
//       chatHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: "#e5e7eb",
//         backgroundColor: "#ffffff",
//       },
//       chatTitle: {
//         fontSize: 20,
//         fontWeight: "600",
//         color: "#111827",
//       },
//       welcomeMessage: {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: [{ translateX: -100 }, { translateY: -10 }],
//         fontSize: 20,
//         fontWeight: "500",
//         color: "#6b7280",
//       },
//       chatContent: {
//         flex: 1,
//         padding: 10,
//       },
//       chatItem: {
//         marginBottom: 15,
//       },
//       userMessage: {
//         alignSelf: "flex-end",
//         backgroundColor: "#3b82f6",
//         color: "#ffffff",
//         padding: 10,
//         borderRadius: 12,
//         maxWidth: "60%",
//       },
//       darkUserMessage: {
//         backgroundColor: "#3b82f6",
//       },
//       aiMessage: {
//         alignSelf: "flex-start",
//         backgroundColor: "#f3f4f6",
//         color: "#111827",
//         padding: 10,
//         borderRadius: 12,
//         maxWidth: "70%",
//       },
//       darkAiMessage: {
//         backgroundColor: "#374151",
//         color: "#f3f4f6",
//       },
//       thinking: {
//         fontStyle: "italic",
//         color: "#6b7280",
//         textAlign: "center",
//       },
//       chatInputBar: {
//         flexDirection: "row",
//         alignItems: "center",
//         padding: 10,
//         backgroundColor: "#f9fafb",
//         borderTopWidth: 1,
//         borderTopColor: "#e5e7eb",
//       },
//       darkInputBar: {
//         backgroundColor: "#374151",
//         borderTopColor: "#4b5563",
//       },
//       chatInput: {
//         flex: 1,
//         padding: 10,
//         borderWidth: 1,
//         borderColor: "#d1d5db",
//         borderRadius: 8,
//         backgroundColor: "#ffffff",
//         color: "#111827",
//         maxHeight: 100,
//       },
//       darkInput: {
//         backgroundColor: "#4b5563",
//         borderColor: "#6b7280",
//         color: "#f3f4f6",
//       },
//       darkText: {
//         color: "#f3f4f6",
//       },
//     });
    
//     export default App;
    

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import * as FileSystem from "expo-file-system"; // Use expo-file-system for file operations
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);
//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);
//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );
//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }
//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;
//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };
//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Backend Response:", response.data); // Debugging: Log backend response
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }
//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleVoiceInput = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "Microphone access is required.");
//         return;
//       }

//       const recording = new Audio.Recording();
//       try {
//         await recording.prepareToRecordAsync(
//           Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//         );
//         await recording.startAsync();
//         setIsRecording(true);

//         // Record for 5 seconds
//         setTimeout(async () => {
//           try {
//             await recording.stopAndUnloadAsync();
//             setIsRecording(false);

//             // Get the recorded audio file URI
//             const uri = recording.getURI();
//             if (!uri) {
//               Alert.alert("Error", "Failed to record audio.");
//               return;
//             }
//             console.log("Recorded Audio URI:", uri);

//             // Convert the audio file to base64 using expo-file-system
//             const base64Audio = await FileSystem.readAsStringAsync(uri, {
//               encoding: FileSystem.EncodingType.Base64,
//             });
//             console.log("Audio Base64 Length:", base64Audio.length);

//             // Upload the audio file to AssemblyAI
//             const assemblyAiApiKey = "17ce099dc21f427fa7e895fd77609e57"; // Your AssemblyAI API key
//             const assemblyAiBaseUrl = "https://api.assemblyai.com/v1";

//             // Step 1: Upload the audio file to AssemblyAI
//             console.log("Uploading audio to AssemblyAI...");
//             const uploadResponse = await axios.post(
//               `${assemblyAiBaseUrl}/upload`,
//               base64Audio,
//               {
//                 headers: {
//                   Authorization: assemblyAiApiKey,
//                   "Content-Type": "application/octet-stream",
//                 },
//               }
//             );
//             console.log("Upload Response:", uploadResponse.data);

//             const audioUrl = uploadResponse.data.audio_url;

//             // Step 2: Transcribe the uploaded audio
//             console.log("Transcribing audio...");
//             const transcriptResponse = await axios.post(
//               `${assemblyAiBaseUrl}/transcript`,
//               {
//                 audio_url: audioUrl,
//               },
//               {
//                 headers: {
//                   Authorization: assemblyAiApiKey,
//                 },
//               }
//             );
//             console.log("Transcription Response:", transcriptResponse.data);

//             // Wait for transcription to complete
//             let transcriptText = "";
//             while (true) {
//               const statusResponse = await axios.get(
//                 `${assemblyAiBaseUrl}/transcript/${transcriptResponse.data.id}`,
//                 {
//                   headers: {
//                     Authorization: assemblyAiApiKey,
//                   },
//                 }
//               );

//               if (statusResponse.data.status === "completed") {
//                 transcriptText = statusResponse.data.text;
//                 break;
//               }

//               // Wait for 1 second before checking again
//               await new Promise((resolve) => setTimeout(resolve, 1000));
//             }

//             // Set the query from the transcribed text
//             setQuery(transcriptText);
//           } catch (error) {
//             console.error("Error processing audio:", error.response?.data || error.message);
//             Alert.alert("Error", "Failed to process audio. Please try again.");
//           }
//         }, 5000); // Record for 5 seconds
//       } catch (error) {
//         console.error("Error starting recording:", error);
//         setIsRecording(false);
//       }
//     } catch (error) {
//       console.error("Voice recognition error:", error);
//       setIsRecording(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token during logout:", token); // Debugging: Check token retrieval
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Auth" }],
//         });
//         return;
//       }

//       // Send logout request to the backend
//       await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Logged out successfully"); // Debugging: Log success
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");

//       // Reset navigation stack to Auth screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Auth" }],
//       });
//     } catch (error: any) {
//       console.error("Logout error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//             <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleVoiceInput}>
//           <Icon
//             name="microphone"
//             size={24}
//             color={
//               isRecording
//                 ? "#ef4444"
//                 : theme === "light"
//                 ? "#6b7280"
//                 : "#9ca3af"
//             }
//           />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
    
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
   
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 450,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 40,
//   },
//   authTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   authInput: {
//         width: "100%",
//         padding: 12,
//         borderWidth: 1,
//         borderColor: "#d1d5db",
//         borderRadius: 8,
//         backgroundColor: "#f9fafb",
//         color: "#111827",
//         marginVertical: 10,
//       },
//       authButton: {
//         width: "100%",
//         padding: 12,
//         backgroundColor: "#3b82f6",
//         borderRadius: 8,
//         alignItems: "center",
//       },
//       authButtonDisabled: {
//         backgroundColor: "#6b7280",
//       },
//       authButtonText: {
//         color: "#ffffff",
//         fontSize: 16,
//         fontWeight: "600",
//       },
//       authToggle: {
//         marginTop: 10,
//         color: "#3b82f6",
//         textAlign: "center",
//       },
//       errorText: {
//         color: "red",
//         textAlign: "center",
//         marginBottom: 10,
//       },
//       chatScreen: {
//         flex: 1,
//         backgroundColor: "#f9fafb",
//       },
//       darkTheme: {
//         backgroundColor: "#1f2937",
//       },
//       chatHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: "#e5e7eb",
//         backgroundColor: "#ffffff",
//       },
//       chatTitle: {
//         fontSize: 20,
//         fontWeight: "600",
//         color: "#111827",
//       },
//       welcomeMessage: {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: [{ translateX: -100 }, { translateY: -10 }],
//         fontSize: 20,
//         fontWeight: "500",
//         color: "#6b7280",
//       },
//       chatContent: {
//         flex: 1,
//         padding: 10,
//       },
//       chatItem: {
//         marginBottom: 15,
//       },
//       userMessage: {
//         alignSelf: "flex-end",
//         backgroundColor: "#3b82f6",
//         color: "#ffffff",
//         padding: 10,
//         borderRadius: 12,
//         maxWidth: "60%",
//       },
//       darkUserMessage: {
//         backgroundColor: "#3b82f6",
//       },
//       aiMessage: {
//         alignSelf: "flex-start",
//         backgroundColor: "#f3f4f6",
//         color: "#111827",
//         padding: 10,
//         borderRadius: 12,
//         maxWidth: "70%",
//       },
//       darkAiMessage: {
//         backgroundColor: "#374151",
//         color: "#f3f4f6",
//       },
//       thinking: {
//         fontStyle: "italic",
//         color: "#6b7280",
//         textAlign: "center",
//       },
//       chatInputBar: {
//         flexDirection: "row",
//         alignItems: "center",
//         padding: 10,
//         backgroundColor: "#f9fafb",
//         borderTopWidth: 1,
//         borderTopColor: "#e5e7eb",
//       },
//       darkInputBar: {
//         backgroundColor: "#374151",
//         borderTopColor: "#4b5563",
//       },
//       chatInput: {
//         flex: 1,
//         padding: 10,
//         borderWidth: 1,
//         borderColor: "#d1d5db",
//         borderRadius: 8,
//         backgroundColor: "#ffffff",
//         color: "#111827",
//         maxHeight: 100,
//       },
//       darkInput: {
//         backgroundColor: "#4b5563",
//         borderColor: "#6b7280",
//         color: "#f3f4f6",
//       },
//       darkText: {
//         color: "#f3f4f6",
//       },
//     });
    
//     export default App;

////////////////////////////////////////////////////////
// without voice perfect ready

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage explicitly
// import Icon from "react-native-vector-icons/FontAwesome"; // Install: npm install react-native-vector-icons

// const Stack = createStackNavigator();

// // Interface for FormData
// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
// }

// // Interface for DisplayedMessage
// interface DisplayedMessage {
//   question: string;
//   answer: string | null;
//   error: boolean;
//   canRetry: boolean;
//   timestamp: string;
// }

// // Splash Screen Component
// const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [showSlogan, setShowSlogan] = useState(false);
//   useEffect(() => {
//     const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
//     const navTimer = setTimeout(() => navigation.replace("Auth"), 3000);
//     return () => {
//       clearTimeout(sloganTimer);
//       clearTimeout(navTimer);
//     };
//   }, [navigation]);
//   return (
//     <View style={styles.splashScreen}>
//       <View style={styles.splashContent}>
//         <Text style={styles.splashTitle}>HUBA AI</Text>
//         {showSlogan && (
//           <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Auth Screen Component
// const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (name: keyof FormData, value: string) => {
//     setFormData({ ...formData, [name]: value });
//     setError("");
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     const dataToSend = {
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//     };
//     const url = isSignup
//       ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
//       : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
//     try {
//       const response = await axios.post(
//         url,
//         isSignup ? dataToSend : { email: formData.email, password: formData.password }
//       );
//       if (isSignup && response.status === 200) {
//         setSignupSuccess(true);
//         setError("Signup successful! Please log in.");
//         return;
//       }
//       if (!isSignup && (response.status === 200 || response.status === 201)) {
//         const token = response.data.token;
//         const loginFirstName =
//           response.data.user.fullName.split(" ")[0] || "User";
//         await AsyncStorage.setItem("token", token);
//         await AsyncStorage.setItem("firstName", loginFirstName);
//         navigation.replace("Chat", { firstName: loginFirstName });
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error || error.message || "An unknown error occurred";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.authScreen}>
//       <View style={styles.authCard}>
//         <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
//         {error ? (
//           <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
//             {error}
//           </Text>
//         ) : null}
//         {isSignup && (
//           <TextInput
//             style={styles.authInput}
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChangeText={(text) => handleChange("fullName", text)}
//           />
//         )}
//         <TextInput
//           style={styles.authInput}
//           placeholder="Email"
//           value={formData.email}
//           onChangeText={(text) => handleChange("email", text)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.authInput}
//           placeholder="Password"
//           value={formData.password}
//           onChangeText={(text) => handleChange("password", text)}
//           secureTextEntry
//         />
//         <TouchableOpacity
//           style={[styles.authButton, isLoading && styles.authButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.authButtonText}>
//               {isSignup ? "Sign Up" : "Login"}
//             </Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => {
//             setIsSignup(!isSignup);
//             setSignupSuccess(false);
//             setError("");
//           }}
//         >
//           <Text style={styles.authToggle}>
//             {isSignup
//               ? "Already have an account? Login"
//               : "Need an account? Sign Up"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// // Chat Screen Component
// const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
//   route,
//   navigation,
// }) => {
//   const { firstName } = route.params;
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>(
//     []
//   );
//   const [isThinking, setIsThinking] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//       setDisplayedMessages([]);
//     }, 3000);
//     return () => clearTimeout(welcomeTimer);
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   const handleSubmit = async () => {
//     if (!query.trim()) return;
//     const timestamp = new Date().toISOString();
//     const newMessage: DisplayedMessage = {
//       question: query,
//       answer: null,
//       error: false,
//       canRetry: false,
//       timestamp,
//     };
//     setDisplayedMessages((prev) => [...prev, newMessage]);
//     setIsThinking(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token:", token); // Debugging: Check token retrieval
//       const response = await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
//         { question: query },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Backend Response:", response.data); // Debugging: Log backend response
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
//       console.error("API Error:", error.response?.data || error.message); // Debugging: Log errors
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: "Sorry, something went wrong.",
//           error: true,
//           canRetry: true,
//         };
//         return updated;
//       });
//     }
//     setIsThinking(false);
//     setQuery("");
//   };

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       console.log("Token during logout:", token); // Debugging: Check token retrieval
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Auth" }],
//         });
//         return;
//       }

//       // Send logout request to the backend
//       await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Logged out successfully"); // Debugging: Log success
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");

//       // Reset navigation stack to Auth screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Auth" }],
//       });
//     } catch (error: any) {
//       console.error("Logout error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <Icon
//             name={theme === "light" ? "moon-o" : "sun-o"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.chatTitle, theme === "dark" && styles.darkText]}>
//           HUBA AI
//         </Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Icon
//             name="sign-out"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//       {showWelcome && (
//         <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//           Welcome {firstName} to HUBA AI
//         </Text>
//       )}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => (
//           <View key={index} style={styles.chatItem}>
//             <Text
//               style={[
//                 styles.userMessage,
//                 theme === "dark" && styles.darkUserMessage,
//               ]}
//             >
//               {msg.question}
//             </Text>
//             {msg.answer && (
//               <Text
//                 style={[
//                   styles.aiMessage,
//                   theme === "dark" && styles.darkAiMessage,
//                 ]}
//               >
//                 {msg.answer}
//               </Text>
//             )}
//           </View>
//         ))}
//         {isThinking && (
//           <Text style={[styles.thinking, theme === "dark" && styles.darkText]}>
//             Thinking...
//           </Text>
//         )}
//       </ScrollView>
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//         />
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <Icon
//             name="paper-plane"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // Main App Component
// const App: React.FC = () => {
//   return (
    
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Auth" component={AuthScreen} />
//         <Stack.Screen name="Chat" component={ChatScreen} />
//       </Stack.Navigator>
  
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   splashScreen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3b82f6",
//   },
//   splashContent: {
//     alignItems: "center",
//   },
//   splashTitle: {
//     fontSize: 48,
//     fontWeight: "900",
//     color: "#ffffff",
//   },
//   splashSlogan: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ffffff",
//     marginTop: 10,
//   },
//   authScreen: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//   },
//   authCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//         borderRadius: 16,
//         padding: 20,
//         width: "90%",
//         maxWidth: 450,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.15,
//         shadowRadius: 40,
//       },
//       authTitle: {
//         fontSize: 24,
//         fontWeight: "700",
//         color: "#111827",
//         textAlign: "center",
//         marginBottom: 20,
//       },
//       authInput: {
//             width: "100%",
//             padding: 12,
//             borderWidth: 1,
//             borderColor: "#d1d5db",
//             borderRadius: 8,
//             backgroundColor: "#f9fafb",
//             color: "#111827",
//             marginVertical: 10,
//           },
//           authButton: {
//             width: "100%",
//             padding: 12,
//             backgroundColor: "#3b82f6",
//             borderRadius: 8,
//             alignItems: "center",
//           },
//           authButtonDisabled: {
//             backgroundColor: "#6b7280",
//           },
//           authButtonText: {
//             color: "#ffffff",
//             fontSize: 16,
//             fontWeight: "600",
//           },
//           authToggle: {
//             marginTop: 10,
//             color: "#3b82f6",
//             textAlign: "center",
//           },
//           errorText: {
//             color: "red",
//             textAlign: "center",
//             marginBottom: 10,
//           },
//           chatScreen: {
//             flex: 1,
//             backgroundColor: "#f9fafb",
//           },
//           darkTheme: {
//             backgroundColor: "#1f2937",
//           },
//           chatHeader: {
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             padding: 10,
//             borderBottomWidth: 1,
//             borderBottomColor: "#e5e7eb",
//             backgroundColor: "#ffffff",
//           },
//           chatTitle: {
//             fontSize: 20,
//             fontWeight: "600",
//             color: "#111827",
//           },
//           welcomeMessage: {
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: [{ translateX: -100 }, { translateY: -10 }],
//             fontSize: 20,
//             fontWeight: "500",
//             color: "#6b7280",
//           },
//           chatContent: {
//             flex: 1,
//             padding: 10,
//           },
//           chatItem: {
//             marginBottom: 15,
//           },
//           userMessage: {
//             alignSelf: "flex-end",
//             backgroundColor: "#3b82f6",
//             color: "#ffffff",
//             padding: 10,
//             borderRadius: 12,
//             maxWidth: "60%",
//           },
//           darkUserMessage: {
//             backgroundColor: "#3b82f6",
//           },
//           aiMessage: {
//             alignSelf: "flex-start",
//             backgroundColor: "#f3f4f6",
//             color: "#111827",
//             padding: 10,
//             borderRadius: 12,
//             maxWidth: "70%",
//           },
//           darkAiMessage: {
//             backgroundColor: "#374151",
//             color: "#f3f4f6",
//           },
//           thinking: {
//             fontStyle: "italic",
//             color: "#6b7280",
//             textAlign: "center",
//           },
//           chatInputBar: {
//             flexDirection: "row",
//             alignItems: "center",
//             padding: 10,
//             backgroundColor: "#f9fafb",
//             borderTopWidth: 1,
//             borderTopColor: "#e5e7eb",
//           },
//           darkInputBar: {
//             backgroundColor: "#374151",
//             borderTopColor: "#4b5563",
//           },
//           chatInput: {
//             flex: 1,
//             padding: 10,
//             borderWidth: 1,
//             borderColor: "#d1d5db",
//             borderRadius: 8,
//             backgroundColor: "#ffffff",
//             color: "#111827",
//             maxHeight: 100,
//           },
//           darkInput: {
//             backgroundColor: "#4b5563",
//             borderColor: "#6b7280",
//             color: "#f3f4f6",
//           },
//           darkText: {
//             color: "#f3f4f6",
//           },
//         });
        
//         export default App;
    

///////////////////////////////////////////////////////////////////////////

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="chat" />
      </Stack>
    </>
  );
}
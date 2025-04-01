

//////////////////////////////////////////////////////////////

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView as RNScrollView,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { MaterialIcons } from "@expo/vector-icons";
// import { StatusBar } from "react-native";
// import * as Clipboard from "expo-clipboard";

// export default function ChatScreen() {
//   const { firstName } = useLocalSearchParams();
//   const router = useRouter();
//   const [query, setQuery] = useState("");
//   const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
//   const [isThinking, setIsThinking] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const scrollViewRef = useRef<RNScrollView | null>(null);
//   const inputRef = useRef<TextInput | null>(null); // Add ref for TextInput

//   useEffect(() => {
//     const welcomeTimer = setTimeout(() => {
//       setShowWelcome(false);
//     }, 3000);

//     return () => {
//       clearTimeout(welcomeTimer);
//     };
//   }, []);

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [displayedMessages, isThinking]);

//   // Function to check if the query is about time or date
//   const isTimeOrDateQuery = (query: string) => {
//     const lowerQuery = query.toLowerCase();
//     return (
//       lowerQuery.includes("time") ||
//       lowerQuery.includes("date") ||
//       lowerQuery.includes("day")
//     );
//   };

//   // Function to generate time, date, and day on the frontend
//   const generateTimeDateResponse = (query: string) => {
//     const now = new Date();
//     const time = now.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     });
//     const date = now.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//     const day = now.toLocaleDateString("en-US", { weekday: "long" });

//     const lowerQuery = query.toLowerCase();
//     if (lowerQuery.includes("time")) {
//       return `The current time is ${time}, on ${day}, ${date}.`;
//     } else {
//       // For date or day queries
//       return `Today is ${date}, a ${day}. The current time is ${time}.`;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!query.trim()) return;

//     // Hide the welcome message immediately when the user submits a question
//     setShowWelcome(false);

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

//     // Check if the query is about time or date
//     if (isTimeOrDateQuery(query)) {
//       const response = generateTimeDateResponse(query);
//       setDisplayedMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = {
//           ...updated[updated.length - 1],
//           answer: response,
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//       setIsThinking(false);
//       setQuery("");
//       return;
//     }

//     // For non-time/date queries, proceed with backend request
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
//           answer: response.data.response || "No response received.",
//           error: false,
//           canRetry: false,
//         };
//         return updated;
//       });
//     } catch (error: any) {
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
//       if (!token) {
//         Alert.alert("Error", "No token found. Please log in again.");
//         router.replace("/auth");
//         return;
//       }
//       await axios.post(
//         "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("firstName");
//       router.replace("/auth");
//     } catch (error: any) {
//       Alert.alert("Error", "Failed to log out. Please try again.");
//     }
//   };

//   const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

//   const handleCopyCode = async (code: string) => {
//     await Clipboard.setStringAsync(code);
//     Alert.alert("Copied", "Code has been copied to your clipboard!");
//   };

//   // Function to parse text and render bold text for <strong> tags
//   const renderTextWithBold = (text: string, theme: "light" | "dark") => {
//     const parts = text.split(/<strong>(.*?)<\/strong>/g);
//     return parts.map((part, index) => {
//       if (index % 2 === 1) {
//         return (
//           <Text
//             key={index}
//             style={[
//               styles.aiMessage,
//               theme === "dark" && styles.darkAiMessage,
//               { fontWeight: "bold" },
//             ]}
//           >
//             {part}
//           </Text>
//         );
//       }
//       return (
//         <Text
//           key={index}
//           style={[styles.aiMessage, theme === "dark" && styles.darkAiMessage]}
//         >
//           {part}
//         </Text>
//       );
//     });
//   };

//   // Function to check if the response is a temperature response and extract data
//   const parseTemperatureResponse = (answer: string) => {
//     // Try a more flexible regex to match various temperature response formats
//     // Example patterns:
//     // "Temperature in New York: 22°C, Clear sky"
//     // "The current temperature in New York is 22°C with clear skies"
//     // "New York temperature: 22°C, Clear"
//     const tempRegex = /(?:temperature in |temperature: |temperature is )?(.*?)(?:[:is ]+)(\d+\.\d+°[CF])(?:[ ,]+(?:with )?(.*))/i;
//     const match = answer.match(tempRegex);

//     if (match) {
//       return {
//         place: match[1].trim(), // e.g., "New York"
//         temperature: match[2].trim(), // e.g., "22°C"
//         sky: match[3] ? match[3].trim() : "Not available", // e.g., "Clear sky" or fallback
//       };
//     }

//     // Fallback: Check for keywords and degree symbol
//     if (
//       answer.toLowerCase().includes("temperature") &&
//       answer.includes("°") &&
//       answer.toLowerCase().includes("in")
//     ) {
//       // Extract place (between "in" and the temperature value)
//       const placeMatch = answer.match(/in (.*?)(?=\d+\.\d+°)/i);
//       const tempMatch = answer.match(/(\d+\.\d+°[CF])/);
//       const skyMatch = answer.match(/\d+\.\d+°[CF][ ,]+(.*)/);

//       return {
//         place: placeMatch ? placeMatch[1].trim() : "Unknown",
//         temperature: tempMatch ? tempMatch[1].trim() : "Unknown",
//         sky: skyMatch ? skyMatch[1].trim() : "Not available",
//       };
//     }

//     return null;
//   };

//   return (
//     <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
//       {/* Header */}
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={toggleTheme}>
//           <MaterialIcons
//             name={theme === "light" ? "dark-mode" : "light-mode"}
//             size={24}
//             color={theme === "light" ? "#111827" : "#facc15"}
//           />
//         </TouchableOpacity>
//         <Text style={styles.chatTitle}>HUBA AI</Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <MaterialIcons name="logout" size={24} color="#ffffff" />
//         </TouchableOpacity>
//       </View>

//       {/* Chat Content */}
//       <RNScrollView
//         ref={scrollViewRef}
//         style={styles.chatContent}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {displayedMessages.map((msg, index) => {
//           const codeBlockRegex = /```([\s\S]*?)```/g;
//           const codeBlocks = msg.answer?.match(codeBlockRegex) || [];
//           const textParts = msg.answer
//             ? msg.answer.split(codeBlockRegex).filter((part, i) => i % 2 === 0)
//             : [];

//           // Check if the response is a temperature response
//           const tempData = msg.answer ? parseTemperatureResponse(msg.answer) : null;

//           // Create parts array for rendering
//           const parts = [];
//           let codeIndex = 0;
//           let textIndex = 0;

//           if (tempData) {
//             // If it's a temperature response, add it as a special part
//             parts.push({ type: "temperature", content: tempData });
//           } else {
//             // Otherwise, interleave text and code parts
//             let currentPos = 0;
//             while (currentPos < msg.answer?.length) {
//               const nextCodeBlockMatch = codeBlockRegex.exec(msg.answer);
//               if (nextCodeBlockMatch) {
//                 const codeStart = nextCodeBlockMatch.index;
//                 const codeEnd = codeBlockRegex.lastIndex;

//                 if (currentPos < codeStart && textIndex < textParts.length) {
//                   const text = textParts[textIndex].trim();
//                   if (text) {
//                     parts.push({ type: "text", content: text });
//                   }
//                   textIndex++;
//                 }

//                 if (codeIndex < codeBlocks.length) {
//                   parts.push({ type: "code", content: codeBlocks[codeIndex] });
//                   codeIndex++;
//                 }

//                 currentPos = codeEnd;
//               } else {
//                 if (textIndex < textParts.length) {
//                   const text = textParts[textIndex].trim();
//                   if (text) {
//                     parts.push({ type: "text", content: text });
//                   }
//                   textIndex++;
//                 }
//                 break;
//               }
//             }
//           }

//           return (
//             <View key={index} style={styles.chatItem}>
//               {/* User's Question */}
//               <Text
//                 style={[
//                   styles.userMessage,
//                   theme === "dark" && styles.darkUserMessage,
//                 ]}
//               >
//                 {msg.question}
//               </Text>
//               {/* Thinking Feature */}
//               {isThinking && index === displayedMessages.length - 1 && (
//                 <Text
//                   style={[
//                     styles.thinking,
//                     theme === "dark" && styles.darkText,
//                     styles.thinkingGap,
//                   ]}
//                 >
//                   Thinking...
//                 </Text>
//               )}
//               {/* AI's Response */}
//               {msg.answer && (
//                 <View
//                   style={[
//                     styles.responseContainer,
//                     theme === "dark" && styles.darkResponseContainer,
//                   ]}
//                 >
//                   {parts.map((part, partIndex) => {
//                     if (part.type === "text" && part.content) {
//                       return (
//                         <View key={partIndex}>
//                           {renderTextWithBold(part.content, theme)}
//                         </View>
//                       );
//                     } else if (part.type === "code") {
//                       const code = part.content.replace(/```/g, "").trim();
//                       return (
//                         <View key={partIndex} style={styles.codeWrapper}>
//                           <Text
//                             style={[
//                               styles.codeDescription,
//                               theme === "dark" && styles.darkText,
//                             ]}
//                           >
//                             Here is your code, {firstName}
//                           </Text>
//                           <View
//                             style={[
//                               styles.codeContainer,
//                               theme === "dark" && styles.darkCodeContainer,
//                             ]}
//                           >
//                             <RNScrollView horizontal showsHorizontalScrollIndicator>
//                               <Text
//                                 style={[
//                                   styles.codeText,
//                                   theme === "dark" && styles.darkCodeText,
//                                 ]}
//                               >
//                                 {code}
//                               </Text>
//                             </RNScrollView>
//                             <TouchableOpacity
//                               style={styles.copyButton}
//                               onPress={() => handleCopyCode(code)}
//                             >
//                               <MaterialIcons
//                                 name="content-copy"
//                                 size={18}
//                                 color={theme === "light" ? "#6b7280" : "#9ca3af"}
//                               />
//                             </TouchableOpacity>
//                           </View>
//                         </View>
//                       );
//                     } else if (part.type === "temperature") {
//                       const { place, temperature, sky } = part.content;
//                       return (
//                         <View
//                           key={partIndex}
//                           style={[
//                             styles.temperatureContainer,
//                             theme === "dark" && styles.darkTemperatureContainer,
//                           ]}
//                         >
//                           <Text
//                             style={[
//                               styles.temperaturePlace,
//                               theme === "dark" && styles.darkTemperatureText,
//                             ]}
//                           >
//                             {place}
//                           </Text>
//                           <Text
//                             style={[
//                               styles.temperatureValue,
//                               theme === "dark" && styles.darkTemperatureText,
//                             ]}
//                           >
//                             {temperature}
//                           </Text>
//                           <Text
//                             style={[
//                               styles.temperatureText,
//                               theme === "dark" && styles.darkTemperatureText,
//                             ]}
//                           >
//                             {sky}
//                           </Text>
//                         </View>
//                       );
//                     }
//                     return null;
//                   })}
//                 </View>
//               )}
//             </View>
//           );
//         })}
//       </RNScrollView>

//       {/* Welcome Message */}
//       {showWelcome && (
//         <View style={styles.welcomeContainer}>
//           <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
//             Welcome {firstName}
//           </Text>
//         </View>
//       )}

//       {/* Input Bar */}
//       <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
//         <TextInput
//           ref={inputRef}
//           style={[styles.chatInput, theme === "dark" && styles.darkInput]}
//           placeholder="Ask anything..."
//           value={query}
//           onChangeText={setQuery}
//           multiline
//           editable={true} // Explicitly ensure the TextInput is editable
//         />
//         <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
//           <MaterialIcons
//             name="send"
//             size={24}
//             color={theme === "light" ? "#6b7280" : "#9ca3af"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
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
//     paddingTop: StatusBar.currentHeight || 20,
//     paddingBottom: 15,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#3b82f6",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#ffffff",
//   },
//   welcomeContainer: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1,
//     pointerEvents: "none", 
//   },
//   welcomeMessage: {
//     textAlign: "center",
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   darkText: {
//     color: "#f3f4f6",
//   },
//   chatContent: {
//     flex: 1,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   chatItem: {
//     marginBottom: 20,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: "75%",
//   },
//   darkUserMessage: {
//     backgroundColor: "#3b82f6",
//   },
//   responseContainer: {
//     alignSelf: "flex-start",
//     backgroundColor: "#f3f4f6",
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: "75%",
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   darkResponseContainer: {
//     backgroundColor: "#374151",
//   },
//   aiMessage: {
//     color: "#111827",
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   darkAiMessage: {
//     color: "#f3f4f6",
//   },
//   thinking: {
//     fontStyle: "italic",
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   thinkingGap: {
//     marginTop: 10,
//   },
//   chatInputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "#f9fafb",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//     zIndex: 2, // Ensure the input bar is above the welcome message
//   },
//   darkInputBar: {
//     backgroundColor: "#374151",
//     borderTopColor: "#4b5563",
//   },
//   chatInput: {
//     flex: 1,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//     maxHeight: 100,
//     marginHorizontal: 10,
//   },
//   darkInput: {
//     backgroundColor: "#4b5563",
//     borderColor: "#6b7280",
//     color: "#f3f4f6",
//   },
//   codeWrapper: {
//     marginTop: 10,
//   },
//   codeDescription: {
//     fontSize: 14,
//     fontWeight: "500",
//     marginBottom: 5,
//     color: "#111827",
//   },
//   codeContainer: {
//     alignSelf: "flex-start",
//     backgroundColor: "#e5e7eb",
//     padding: 12,
//     borderRadius: 8,
//     maxWidth: "100%",
//     position: "relative",
//     flexDirection: "row",
//   },
//   darkCodeContainer: {
//     backgroundColor: "#4b5563",
//   },
//   codeText: {
//     fontFamily: "monospace",
//     fontSize: 14,
//     color: "#111827",
//     flexWrap: "wrap",
//   },
//   darkCodeText: {
//     color: "#f3f4f6",
//   },
//   copyButton: {
//     position: "absolute",
//     top: 5,
//     right: 5,
//     padding: 5,
//   },
//   // Styles for the temperature container
//   temperatureContainer: {
//     alignSelf: "center",
//     backgroundColor: "#e0f7fa", // Light cyan background for light mode
//     padding: 15,
//     borderRadius: 10,
//     width: 200, // Square shape
//     height: 200, // Square shape
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 10,
//     borderWidth: 1, // Add a border to make it more visible
//     borderColor: "#0288d1",
//   },
//   darkTemperatureContainer: {
//     backgroundColor: "#4b636e", // Darker cyan for dark mode
//     borderColor: "#81d4fa",
//   },
//   temperaturePlace: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   temperatureText: {
//     fontSize: 16,
//     color: "#111827",
//     textAlign: "center",
//     marginTop: 10,
//   },
//   darkTemperatureText: {
//     color: "#f3f4f6",
//   },
//   temperatureValue: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#111827",
//     textAlign: "center",
//   },
// });


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView as RNScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import * as Clipboard from "expo-clipboard";

export default function ChatScreen() {
  const { firstName } = useLocalSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const scrollViewRef = useRef<RNScrollView | null>(null);
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => {
      clearTimeout(welcomeTimer);
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [displayedMessages, isThinking]);

  // Function to check if the query is about time or date
  const isTimeOrDateQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("time") ||
      lowerQuery.includes("date") ||
      lowerQuery.includes("day")
    );
  };

  // Function to generate time, date, and day on the frontend
  const generateTimeDateResponse = (query: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const date = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("time")) {
      return `The current time is ${time}, on ${day}, ${date}.`;
    } else {
      return `Today is ${date}, a ${day}. The current time is ${time}.`;
    }
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setShowWelcome(false);
    const timestamp = new Date().toISOString();
    const newMessage = {
      question: query,
      answer: null,
      error: false,
      canRetry: false,
      timestamp,
    };
    setDisplayedMessages((prev) => [...prev, newMessage]);
    setIsThinking(true);

    if (isTimeOrDateQuery(query)) {
      const response = generateTimeDateResponse(query);
      setDisplayedMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          answer: response,
          error: false,
          canRetry: false,
        };
        return updated;
      });
      setIsThinking(false);
      setQuery("");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://aichatbot-backend-hxs8.onrender.com/api/chat/content",
        { question: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDisplayedMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          answer: response.data.response || "No response received.",
          error: false,
          canRetry: false,
        };
        return updated;
      });
    } catch (error: any) {
      setDisplayedMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          answer: "Sorry, something went wrong.",
          error: true,
          canRetry: true,
        };
        return updated;
      });
    }
    setIsThinking(false);
    setQuery("");
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        router.replace("/auth");
        return;
      }
      await axios.post(
        "https://aichatbot-backend-hxs8.onrender.com/api/chat/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("firstName");
      router.replace("/auth");
    } catch (error: any) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Code has been copied to your clipboard!");
  };

  // Function to parse text and render bold text for <strong> tags
  const renderTextWithBold = (text: string, theme: "light" | "dark") => {
    const parts = text.split(/<strong>(.*?)<\/strong>/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text
            key={index}
            style={[
              styles.aiMessage,
              theme === "dark" && styles.darkAiMessage,
              { fontWeight: "bold" },
            ]}
          >
            {part}
          </Text>
        );
      }
      return (
        <Text
          key={index}
          style={[styles.aiMessage, theme === "dark" && styles.darkAiMessage]}
        >
          {part}
        </Text>
      );
    });
  };

  // Function to check if the response is a temperature response and extract data
  const parseTemperatureResponse = (answer: string) => {
    const tempRegex =
      /(?:temperature in |temperature: |temperature is )?(.*?)(?:[:is ]+)(\d+\.\d+°[CF])(?:[ ,]+(?:with )?(.*))/i;
    const match = answer.match(tempRegex);
    if (match) {
      return {
        place: match[1].trim(),
        temperature: match[2].trim(),
        sky: match[3] ? match[3].trim() : "Not available",
      };
    }
    if (
      answer.toLowerCase().includes("temperature") &&
      answer.includes("°") &&
      answer.toLowerCase().includes("in")
    ) {
      const placeMatch = answer.match(/in (.*?)(?=\d+\.\d+°)/i);
      const tempMatch = answer.match(/(\d+\.\d+°[CF])/);
      const skyMatch = answer.match(/\d+\.\d+°[CF][ ,]+(.*)/);
      return {
        place: placeMatch ? placeMatch[1].trim() : "Unknown",
        temperature: tempMatch ? tempMatch[1].trim() : "Unknown",
        sky: skyMatch ? skyMatch[1].trim() : "Not available",
      };
    }
    return null;
  };

  return (
    <View style={[styles.chatScreen, theme === "dark" && styles.darkTheme]}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={toggleTheme}>
          <MaterialIcons
            name={theme === "light" ? "dark-mode" : "light-mode"}
            size={24}
            color={theme === "light" ? "#111827" : "#facc15"}
          />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>HUBA AI</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Chat Content */}
      <RNScrollView
        ref={scrollViewRef}
        style={styles.chatContent}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {displayedMessages.map((msg, index) => {
          const codeBlockRegex = /```([\s\S]*?)```/g;
          const codeBlocks = msg.answer?.match(codeBlockRegex) || [];
          const textParts = msg.answer
            ? msg.answer.split(codeBlockRegex).filter((part, i) => i % 2 === 0)
            : [];

          // Check if the response is a temperature response
          const tempData = msg.answer ? parseTemperatureResponse(msg.answer) : null;

          // Create parts array for rendering
          const parts = [];
          let codeIndex = 0;
          let textIndex = 0;
          if (tempData) {
            parts.push({ type: "temperature", content: tempData });
          } else {
            let currentPos = 0;
            while (currentPos < msg.answer?.length) {
              const nextCodeBlockMatch = codeBlockRegex.exec(msg.answer);
              if (nextCodeBlockMatch) {
                const codeStart = nextCodeBlockMatch.index;
                const codeEnd = codeBlockRegex.lastIndex;
                if (currentPos < codeStart && textIndex < textParts.length) {
                  const text = textParts[textIndex].trim();
                  if (text) {
                    parts.push({ type: "text", content: text });
                  }
                  textIndex++;
                }
                if (codeIndex < codeBlocks.length) {
                  parts.push({ type: "code", content: codeBlocks[codeIndex] });
                  codeIndex++;
                }
                currentPos = codeEnd;
              } else {
                if (textIndex < textParts.length) {
                  const text = textParts[textIndex].trim();
                  if (text) {
                    parts.push({ type: "text", content: text });
                  }
                  textIndex++;
                }
                break;
              }
            }
          }

          return (
            <View key={index} style={styles.chatItem}>
              {/* User's Question */}
              <Text
                style={[
                  styles.userMessage,
                  theme === "dark" && styles.darkUserMessage,
                ]}
              >
                {msg.question}
              </Text>

              {/* Thinking Feature */}
              {isThinking && index === displayedMessages.length - 1 && (
                <Text
                  style={[
                    styles.thinking,
                    theme === "dark" && styles.darkText,
                    styles.thinkingGap,
                  ]}
                >
                  Thinking...
                </Text>
              )}

              {/* AI's Response */}
              {msg.answer && (
                <View
                  style={[
                    styles.responseContainer,
                    theme === "dark" && styles.darkResponseContainer,
                  ]}
                >
                  {parts.map((part, partIndex) => {
                    if (part.type === "text" && part.content) {
                      return (
                        <View key={partIndex}>
                          {renderTextWithBold(part.content, theme)}
                        </View>
                      );
                    } else if (part.type === "code") {
                      const code = part.content.replace(/```/g, "").trim();
                      return (
                        <View key={partIndex} style={styles.codeWrapper}>
                          <Text
                            style={[
                              styles.codeDescription,
                              theme === "dark" && styles.darkText,
                            ]}
                          >
                            Here is your code, {firstName}
                          </Text>
                          <View
                            style={[
                              styles.codeContainer,
                              theme === "dark" && styles.darkCodeContainer,
                            ]}
                          >
                            <RNScrollView horizontal showsHorizontalScrollIndicator>
                              <Text
                                style={[
                                  styles.codeText,
                                  theme === "dark" && styles.darkCodeText,
                                ]}
                              >
                                {code}
                              </Text>
                            </RNScrollView>
                            <TouchableOpacity
                              style={styles.copyButton}
                              onPress={() => handleCopyCode(code)}
                            >
                              <MaterialIcons
                                name="content-copy"
                                size={18}
                                color={theme === "light" ? "#6b7280" : "#9ca3af"}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    } else if (part.type === "temperature") {
                      const { place, temperature, sky } = part.content;
                      return (
                        <View
                          key={partIndex}
                          style={[
                            styles.temperatureContainer,
                            theme === "dark" && styles.darkTemperatureContainer,
                          ]}
                        >
                          {/* Place Name */}
                          <Text
                            style={[
                              styles.temperaturePlace,
                              theme === "dark" && styles.darkTemperatureText,
                            ]}
                          >
                            {place}
                          </Text>
                          {/* Temperature Value */}
                          <Text
                            style={[
                              styles.temperatureValue,
                              theme === "dark" && styles.darkTemperatureText,
                            ]}
                          >
                            {temperature}
                          </Text>
                          {/* Sky Condition */}
                          <Text
                            style={[
                              styles.temperatureText,
                              theme === "dark" && styles.darkTemperatureText,
                            ]}
                          >
                            {sky}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              )}
            </View>
          );
        })}
      </RNScrollView>

      {/* Welcome Message */}
      {showWelcome && (
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeMessage, theme === "dark" && styles.darkText]}>
            Welcome {firstName}
          </Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.chatInputBar, theme === "dark" && styles.darkInputBar]}>
        <TextInput
          ref={inputRef}
          style={[styles.chatInput, theme === "dark" && styles.darkInput]}
          placeholder="Ask anything..."
          value={query}
          onChangeText={setQuery}
          multiline
          editable={true}
        />
        <TouchableOpacity onPress={handleSubmit} disabled={isThinking}>
          <MaterialIcons
            name="send"
            size={24}
            color={theme === "light" ? "#6b7280" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatScreen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  darkTheme: {
    backgroundColor: "#1f2937",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#3b82f6",
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  welcomeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  welcomeMessage: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    color: "#6b7280",
  },
  darkText: {
    color: "#f3f4f6",
  },
  chatContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chatItem: {
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: 12,
    borderRadius: 12,
    maxWidth: "75%",
  },
  darkUserMessage: {
    backgroundColor: "#3b82f6",
  },
  responseContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    maxWidth: "75%",
    marginTop: 10,
    marginBottom: 10,
  },
  darkResponseContainer: {
    backgroundColor: "#374151",
  },
  aiMessage: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
  },
  darkAiMessage: {
    color: "#f3f4f6",
  },
  thinking: {
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
  },
  thinkingGap: {
    marginTop: 10,
  },
  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    zIndex: 2,
  },
  darkInputBar: {
    backgroundColor: "#374151",
    borderTopColor: "#4b5563",
  },
  chatInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    color: "#111827",
    maxHeight: 100,
    marginHorizontal: 10,
  },
  darkInput: {
    backgroundColor: "#4b5563",
    borderColor: "#6b7280",
    color: "#f3f4f6",
  },
  codeWrapper: {
    marginTop: 10,
  },
  codeDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#111827",
  },
  codeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    maxWidth: "100%",
    position: "relative",
    flexDirection: "row",
  },
  darkCodeContainer: {
    backgroundColor: "#4b5563",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#111827",
    flexWrap: "wrap",
  },
  darkCodeText: {
    color: "#f3f4f6",
  },
  copyButton: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
  },
  // Styles for the temperature container
  temperatureContainer: {
    alignSelf: "center",
    backgroundColor: "#e0f7fa",
    padding: 15,
    borderRadius: 10,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#0288d1",
  },
  darkTemperatureContainer: {
    backgroundColor: "#4b636e",
    borderColor: "#81d4fa",
  },
  temperaturePlace: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  temperatureValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  temperatureText: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },
  darkTemperatureText: {
    color: "#f3f4f6",
  },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { router } from "expo-router";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shelterAddress, setShelterAddress] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // States for error messages.
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // // Fetch shelter locations and extract the first address.
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response = await fetch(
  //         "https://api.donneur.ca/get_shelter_locations"
  //       );
  //       const data = await response.json();
  //       const shelterEntries = Object.entries(data);
  //       if (shelterEntries.length > 0) {
  //         const firstShelter = shelterEntries[0][1];
  //         const addrObj = firstShelter.address;
  //         const fullAddress = `${addrObj.address}, ${addrObj.city}, ${addrObj.province}, ${addrObj.zip}`;
  //         setShelterAddress(fullAddress);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching shelter locations:", error);
  //     }
  //   })();
  // }, []);

  // Opens the maps app using the native maps for each platform.
  const openMapsForAddress = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodedAddress}`,
      android: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
    Linking.openURL(url);
  };

  const signIn = async () => {
    setEmailError("");
    setPasswordError("");
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log('user : ' + user)
      if (user) router.replace("/");
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      if (errorCode === "auth/invalid-email") {
        setEmailError("Invalid email address.");
      } else if (errorCode === "auth/user-not-found") {
        setEmailError("User not found.");
      } else if (errorCode === "auth/wrong-password") {
        setPasswordError("Incorrect password.");
      } else {
        setEmailError("Authentication error. Please try again.");
      }
    }
  };

  // Instead of registering via Firebase, open maps to the shelter location.
  const signUp = () => {
    if (shelterAddress) {
      openMapsForAddress(shelterAddress);
    } else {
      alert("Shelter address not available");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.outerContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailError ? { borderColor: "red", borderWidth: 1 } : {},
              ]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            {/* Password field with overlay eye icon */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  passwordError ? { borderColor: "red", borderWidth: 1 } : {},
                ]}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={signIn}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={signUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingTop: 124,
  },
  title: {
    fontSize: 36,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 90,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F2F2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
    color: "#000",
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: "#F2F2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  forgotPassword: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
    marginTop: 4,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
});

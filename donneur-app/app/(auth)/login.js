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

  // Fetch shelter locations and extract the first address.
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("https://api.donneur.ca/get_shelter_locations");
        const data = await response.json();
        // Convert the returned object to an array of entries.
        const shelterEntries = Object.entries(data);
        if (shelterEntries.length > 0) {
          // Use the first shelter entry.
          const firstShelter = shelterEntries[0][1];
          const addrObj = firstShelter.address;
          // Create a full address string.
          const fullAddress = `${addrObj.address}, ${addrObj.city}, ${addrObj.province}, ${addrObj.zip}`;
          setShelterAddress(fullAddress);
        }
      } catch (error) {
        console.error("Error fetching shelter locations:", error);
      }
    })();
  }, []);

  // Opens the maps app with a query for the provided address.
  const openMapsForAddress = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });
    Linking.openURL(url);
  };

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/");
    } catch (error) {
      console.log(error);
      alert("Sign In Failed");
    }
  };

  // Instead of registering a new user via Firebase, we now open the maps app.
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
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
    fontSize: 28,
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
    marginBottom: 12,
    color: "#000",
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

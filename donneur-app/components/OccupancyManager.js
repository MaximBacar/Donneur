import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider"; // Make sure to install this package

const OccupancyManager = ({
  initialOccupancy = 0,  // Default value if null
  maxOccupancy = 1,      // Default value if null
  onOccupancyChange,
}) => {
  // Ensure initialOccupancy is a number and not null
  const safeInitialOccupancy = initialOccupancy !== null && initialOccupancy !== undefined 
    ? Number(initialOccupancy) 
    : 0;
  
  // Ensure maxOccupancy is a number, not null, and at least 1
  const safeMaxOccupancy = maxOccupancy !== null && maxOccupancy !== undefined 
    ? Math.max(Number(maxOccupancy), 1) 
    : 1;

  const [currentOccupancy, setCurrentOccupancy] = useState(safeInitialOccupancy);
  const [savedOccupancy, setSavedOccupancy] = useState(safeInitialOccupancy);
  const [animation] = useState(new Animated.Value(0));
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(safeInitialOccupancy));
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Update local state if prop changes externally
    // Ensure we handle null values safely
    const newOccupancy = initialOccupancy !== null && initialOccupancy !== undefined 
      ? Number(initialOccupancy) 
      : 0;
    
    setCurrentOccupancy(newOccupancy);
    setSavedOccupancy(newOccupancy);
    setInputValue(String(newOccupancy));
    setHasChanges(false);
  }, [initialOccupancy]);

  useEffect(() => {
    // Animate when occupancy changes
    Animated.spring(animation, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      animation.setValue(0);
    });

    // Check if current occupancy differs from saved occupancy
    setHasChanges(currentOccupancy !== savedOccupancy);
  }, [currentOccupancy, savedOccupancy]);

  const increaseOccupancy = () => {
    if (currentOccupancy < safeMaxOccupancy) {
      const newOccupancy = currentOccupancy + 1;
      updateLocalOccupancy(newOccupancy);
    } else {
      Alert.alert("Maximum Capacity", "The shelter is at maximum capacity.");
    }
  };

  const decreaseOccupancy = () => {
    if (currentOccupancy > 0) {
      const newOccupancy = currentOccupancy - 1;
      updateLocalOccupancy(newOccupancy);
    } else {
      Alert.alert("Minimum Reached", "Occupancy cannot be less than 0.");
    }
  };

  const updateLocalOccupancy = (value) => {
    const newValue = Math.min(Math.max(0, Math.round(value)), safeMaxOccupancy);
    setCurrentOccupancy(newValue);
    setInputValue(String(newValue));
    // Note: We're not calling onOccupancyChange here anymore
  };

  // This function updates the local state as the slider moves
  const handleSliderChange = (value) => {
    const roundedValue = Math.round(value);
    updateLocalOccupancy(roundedValue);
  };

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) {
      setInputValue(String(currentOccupancy));
    } else {
      updateLocalOccupancy(numValue);
    }
  };

  const handleUpdateSystem = () => {
    // Only update backend if there are actual changes
    if (hasChanges && onOccupancyChange) {
      onOccupancyChange(currentOccupancy);
      setSavedOccupancy(currentOccupancy);
      // Show success message
      Alert.alert(
        "Success", 
        "Occupancy has been updated in the system.",
        [{ text: "OK" }]
      );
    } else if (!hasChanges) {
      Alert.alert(
        "No Changes", 
        "No changes to update.",
        [{ text: "OK" }]
      );
    }
  };

  const calculatePercentage = () => {
    // Avoid division by zero
    return safeMaxOccupancy > 0 ? (currentOccupancy / safeMaxOccupancy) * 100 : 0;
  };

  const getOccupancyGradient = () => {
    const percentage = calculatePercentage();
    if (percentage > 90) return ["#FF416C", "#FF4B2B"];
    if (percentage > 75) return ["#FF8C39", "#FF512F"];
    if (percentage > 50) return ["#FFBC39", "#FF9A39"];
    if (percentage > 25) return ["#00B4DB", "#0083B0"];
    return ["#56CCF2", "#2F80ED"];
  };

  const progressWidth = `${calculatePercentage()}%`;

  // Animation for the count change
  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const availableBeds = safeMaxOccupancy - currentOccupancy;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Occupancy Management</Text>
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={getOccupancyGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>
              {calculatePercentage().toFixed(0)}% Full
            </Text>
          </LinearGradient>
        </View>
      </View>

      {hasChanges && (
        <View style={styles.unsavedChangesContainer}>
          <Text style={styles.unsavedChangesText}>
            <MaterialCommunityIcons name="information" size={16} color="#F59E0B" /> 
            Changes not saved. Click "Update System" to save.
          </Text>
        </View>
      )}

      <View style={styles.countDisplay}>
        <TouchableOpacity
          style={styles.countButton}
          onPress={decreaseOccupancy}
        >
          <LinearGradient
            colors={["#FF6B6B", "#FF4949"]}
            style={styles.countButtonGradient}
          >
            <MaterialCommunityIcons name="minus" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={styles.countTouchable}
        >
          <Animated.View
            style={[styles.currentCount, { transform: [{ scale }] }]}
          >
            {isEditing ? (
              <TextInput
                style={styles.currentCountInput}
                value={inputValue}
                onChangeText={handleInputChange}
                keyboardType="number-pad"
                autoFocus
                onBlur={handleInputBlur}
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.currentCountValue}>{currentOccupancy}</Text>
            )}
            <Text style={styles.currentCountLabel}>CURRENT OCCUPANCY</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.countButton}
          onPress={increaseOccupancy}
        >
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            style={styles.countButtonGradient}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Slider Component - Moved below the current occupancy display */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Adjust Occupancy</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderValue}>0</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={safeMaxOccupancy}
            value={currentOccupancy}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={getOccupancyGradient()[0]}
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor={getOccupancyGradient()[0]}
            step={1}
          />
          <Text style={styles.sliderValue}>{safeMaxOccupancy}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: progressWidth }]}>
            <LinearGradient
              colors={getOccupancyGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>0</Text>
          <Text style={styles.progressLabel}>
            {Math.floor(safeMaxOccupancy / 2)}
          </Text>
          <Text style={styles.progressLabel}>{safeMaxOccupancy}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <LinearGradient
          colors={["#F8F9FA", "#EAEEF2"]}
          style={styles.statsCard}
        >
          <View style={styles.statIcon}>
            <MaterialCommunityIcons
              name="bed-empty"
              size={28}
              color="#4A90E2"
            />
          </View>
          <Text style={styles.statValue}>{availableBeds}</Text>
          <Text style={styles.statLabel}>BEDS AVAILABLE</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#F8F9FA", "#EAEEF2"]}
          style={styles.statsCard}
        >
          <View style={styles.statIcon}>
            <MaterialCommunityIcons name="bed" size={28} color="#4A90E2" />
          </View>
          <Text style={styles.statValue}>{safeMaxOccupancy}</Text>
          <Text style={styles.statLabel}>TOTAL CAPACITY</Text>
        </LinearGradient>
      </View>

      <TouchableOpacity 
        style={[
          styles.updateButton, 
          !hasChanges && styles.updateButtonDisabled
        ]}
        onPress={handleUpdateSystem}
      >
        <LinearGradient
          colors={hasChanges ? ["#4A90E2", "#5A5DE8"] : ["#A0AEC0", "#CBD5E0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.updateButtonGradient}
        >
          <Text style={styles.updateButtonText}>
            {hasChanges ? "Update System" : "No Changes to Update"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
export default OccupancyManager;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  badgeContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  countDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  countButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  countButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  countTouchable: {
    flex: 1,
  },
  currentCount: {
    alignItems: "center",
  },
  currentCountValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1E293B",
  },
  currentCountInput: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    minWidth: 100,
  },
  currentCountLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderValue: {
    fontSize: 12,
    color: "#64748B",
    width: 30,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressGradient: {
    height: "100%",
    width: "100%",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  updateButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  unsavedChangesContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  unsavedChangesText: {
    color: "#92400E",
    fontSize: 14,
  },
});
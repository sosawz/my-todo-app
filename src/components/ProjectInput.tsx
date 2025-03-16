import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useThemeContext } from "../context/ThemeContext";

interface ProjectInputProps {
  onCreate: (name: string) => void;
}

export default function ProjectInput({ onCreate }: ProjectInputProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useThemeContext();

  const isDarkMode = theme === "dark";

  const themeColors = {
    background: isDarkMode ? "#1E1E1E" : "#F8F8F8",
    inputBg: isDarkMode ? "#2A2A2A" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#121212",
    placeholder: isDarkMode ? "#888888" : "#AAAAAA",
    border: isDarkMode ? "#3A3A3A" : "#E0E0E0",
    accent: "#4F6CFF",
    accentDark: "#3D5BE0",
  };

  const handleSubmit = async () => {
    if (value.trim()) {
      setIsSubmitting(true);
      try {
        await onCreate(value);
        setValue("");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.inputContainer}>
        <Icon
          name="create-new-folder"
          size={22}
          color={themeColors.accent}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder="New Project Name"
          placeholderTextColor={themeColors.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.border,
              color: themeColors.text,
            },
          ]}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: themeColors.accent },
          !value.trim() && styles.addButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!value.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Project Todo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    height: 46,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";

interface TaskInputProps {
  onAddTask: (title: string, priority: string, dueDate?: string) => void;
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme } = useThemeContext();
  const isDarkMode = theme === "dark";

  const themeColors = {
    background: isDarkMode ? "#1E1E1E" : "#F8F8F8",
    card: isDarkMode ? "#2A2A2A" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#121212",
    subtext: isDarkMode ? "#AAAAAA" : "#666666",
    inputBg: isDarkMode ? "#333333" : "#FFFFFF",
    border: isDarkMode ? "#3A3A3A" : "#E0E0E0",
    placeholder: isDarkMode ? "#888888" : "#AAAAAA",
    accent: "#4F6CFF",
    high: "#FF5252",
    medium: "#FFC107",
    low: "#4CAF50",
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTask(title, priority, dueDate);
      setTitle("");
      setPriority("medium");
      setDueDate(undefined);
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDate = (date: Date) => {
    setDueDate(date.toISOString());
    setDatePickerVisible(false);
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "กำหนดวันที่";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Invalid date format:", error);
      return "วันที่ไม่ถูกต้อง";
    }
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  const getPriorityColor = (value: string) => {
    switch (value) {
      case "high":
        return themeColors.high;
      case "medium":
        return themeColors.medium;
      case "low":
        return themeColors.low;
      default:
        return themeColors.medium;
    }
  };

  const getPriorityIcon = (value: string) => {
    switch (value) {
      case "high":
        return "flag";
      case "medium":
        return "outlined-flag";
      case "low":
        return "assistant-photo";
      default:
        return "outlined-flag";
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
            elevation: 2,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {isExpanded ? "เพิ่มงานใหม่" : "เพิ่มงาน"}
          </Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Icon
              name={isExpanded ? "expand-less" : "expand-more"}
              size={24}
              color={themeColors.accent}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.inputContainer, { borderColor: themeColors.border }]}
        >
          <Icon
            name="assignment"
            size={20}
            color={themeColors.accent}
            style={styles.inputIcon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: themeColors.text,
                backgroundColor: themeColors.inputBg,
              },
            ]}
            placeholder="ชื่องาน..."
            placeholderTextColor={themeColors.placeholder}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setIsExpanded(true)}
          />
        </View>

        {isExpanded && (
          <>
            <View style={styles.prioritySection}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                ความสำคัญ
              </Text>
              <View style={styles.priorityButtons}>
                {["low", "medium", "high"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor:
                          priority === level
                            ? getPriorityColor(level)
                            : themeColors.inputBg,
                        borderColor: getPriorityColor(level),
                      },
                    ]}
                    onPress={() => setPriority(level)}
                  >
                    <Icon
                      name={getPriorityIcon(level)}
                      size={18}
                      color={
                        priority === level ? "#FFFFFF" : getPriorityColor(level)
                      }
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            priority === level ? "#FFFFFF" : themeColors.text,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      {level === "high"
                        ? "สูง"
                        : level === "medium"
                        ? "กลาง"
                        : "ต่ำ"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.dateSection}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                กำหนดเสร็จ
              </Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    {
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <Icon
                    name="event"
                    size={18}
                    color={themeColors.accent}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: dueDate
                          ? themeColors.text
                          : themeColors.placeholder,
                      },
                    ]}
                  >
                    {dueDate ? formatDueDate(dueDate) : "เลือกวันที่"}
                  </Text>
                </TouchableOpacity>

                {dueDate && (
                  <TouchableOpacity
                    style={[
                      styles.clearDateButton,
                      { backgroundColor: themeColors.background },
                    ]}
                    onPress={clearDueDate}
                  >
                    <Icon name="clear" size={16} color={themeColors.subtext} />
                  </TouchableOpacity>
                )}
              </View>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisible(false)}
                confirmTextIOS="ยืนยัน"
                cancelTextIOS="ยกเลิก"
                themeVariant={isDarkMode ? "dark" : "light"}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: themeColors.accent },
            (!title.trim() || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleAdd}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="add-task" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>
                {isExpanded ? "เพิ่มงาน" : "เพิ่ม"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  expandButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  prioritySection: {
    marginBottom: 16,
  },
  priorityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "30%",
  },
  priorityText: {
    fontWeight: "500",
    fontSize: 14,
  },
  dateSection: {
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
  },
  clearDateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

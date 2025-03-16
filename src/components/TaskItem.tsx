import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableHighlight,
} from "react-native";
import { Task } from "../types";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Swipeable } from "react-native-gesture-handler";

interface TaskItemProps {
  task: Task;
  onToggleCompleted: () => void;
  onDelete: () => void;
  onOpenSubTask: () => void;
  themeColors?: any;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleCompleted,
  onDelete,
  onOpenSubTask,
  themeColors,
}) => {
  const { theme } = useThemeContext();
  const isDarkMode = theme === "dark";

  const colors = themeColors || {
    background: isDarkMode ? "#121212" : "#F5F5F5",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#121212",
    subtext: isDarkMode ? "#AAAAAA" : "#666666",
    border: isDarkMode ? "#3A3A3A" : "#E0E0E0",
    accent: "#4F6CFF",
    high: "#FF5252",
    medium: "#FFC107",
    low: "#4CAF50",
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return colors.high;
      case "medium":
        return colors.medium;
      case "low":
        return colors.low;
      default:
        return colors.accent;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "flag";
      case "medium":
        return "outlined-flag";
      case "low":
        return "assistant-photo";
      default:
        return "more-horiz";
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueDate = new Date(date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() === today.getTime()) {
        return "วันนี้";
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        return "พรุ่งนี้";
      } else {
        return date.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Invalid date format:", error);
      return dateString;
    }
  };

  const isDueDatePassed = (dateString?: string) => {
    if (!dateString) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(dateString);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today && !task.completed;
    } catch {
      return false;
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translate = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View style={{ transform: [{ translateX: translate }] }}>
          <TouchableHighlight
            style={[styles.deleteButton, { backgroundColor: colors.high }]}
            onPress={onDelete}
            underlayColor={colors.high}
          >
            <Icon name="delete" size={24} color="#FFFFFF" />
          </TouchableHighlight>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: task.completed ? 0.8 : 1,
          },
        ]}
      >
        <TouchableOpacity style={styles.checkbox} onPress={onToggleCompleted}>
          <View
            style={[
              styles.checkboxInner,
              {
                backgroundColor: task.completed ? colors.accent : "transparent",
                borderColor: task.completed ? colors.accent : colors.border,
              },
            ]}
          >
            {task.completed && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contentContainer}
          onPress={onOpenSubTask}
          activeOpacity={0.7}
        >
          <View style={styles.contentTop}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textDecorationLine: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.7 : 1,
                },
              ]}
            >
              {task.title}
            </Text>

            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Icon
                name={getPriorityIcon(task.priority)}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.priorityText}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>

          {task.dueDate && (
            <View style={styles.dueDateContainer}>
              <Icon
                name="event"
                size={14}
                color={
                  isDueDatePassed(task.dueDate) ? colors.high : colors.subtext
                }
                style={styles.dueDateIcon}
              />
              <Text
                style={[
                  styles.dueDate,
                  {
                    color: isDueDatePassed(task.dueDate)
                      ? colors.high
                      : colors.subtext,
                  },
                ]}
              >
                {formatDueDate(task.dueDate)}
                {isDueDatePassed(task.dueDate) && " (เลยกำหนด)"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.detailButton} onPress={onOpenSubTask}>
          <Icon name="chevron-right" size={24} color={colors.subtext} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  checkbox: {
    marginRight: 12,
    padding: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  contentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateIcon: {
    marginRight: 4,
  },
  dueDate: {
    fontSize: 12,
  },
  detailButton: {
    padding: 4,
  },
  swipeActionsContainer: {
    width: 80,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

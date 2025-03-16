import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { RouteProp, useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  createSubTask,
  getSubTasks,
  toggleSubTaskCompleted,
  deleteTask,
  getTaskById,
} from "../db/dbService";
import { SubTask, Task } from "../types";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";

type SubTaskNavProp = StackNavigationProp<RootStackParamList, "SubTask">;
type SubTaskRouteProp = RouteProp<RootStackParamList, "SubTask">;

interface Props {
  navigation: SubTaskNavProp;
  route: SubTaskRouteProp;
}

const SubTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentTask, setParentTask] = useState<Task | null>(null);
  const { theme } = useThemeContext();

  const isFocused = useIsFocused();
  const isDarkMode = theme === "dark";

  const themeColors = {
    background: isDarkMode ? "#121212" : "#F5F5F5",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#121212",
    subtext: isDarkMode ? "#AAAAAA" : "#666666",
    inputBg: isDarkMode ? "#2A2A2A" : "#FFFFFF",
    border: isDarkMode ? "#3A3A3A" : "#E0E0E0",
    accent: "#4F6CFF",
    success: "#4CAF50",
    error: "#FF5252",
    warning: "#FFC107",
    placeholder: isDarkMode ? "#888888" : "#AAAAAA",
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    setLoading(true);
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setParentTask(task);

        navigation.setOptions({
          title: task.title,
        });
      } else {
        console.warn(`Task with id ${taskId} not found`);
        navigation.setOptions({
          title: "รายละเอียดงาน",
        });
      }

      await loadSubTasks();
    } catch (error) {
      console.error("Failed to load task data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const loadSubTasks = async () => {
    try {
      const list = await getSubTasks(taskId);
      setSubTasks(list);
    } catch (error) {
      console.error("Failed to load subtasks:", error);
    }
  };

  const handleAddSubTask = async () => {
    if (!text.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubTask(taskId, text);
      setText("");
      await loadSubTasks();
    } catch (error) {
      console.error("Failed to add subtask:", error);
      Alert.alert("Error", "ไม่สามารถเพิ่มงานย่อยได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubTask = async (id: string, current: boolean) => {
    try {
      await toggleSubTaskCompleted(id, !current);
      await loadSubTasks();
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
    }
  };

  const handleDeleteSubTask = async (id: string) => {
    try {
      await deleteTask(id);
      await loadSubTasks();
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      Alert.alert("Error", "ไม่สามารถลบงานย่อยได้");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCompletionStatus = () => {
    const completed = subTasks.filter((item) => item.completed).length;
    const total = subTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const renderSubTaskItem = ({ item }: { item: SubTask }) => {
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.subtaskItem,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
          onPress={() => handleToggleSubTask(item.id, item.completed)}
          activeOpacity={0.7}
        >
          <View style={styles.subtaskRow}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: item.completed
                    ? themeColors.accent
                    : themeColors.border,
                },
              ]}
            >
              {item.completed && (
                <Icon name="check" size={16} color={themeColors.accent} />
              )}
            </View>

            <Text
              style={[
                styles.subtaskText,
                { color: themeColors.text },
                item.completed && {
                  textDecorationLine: "line-through",
                  color: themeColors.subtext,
                  opacity: 0.8,
                },
              ]}
            >
              {item.title}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSubTask(item.id)}
            >
              <Icon name="delete-outline" size={22} color={themeColors.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const stats = formatCompletionStatus();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.accent} />
            <Text style={[styles.loadingText, { color: themeColors.text }]}>
              กำลังโหลดข้อมูล...
            </Text>
          </View>
        ) : (
          <>
            {parentTask && (
              <View
                style={[
                  styles.parentTaskCard,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.parentTaskHeader}>
                  <Text
                    style={[
                      styles.parentTaskTitle,
                      { color: themeColors.text },
                    ]}
                  >
                    {parentTask.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          parentTask.priority === "High"
                            ? themeColors.error
                            : parentTask.priority === "Normal"
                            ? themeColors.warning
                            : themeColors.success,
                      },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {parentTask.priority === "High"
                        ? "สูง"
                        : parentTask.priority === "Normal"
                        ? "กลาง"
                        : "ต่ำ"}
                    </Text>
                  </View>
                </View>

                {parentTask.dueDate && (
                  <View style={styles.dueDateContainer}>
                    <Icon
                      name="event"
                      size={14}
                      color={themeColors.subtext}
                      style={styles.dueDateIcon}
                    />
                    <Text
                      style={[styles.dueDate, { color: themeColors.subtext }]}
                    >
                      กำหนดส่ง:{" "}
                      {new Date(parentTask.dueDate).toLocaleString("th-TH")}
                    </Text>
                  </View>
                )}

                <View style={styles.progressContainer}>
                  <Text
                    style={[
                      styles.progressText,
                      { color: themeColors.subtext },
                    ]}
                  >
                    ความคืบหน้า: {stats.completed}/{stats.total} งานย่อย (
                    {stats.percentage}%)
                  </Text>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: themeColors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${stats.percentage}%`,
                          backgroundColor: themeColors.accent,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.textInputContainer}>
                <Icon
                  name="add-task"
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
                  placeholder="เพิ่มงานย่อยใหม่..."
                  placeholderTextColor={themeColors.placeholder}
                  value={text}
                  onChangeText={setText}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: themeColors.accent },
                  (!text.trim() || isSubmitting) && { opacity: 0.6 },
                ]}
                onPress={handleAddSubTask}
                disabled={!text.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="add" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {subTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon
                  name="check-box-outline-blank"
                  size={48}
                  color={themeColors.subtext}
                />
                <Text
                  style={[styles.emptyText, { color: themeColors.subtext }]}
                >
                  ยังไม่มีงานย่อยในรายการนี้
                </Text>
                <Text
                  style={[styles.emptySubText, { color: themeColors.subtext }]}
                >
                  เพิ่มงานย่อยเพื่อแบ่งงานใหญ่ให้จัดการได้ง่ายขึ้น
                </Text>
              </View>
            ) : (
              <FlatList
                data={subTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderSubTaskItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[themeColors.accent]}
                    tintColor={themeColors.accent}
                  />
                }
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SubTaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  parentTaskCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  parentTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  parentTaskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dueDateIcon: {
    marginRight: 6,
  },
  dueDate: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  subtaskItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 6,
  },
});

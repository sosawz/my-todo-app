import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { RouteProp, useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  createTask,
  getTasksByProject,
  deleteTask,
  toggleTaskCompleted,
} from "../db/dbService";
import { Task } from "../types";
import TaskInput from "../components/TaskInput";
import TaskItem from "../components/TaskItem";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";

type ProjectScreenNavProp = StackNavigationProp<RootStackParamList, "Project">;
type ProjectScreenRouteProp = RouteProp<RootStackParamList, "Project">;

interface Props {
  navigation: ProjectScreenNavProp;
  route: ProjectScreenRouteProp;
}

const ProjectScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId, projectName } = route.params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    placeholder: isDarkMode ? "#888888" : "#AAAAAA",
    high: "#FF5252",
    medium: "#FFC107",
    low: "#4CAF50",
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const list = await getTasksByProject(projectId);
      setTasks(list);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTask = async (
    title: string,
    priority: string,
    dueDate?: string
  ) => {
    await createTask(projectId, title, priority, dueDate);
    loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    loadTasks();
  };

  const handleToggleCompleted = async (id: string, current: boolean) => {
    await toggleTaskCompleted(id, !current);
    loadTasks();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const getCompletionStats = () => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const stats = getCompletionStats();
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
    );
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.projectName, { color: themeColors.text }]}>
          {projectName}
        </Text>

        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: themeColors.subtext }]}>
            {stats.completed}/{stats.total} เสร็จสิ้น ({stats.percentage}%)
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

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={themeColors.accent}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.border,
              color: themeColors.text,
            },
          ]}
          placeholder="ค้นหางาน..."
          placeholderTextColor={themeColors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Icon name="clear" size={16} color={themeColors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      <TaskInput onAddTask={handleAddTask} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            กำลังโหลดงาน...
          </Text>
        </View>
      ) : sortedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="assignment" size={48} color={themeColors.subtext} />
          <Text style={[styles.emptyText, { color: themeColors.subtext }]}>
            {searchQuery
              ? "ไม่พบงานที่ตรงกับการค้นหา"
              : "ยังไม่มีงานในโปรเจกต์นี้"}
          </Text>
          {searchQuery ? (
            <TouchableOpacity
              style={[
                styles.clearSearchButton,
                { backgroundColor: themeColors.card },
              ]}
              onPress={() => setSearchQuery("")}
            >
              <Text
                style={[styles.clearSearchText, { color: themeColors.accent }]}
              >
                ล้างการค้นหา
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.emptySubText, { color: themeColors.subtext }]}>
              เพิ่มงานใหม่โดยใช้ฟอร์มด้านบน
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColors.accent]}
              tintColor={themeColors.accent}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleCompleted={() =>
                handleToggleCompleted(item.id, item.completed)
              }
              onDelete={() => handleDeleteTask(item.id)}
              onOpenSubTask={() =>
                navigation.navigate("SubTask", { taskId: item.id })
              }
              themeColors={themeColors}
            />
          )}
        />
      )}

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: themeColors.accent },
          ]}
          onPress={() => navigation.navigate("Stats")}
        >
          <Icon name="bar-chart" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProjectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsContainer: {
    marginTop: 4,
  },
  statsText: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingLeft: 12,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 24,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

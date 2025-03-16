import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { RouteProp } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { createProject, getAllProjects } from "../db/dbService";
import { Project } from "../types";
import ProjectInput from "../components/ProjectInput";
import Icon from "react-native-vector-icons/MaterialIcons";

type HomeScreenNavProp = StackNavigationProp<RootStackParamList, "Home">;
type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavProp;
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, toggleTheme } = useThemeContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await getAllProjects();
      setProjects(list);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string) => {
    if (name.trim()) {
      await createProject(name);
      loadProjects();
    }
  };

  const isDarkMode = theme === "dark";

  const themeColors = {
    background: isDarkMode ? "#121212" : "#F5F5F5",
    card: isDarkMode ? "#2A2A2A" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#121212",
    subtext: isDarkMode ? "#B0B0B0" : "#717171",
    accent: "#4F6CFF",
    border: isDarkMode ? "#3A3A3A" : "#E0E0E0",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Make Your Todo
        </Text>
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Icon
            name={isDarkMode ? "light-mode" : "dark-mode"}
            size={24}
            color={themeColors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: themeColors.card }]}
          onPress={() => navigation.navigate("Stats")}
        >
          <Icon name="bar-chart" size={22} color={themeColors.accent} />
          <Text style={[styles.navButtonText, { color: themeColors.text }]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: themeColors.card }]}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon name="person" size={22} color={themeColors.accent} />
          <Text style={[styles.navButtonText, { color: themeColors.text }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ProjectInput onCreate={handleCreateProject} />

      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Your Projects
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={themeColors.accent}
          style={styles.loader}
        />
      ) : projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="folder-open" size={48} color={themeColors.subtext} />
          <Text style={[styles.emptyStateText, { color: themeColors.subtext }]}>
            No projects yet. Create your first project!
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.projectCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate("Project", {
                  projectId: item.id,
                  projectName: item.name,
                })
              }
            >
              <View style={styles.projectCardContent}>
                <Icon name="folder" size={24} color={themeColors.accent} />
                <Text style={[styles.projectName, { color: themeColors.text }]}>
                  {item.name}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={themeColors.subtext}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  navButtons: {
    flexDirection: "row",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});

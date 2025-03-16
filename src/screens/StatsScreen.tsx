import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { getTaskStats } from '../db/dbService';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StatsData {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

const StatsScreen: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeContext();
  
  const isDarkMode = theme === 'dark';
  
  const themeColors = {
    background: isDarkMode ? '#121212' : '#F5F5F5',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#121212',
    subtext: isDarkMode ? '#AAAAAA' : '#666666',
    border: isDarkMode ? '#2C2C2C' : '#E5E5E5',
    accent: '#4F6CFF',
    success: '#4CAF50',
    warning: '#FFC107',
    pending: '#FF9800',
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { total, completed } = await getTaskStats();
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setStats({
        total,
        completed,
        pending,
        completionRate
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (value: number, max: number, color: string) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: themeColors.subtext }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
    );
  };

  const renderStatCard = (title: string, value: number | string, icon: string, color: string) => {
    return (
      <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.statIconContainer}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.statTitle, { color: themeColors.subtext }]}>{title}</Text>
        <Text style={[styles.statValue, { color: themeColors.text }]}>{value}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>ภาพรวมงาน</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: themeColors.card }]}
            onPress={loadStats}
          >
            <Icon name="refresh" size={20} color={themeColors.accent} />
          </TouchableOpacity>
        </View>
        
        {stats && (
          <>
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
                <Text style={[styles.summaryTitle, { color: themeColors.text }]}>
                  อัตราความสำเร็จ
                </Text>
                <Text style={[styles.summaryValue, { color: themeColors.accent }]}>
                  {stats.completionRate}%
                </Text>
                {renderProgressBar(stats.completed, stats.total, themeColors.accent)}
              </View>
            </View>
            
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>รายละเอียดงาน</Text>
            
            <View style={styles.statsGrid}>
              {renderStatCard('งานทั้งหมด', stats.total, 'assignment', themeColors.accent)}
              {renderStatCard('เสร็จสิ้น', stats.completed, 'check-circle', themeColors.success)}
              {renderStatCard('กำลังดำเนินการ', stats.pending, 'pending-actions', themeColors.pending)}
              {renderStatCard('งานต่อวัน', (stats.total / 7).toFixed(1), 'date-range', themeColors.warning)}
            </View>
            
            <View style={[styles.tipsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.tipsHeader}>
                <Icon name="lightbulb" size={20} color={themeColors.warning} />
                <Text style={[styles.tipsTitle, { color: themeColors.text }]}>คำแนะนำ</Text>
              </View>
              <Text style={[styles.tipsText, { color: themeColors.subtext }]}>
                {stats.completionRate < 50 
                  ? 'ลองแบ่งงานใหญ่เป็นงานย่อย เพื่อให้ง่ายต่อการจัดการและเสร็จเร็วขึ้น'
                  : 'ยอดเยี่ยม! คุณมีอัตราความสำเร็จที่ดี ลองสร้างรายการที่ท้าทายขึ้นเพื่อพัฒนาตัวเอง'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  }
});
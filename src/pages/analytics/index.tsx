// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { View, Text, ScrollView, Progress } from "@tarojs/components";
import { useAppDispatch, useAppSelector } from "../../store";
import { kanbanActions, loadKanbanTasksAsync } from "../../store/kanbanSlice";
import {
  eisenhowerActions,
  loadEisenhowerTasksAsync,
} from "../../store/eisenhowerSlice";
import {
  getKanbanAnalytics,
  getEisenhowerAnalytics,
  getCombinedAnalytics,
} from "../../services/analyticsService";
import { KANBAN_COLUMNS } from "../../config/kanbanConfig";
import {
  EisenhowerQuadrant,
  getQuadrantName,
} from "../../config/eisenhowerConfig";
import "./index.css";

const AnalyticsScreen: React.FC = () => {
  const kanbanState = useAppSelector((state) => state.kanban);
  const eisenhowerState = useAppSelector((state) => state.eisenhower);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  const loadData = useCallback(() => {
    setIsLoading(true);
    dispatch(loadKanbanTasksAsync());
    dispatch(loadEisenhowerTasksAsync());
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, [dispatch]);

  const kanbanAnalytics = getKanbanAnalytics(kanbanState.tasks);
  const eisenhowerAnalytics = getEisenhowerAnalytics(eisenhowerState.tasks);
  const combinedAnalytics = getCombinedAnalytics(
    kanbanState.tasks,
    eisenhowerState.tasks,
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const renderSummaryCard = (title: string, value: string, color: string) => (
    <View className="summary-card" style={{ backgroundColor: color }}>
      <Text className="summary-card-title">{title}</Text>
      <Text className="summary-card-value">{value}</Text>
    </View>
  );

  const renderColumnBar = (
    column: string,
    count: number,
    total: number,
    color: string,
  ) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View className="distribution-bar">
        <View className="bar-header">
          <Text className="bar-label">{column}</Text>
          <Text className="bar-value">{count}</Text>
        </View>
        <View className="bar-track">
          <View
            className="bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    );
  };

  const renderQuadrantBar = (
    quadrant: EisenhowerQuadrant,
    count: number,
    total: number,
  ) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const colors: Record<EisenhowerQuadrant, string> = {
      [EisenhowerQuadrant.UrgentImportant]: "#C62828",
      [EisenhowerQuadrant.NotUrgentImportant]: "#2E7D32",
      [EisenhowerQuadrant.UrgentNotImportant]: "#EF6C00",
      [EisenhowerQuadrant.NotUrgentNotImportant]: "#424242",
    };
    return (
      <View className="distribution-bar">
        <View className="bar-header">
          <Text className="bar-label">{getQuadrantName(quadrant)}</Text>
          <Text className="bar-value">{count}</Text>
        </View>
        <View className="bar-track">
          <View
            className="bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: colors[quadrant],
            }}
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="analytics-screen loading">
        <Text className="loading-text">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="analytics-screen">
      <View className="analytics-header">
        <Text className="analytics-title">Task Analytics</Text>
        <Text className="analytics-subtitle">
          Overview of your productivity
        </Text>
      </View>

      <ScrollView scrollY className="analytics-content">
        <View className="section">
          <Text className="section-title">Overview</Text>
          <View className="summary-grid">
            {renderSummaryCard(
              "Total Tasks",
              combinedAnalytics.totalTasks.toString(),
              "#6200EE",
            )}
            {renderSummaryCard(
              "Completed",
              combinedAnalytics.totalCompleted.toString(),
              "#4CAF50",
            )}
            {renderSummaryCard(
              "Pending",
              (
                combinedAnalytics.totalTasks - combinedAnalytics.totalCompleted
              ).toString(),
              "#FF9800",
            )}
            {renderSummaryCard(
              "Completion Rate",
              `${combinedAnalytics.overallCompletionRate.toFixed(1)}%`,
              "#9C27B0",
            )}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">Overall Progress</Text>
          <View className="progress-card">
            <Progress
              percent={combinedAnalytics.overallCompletionRate}
              strokeWidth={20}
              color="#4CAF50"
              backgroundColor="#E0E0E0"
              showInfo
            />
            <Text className="progress-label">
              {combinedAnalytics.overallCompletionRate.toFixed(1)}% Complete
            </Text>
          </View>
        </View>

        <View className="section">
          <Text className="section-title">Kanban Board</Text>
          <View className="card">
            <View className="card-row">
              <Text className="card-label">Total Tasks</Text>
              <Text className="card-value">{kanbanAnalytics.totalTasks}</Text>
            </View>
            <View className="card-row">
              <Text className="card-label">Completed</Text>
              <Text className="card-value success">
                {kanbanAnalytics.completedTasks}
              </Text>
            </View>
            <View className="card-row">
              <Text className="card-label">Pending</Text>
              <Text className="card-value warning">
                {kanbanAnalytics.pendingTasks}
              </Text>
            </View>
            <View className="card-row">
              <Text className="card-label">High Priority</Text>
              <Text className="card-value danger">
                {kanbanAnalytics.highPriorityTasks}
              </Text>
            </View>
            <View className="divider" />
            <Text className="subsection-title">Column Distribution</Text>
            {KANBAN_COLUMNS.map((column) =>
              renderColumnBar(
                column,
                kanbanAnalytics.columnDistribution[column] || 0,
                kanbanAnalytics.totalTasks,
                column === "To Do"
                  ? "#2196F3"
                  : column === "In Progress"
                    ? "#FF9800"
                    : "#4CAF50",
              ),
            )}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">Eisenhower Matrix</Text>
          <View className="card">
            <View className="card-row">
              <Text className="card-label">Total Tasks</Text>
              <Text className="card-value">
                {eisenhowerAnalytics.totalTasks}
              </Text>
            </View>
            <View className="card-row">
              <Text className="card-label">Completed</Text>
              <Text className="card-value success">
                {eisenhowerAnalytics.completedTasks}
              </Text>
            </View>
            <View className="card-row">
              <Text className="card-label">Pending</Text>
              <Text className="card-value warning">
                {eisenhowerAnalytics.pendingTasks}
              </Text>
            </View>
            <View className="card-row">
              <Text className="card-label">High Priority</Text>
              <Text className="card-value danger">
                {eisenhowerAnalytics.highPriorityTasks}
              </Text>
            </View>
            <View className="divider" />
            <Text className="subsection-title">Quadrant Distribution</Text>
            {Object.values(EisenhowerQuadrant).map((quadrant) =>
              renderQuadrantBar(
                quadrant,
                eisenhowerAnalytics.quadrantDistribution[
                  getQuadrantName(quadrant)
                ] || 0,
                eisenhowerAnalytics.totalTasks,
              ),
            )}
          </View>
        </View>
      </ScrollView>

      {toastMessage && (
        <View className="toast">
          <Text className="toast-text">{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

export default AnalyticsScreen;

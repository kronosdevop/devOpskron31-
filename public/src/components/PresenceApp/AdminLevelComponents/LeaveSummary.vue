<template>
  <v-card class="leave-summary-card">
    <v-card-title class="summary-header">
      <div class="header-content">
        <div>
          <h3 class="title">Leave Categories</h3>
        </div>
        <v-btn
          v-if="
            leaveData &&
            leaveData.all_leaves_chronological &&
            Array.isArray(leaveData.all_leaves_chronological) &&
            leaveData.all_leaves_chronological.length > 0
          "
          color="primary"
          variant="outlined"
          prepend-icon="mdi-calendar-clock"
          @click="openAllLeavesDialog"
          class="view-all-leaves-btn"
          size="small"
        >
          Leaves
          <span class="leaves-count">({{ totalLeavesCount || 0 }})</span>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="content-area">
      <!-- Leave Categories -->
      <div class="section">
        <!-- Show message when no leave categories -->
        <div
          v-if="
            !leaveData.leave_categories ||
            leaveData.leave_categories.length === 0
          "
          class="no-data-container"
        >
          <div class="no-data-content">
            <v-icon size="64" color="#9E9E9E" class="no-data-icon">
              mdi-calendar-blank
            </v-icon>
            <h4 class="no-data-title">No Leave Categories Available</h4>
            <p class="no-data-message">
              {{
                loading
                  ? "Loading leave information..."
                  : "No leave categories have been configured yet."
              }}
            </p>
          </div>
        </div>

        <!-- Show leave categories grid when available -->
        <div v-else class="categories-grid">
          <v-card
            v-for="category in leaveData.leave_categories"
            :key="category.category"
            class="category-card"
            elevation="2"
            @click="openLeaveDetailsDialog(category)"
            style="cursor: pointer"
          >
            <v-card-text class="category-content">
              <div class="category-header">
                <div class="category-info">
                  <h4 class="category-name">
                    {{ category?.category || "N/A" }}
                  </h4>
                  <p class="category-description" v-if="category?.description">
                    {{ category.description }}
                  </p>
                </div>
                <div class="category-icon">
                  <v-icon
                    :color="getCategoryColor(category?.category)"
                    size="24"
                  >
                    {{ getCategoryIcon(category?.category) }}
                  </v-icon>
                </div>
              </div>

              <div class="category-stats">
                <div class="stat-row">
                  <span class="stat-label">Allocated:</span>
                  <span class="stat-value">{{ category?.allocated || 0 }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Used:</span>
                  <span class="stat-value used">{{ category?.used || 0 }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Remaining:</span>
                  <span class="stat-value remaining">{{
                    category?.remaining || 0
                  }}</span>
                </div>
              </div>

              <div
                class="progress-container"
                v-if="category?.allocated && category.allocated > 0"
              >
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{
                      width:
                        Math.min(
                          ((category?.used || 0) / (category?.allocated || 1)) *
                            100,
                          100
                        ) + '%',
                    }"
                  ></div>
                </div>
                <div class="progress-text">
                  {{
                    Math.round(
                      ((category?.used || 0) / (category?.allocated || 1)) * 100
                    )
                  }}% used
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>

    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!-- Leave Details Dialog -->
    <v-dialog v-model="showLeaveDetailsDialog" max-width="600" scrollable>
      <v-card>
        <v-card-title class="dialog-header">
          <div class="dialog-title-content">
            <v-icon
              :color="
                selectedCategory
                  ? getCategoryColor(selectedCategory.category)
                  : '#9C27B0'
              "
              size="28"
              class="dialog-icon"
            >
              {{
                selectedCategory
                  ? getCategoryIcon(selectedCategory.category)
                  : "mdi-calendar"
              }}
            </v-icon>
            <div>
              <h3 class="dialog-title">
                {{ selectedCategory?.category || "Leave Details" }}
              </h3>
              <p class="dialog-subtitle" v-if="selectedCategory?.code">
                Code: {{ selectedCategory.code }}
              </p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeLeaveDetailsDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="dialog-content">
          <!-- Summary Stats -->
          <div v-if="selectedCategory" class="summary-section">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Allocated</span>
                <span class="summary-value">{{
                  selectedCategory?.allocated || 0
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Used</span>
                <span class="summary-value used">{{
                  selectedCategory?.used || 0
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Remaining</span>
                <span class="summary-value remaining">{{
                  selectedCategory?.remaining || 0
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Utilization</span>
                <span class="summary-value"
                  >{{
                    selectedCategory?.utilization_rate
                      ? typeof selectedCategory.utilization_rate === "number"
                        ? selectedCategory.utilization_rate.toFixed(1)
                        : 0
                      : 0
                  }}%</span
                >
              </div>
            </div>

            <!-- Breakdown -->
            <div
              v-if="
                selectedCategory?.breakdown &&
                typeof selectedCategory.breakdown === 'object'
              "
              class="breakdown-section"
            >
              <h4 class="section-heading">Breakdown</h4>
              <div class="breakdown-grid">
                <div class="breakdown-item">
                  <v-icon size="20" color="#4CAF50">mdi-calendar-check</v-icon>
                  <div>
                    <span class="breakdown-label">Full Days</span>
                    <span class="breakdown-value">{{
                      selectedCategory.breakdown?.full_days || 0
                    }}</span>
                  </div>
                </div>
                <div class="breakdown-item">
                  <v-icon size="20" color="#FF9800">mdi-calendar-clock</v-icon>
                  <div>
                    <span class="breakdown-label">Half Days</span>
                    <span class="breakdown-value">{{
                      selectedCategory.breakdown?.half_days || 0
                    }}</span>
                  </div>
                </div>
                <div class="breakdown-item">
                  <v-icon size="20" color="#2196F3"
                    >mdi-file-document-multiple</v-icon
                  >
                  <div>
                    <span class="breakdown-label">Total Applications</span>
                    <span class="breakdown-value">{{
                      selectedCategory.breakdown?.total_applications || 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dates Taken -->
            <div class="dates-section">
              <h4 class="section-heading">
                Dates Taken
                <span
                  class="dates-count"
                  v-if="
                    selectedCategory?.dates_taken &&
                    Array.isArray(selectedCategory.dates_taken)
                  "
                >
                  ({{ selectedCategory.dates_taken.length }})
                </span>
              </h4>

              <!-- No dates message -->
              <div
                v-if="
                  !selectedCategory?.dates_taken ||
                  !Array.isArray(selectedCategory.dates_taken) ||
                  selectedCategory.dates_taken.length === 0
                "
                class="no-dates-message"
              >
                <v-icon size="48" color="#9E9E9E">mdi-calendar-blank</v-icon>
                <p>No leave dates taken yet</p>
              </div>

              <!-- Dates list -->
              <div v-else class="dates-list">
                <template
                  v-for="(dateItem, index) in selectedCategory.dates_taken"
                  :key="index"
                >
                  <div
                    v-if="dateItem && typeof dateItem === 'object'"
                    class="date-item"
                  >
                    <div class="date-info">
                      <div class="date-main">
                        <v-icon
                          :color="
                            dateItem.type && dateItem.type === 'Full Day'
                              ? '#4CAF50'
                              : '#FF9800'
                          "
                          size="20"
                        >
                          {{
                            dateItem.type && dateItem.type === "Full Day"
                              ? "mdi-calendar-check"
                              : "mdi-calendar-clock"
                          }}
                        </v-icon>
                        <span class="date-text">{{
                          formatDate(dateItem?.date) || "N/A"
                        }}</span>
                      </div>
                      <div class="date-meta">
                        <span
                          class="date-type"
                          :class="
                            dateItem.type && dateItem.type === 'Full Day'
                              ? 'full-day'
                              : 'half-day'
                          "
                        >
                          {{ dateItem?.type || "N/A" }}
                        </span>
                        <span class="date-duration"
                          >{{ dateItem?.duration || 0 }} day{{
                            (dateItem?.duration || 0) !== 1 ? "s" : ""
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="closeLeaveDetailsDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- All Leaves Chronological Dialog -->
    <v-dialog v-model="showAllLeavesDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="dialog-header">
          <div class="dialog-title-content">
            <v-icon color="#2196F3" size="28" class="dialog-icon">
              mdi-calendar-clock
            </v-icon>
            <div>
              <h3 class="dialog-title">Leaves</h3>
              <p
                class="dialog-subtitle"
                v-if="
                  leaveData &&
                  leaveData.all_leaves_chronological &&
                  Array.isArray(leaveData.all_leaves_chronological) &&
                  leaveData.all_leaves_chronological.length > 0
                "
              >
                Total: {{ totalLeavesCount || 0 }} leaves taken
              </p>
            </div>
          </div>
          <v-btn icon variant="text" size="small" @click="closeAllLeavesDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="dialog-content">
          <!-- All Leaves by Month -->
          <div
            v-if="
              groupedLeaves &&
              typeof groupedLeaves === 'object' &&
              Object.keys(groupedLeaves).length > 0
            "
            class="chronological-section"
          >
            <div
              v-for="(leaves, month) in groupedLeaves"
              :key="month"
              class="month-group"
            >
              <h4 class="month-heading">
                <v-icon size="20" color="#2196F3">mdi-calendar-month</v-icon>
                {{ formatMonth(month) }}
                <span class="month-count"
                  >({{ getMonthTotal(leaves) || 0 }} leave{{
                    getMonthTotal(leaves) !== 1 ? "s" : ""
                  }})</span
                >
              </h4>
              <div
                class="leaves-list"
                v-if="leaves && Array.isArray(leaves) && leaves.length > 0"
              >
                <template v-for="(leave, index) in leaves" :key="index">
                  <div
                    v-if="leave && typeof leave === 'object'"
                    class="leave-item"
                  >
                    <div class="leave-info">
                      <div class="leave-main">
                        <v-icon
                          :color="
                            leave.duration && leave.duration === 'Full Day'
                              ? '#4CAF50'
                              : '#FF9800'
                          "
                          size="20"
                        >
                          {{
                            leave.duration && leave.duration === "Full Day"
                              ? "mdi-calendar-check"
                              : "mdi-calendar-clock"
                          }}
                        </v-icon>
                        <div class="leave-details">
                          <span class="leave-date">{{
                            formatDate(leave.date) || "N/A"
                          }}</span>
                          <span class="leave-type">{{
                            leave.leave_type || "N/A"
                          }}</span>
                        </div>
                      </div>
                      <div class="leave-meta">
                        <span
                          class="leave-duration-badge"
                          :class="
                            leave.duration && leave.duration === 'Full Day'
                              ? 'full-day'
                              : 'half-day'
                          "
                        >
                          {{ leave.duration || "N/A" }}
                        </span>
                        <span class="leave-code">{{
                          leave.leave_code || "N/A"
                        }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- No leaves message -->
          <div v-else class="no-dates-message">
            <v-icon size="48" color="#9E9E9E">mdi-calendar-blank</v-icon>
            <p>No leaves taken yet</p>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="closeAllLeavesDialog">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_my_leaves } from "@/graphql/queries.js";

export default {
  name: "LeaveSummary",
  components: {
    SnackBar,
  },
  data() {
    return {
      loading: false,
      SnackBarComponent: {},
      leaveData: {
        leave_categories: [],
        all_leaves_chronological: [],
        summary: null,
      },
      showLeaveDetailsDialog: false,
      selectedCategory: null,
      showAllLeavesDialog: false,
    };
  },
  computed: {
    groupedLeaves() {
      if (
        !this.leaveData ||
        !this.leaveData.all_leaves_chronological ||
        !Array.isArray(this.leaveData.all_leaves_chronological) ||
        this.leaveData.all_leaves_chronological.length === 0
      ) {
        return {};
      }

      const grouped = {};
      this.leaveData.all_leaves_chronological.forEach((leave) => {
        if (!leave || typeof leave !== "object") return;
        const month =
          leave.month && typeof leave.month === "string"
            ? leave.month
            : this.getMonthFromDate(leave?.date);
        if (month && month.trim() !== "") {
          if (!grouped[month]) {
            grouped[month] = [];
          }
          grouped[month].push(leave);
        }
      });

      // Sort months chronologically
      const sortedMonths = Object.keys(grouped)
        .filter((month) => month && month.trim() !== "")
        .sort((a, b) => {
          try {
            const partsA = a.split("-").map(Number);
            const partsB = b.split("-").map(Number);
            if (partsA.length !== 2 || partsB.length !== 2) return 0;
            const [monthA, yearA] = partsA;
            const [monthB, yearB] = partsB;
            if (isNaN(yearA) || isNaN(yearB) || isNaN(monthA) || isNaN(monthB))
              return 0;
            if (yearA !== yearB) return yearA - yearB;
            return monthA - monthB;
          } catch (e) {
            return 0;
          }
        });

      const sortedGrouped = {};
      sortedMonths.forEach((month) => {
        if (grouped[month] && Array.isArray(grouped[month])) {
          sortedGrouped[month] = grouped[month];
        }
      });

      return sortedGrouped;
    },
    totalLeavesCount() {
      if (
        !this.leaveData ||
        !this.leaveData.all_leaves_chronological ||
        !Array.isArray(this.leaveData.all_leaves_chronological) ||
        this.leaveData.all_leaves_chronological.length === 0
      ) {
        return 0;
      }
      try {
        return this.leaveData.all_leaves_chronological.reduce(
          (total, leave) => {
            if (!leave || typeof leave !== "object") return total;
            const duration = parseFloat(leave.duration_value);
            return total + (isNaN(duration) ? 0 : duration);
          },
          0
        );
      } catch (e) {
        return 0;
      }
    },
  },
  mounted() {
    this.$store.commit("SetattendenceBack", false);
    // console.log("LeaveSummary component mounted");
    this.fetchLeaveSummary();
  },
  methods: {
    async fetchLeaveSummary() {
      // console.log("fetchLeaveSummary called");
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_my_leaves, { input: {} })
        );
        // console.log("API result:", result);
        const response = JSON.parse(result.data.list_my_leaves);
        // console.log("Response:", response);
        if (response && response.status == "SUCCESS" && response.data) {
          // console.log("Response data:", response.data);
          this.leaveData = {
            leave_categories: Array.isArray(response.data.leave_categories)
              ? response.data.leave_categories
              : [],
            all_leaves_chronological: Array.isArray(
              response.data.all_leaves_chronological
            )
              ? response.data.all_leaves_chronological
              : [],
            summary: response.data.summary || null,
          };
        } else {
          this.leaveData = {
            leave_categories: [],
            all_leaves_chronological: [],
            summary: null,
          };
        }
      } catch (error) {
        console.error("Error fetching leave summary:", error);
        this.leaveData = {
          leave_categories: [],
          all_leaves_chronological: [],
          summary: null,
        };
      } finally {
        this.loading = false;
      }
    },

    getCategoryColor(category) {
      if (!category) return "#9C27B0";
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes("casual")) return "#FF9800";
      if (categoryLower.includes("paid")) return "#4CAF50";
      if (categoryLower.includes("general")) return "#2196F3";
      if (categoryLower.includes("maternity")) return "#E91E63";
      if (categoryLower.includes("wedding")) return "#9C27B0";
      if (
        categoryLower.includes("loss of pay") ||
        categoryLower.includes("lop")
      )
        return "#757575";
      return "#9C27B0";
    },

    getCategoryIcon(category) {
      if (!category) return "mdi-calendar";
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes("casual")) return "mdi-calendar-clock";
      if (categoryLower.includes("paid")) return "mdi-calendar-check";
      if (categoryLower.includes("general")) return "mdi-calendar-multiple";
      if (categoryLower.includes("maternity")) return "mdi-baby-face-outline";
      if (categoryLower.includes("wedding")) return "mdi-heart";
      if (
        categoryLower.includes("loss of pay") ||
        categoryLower.includes("lop")
      )
        return "mdi-calendar-remove";
      return "mdi-calendar";
    },

    openLeaveDetailsDialog(category) {
      if (!category || typeof category !== "object") {
        return;
      }
      this.selectedCategory = category;
      this.showLeaveDetailsDialog = true;
    },

    closeLeaveDetailsDialog() {
      this.showLeaveDetailsDialog = false;
      this.selectedCategory = null;
    },

    formatDate(dateString) {
      if (!dateString || typeof dateString !== "string") return "";
      try {
        // Format: DD-MM-YYYY to readable format
        const parts = dateString.split("-");
        if (parts.length === 3) {
          const day = parts[0] || "";
          const month = parts[1] || "";
          const year = parts[2] || "";
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const monthIndex = parseInt(month) - 1;
          if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
            return dateString;
          }
          return `${day} ${monthNames[monthIndex] || month}, ${year}`;
        }
        return dateString;
      } catch (e) {
        return dateString || "";
      }
    },

    formatMonth(monthString) {
      if (!monthString || typeof monthString !== "string") return "";
      try {
        // Format: MM-YYYY to readable format
        const parts = monthString.split("-");
        if (parts.length === 2) {
          const month = parts[0] || "";
          const year = parts[1] || "";
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const monthIndex = parseInt(month) - 1;
          if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
            return monthString;
          }
          return `${monthNames[monthIndex] || month} ${year}`;
        }
        return monthString;
      } catch (e) {
        return monthString || "";
      }
    },

    getMonthFromDate(dateString) {
      if (!dateString || typeof dateString !== "string") return "";
      try {
        // Extract month-year from DD-MM-YYYY
        const parts = dateString.split("-");
        if (parts.length === 3 && parts[1] && parts[2]) {
          return `${parts[1]}-${parts[2]}`;
        }
        return "";
      } catch (e) {
        return "";
      }
    },

    openAllLeavesDialog() {
      this.showAllLeavesDialog = true;
    },

    closeAllLeavesDialog() {
      this.showAllLeavesDialog = false;
    },

    getMonthTotal(leaves) {
      if (!leaves || !Array.isArray(leaves) || leaves.length === 0) return 0;
      try {
        return leaves.reduce((total, leave) => {
          if (!leave || typeof leave !== "object") return total;
          const duration = parseFloat(leave.duration_value);
          return total + (isNaN(duration) ? 0 : duration);
        }, 0);
      } catch (e) {
        return 0;
      }
    },
  },
};
</script>

<style scoped>
.leave-summary-card {
  background: white !important;
  border-radius: 0 !important;
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.summary-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px !important;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 550;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 14\px;
}

.content-area {
  overflow-y: auto;
  padding: 20px !important;
  background: white;
  flex: 1;
  margin-top: -15px;
  min-height: 0;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.category-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 0; /* Prevent overflow */
}

.category-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.category-content {
  padding: 16px !important;
  min-width: 0; /* Prevent overflow */
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.category-info {
  flex: 1;
  min-width: 0; /* Prevent text overflow */
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.category-description {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.category-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

.category-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-row .stat-label {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  flex-shrink: 0;
}

.stat-row .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: right;
  min-width: 0;
  flex-shrink: 0;
}

.stat-row .stat-value.used {
  color: #f44336;
}

.stat-row .stat-value.remaining {
  color: #4caf50;
}

.progress-container {
  margin-top: 8px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #6c757d;
  text-align: center;
}

/* No data styles */
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 20px;
}

.no-data-content {
  text-align: center;
  max-width: 400px;
}

.no-data-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-data-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.no-data-message {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .leave-summary-card {
    height: 100vh;
  }

  .content-area {
    padding: 12px !important;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-header {
    padding: 12px 16px !important;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .view-all-leaves-btn {
    align-self: flex-end;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 13px;
  }

  .category-content {
    padding: 12px !important;
  }

  .category-name {
    font-size: 15px;
  }

  .category-description {
    font-size: 11px;
  }

  .stat-row .stat-label {
    font-size: 12px;
  }

  .stat-row .stat-value {
    font-size: 13px;
  }

  /* No data responsive styles */
  .no-data-container {
    min-height: 250px;
    padding: 30px 16px;
  }

  .no-data-icon {
    font-size: 48px !important;
  }

  .no-data-title {
    font-size: 16px;
  }

  .no-data-message {
    font-size: 13px;
  }
}

/* Small mobile screens */
@media (max-width: 480px) {
  .content-area {
    padding: 8px !important;
  }

  .summary-header {
    padding: 10px 12px !important;
  }

  .title {
    font-size: 18px;
  }

  .subtitle {
    font-size: 12px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .category-content {
    padding: 10px !important;
  }

  .category-name {
    font-size: 14px;
  }

  .category-description {
    font-size: 10px;
  }

  .stat-row .stat-label {
    font-size: 11px;
  }

  .stat-row .stat-value {
    font-size: 12px;
  }

  .progress-text {
    font-size: 10px;
  }
}

/* Extra small screens */
@media (max-width: 360px) {
  .content-area {
    padding: 6px !important;
  }

  .summary-header {
    padding: 8px 10px !important;
  }

  .title {
    font-size: 16px;
  }

  .subtitle {
    font-size: 11px;
  }

  .category-content {
    padding: 8px !important;
  }

  .category-name {
    font-size: 13px;
  }

  .category-description {
    font-size: 9px;
  }

  .stat-row .stat-label {
    font-size: 10px;
  }

  .stat-row .stat-value {
    font-size: 11px;
  }

  .progress-text {
    font-size: 9px;
  }
}

/* Dialog Styles */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px !important;
  border-bottom: 1px solid #e9ecef;
}

.dialog-title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  flex-shrink: 0;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.dialog-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 4px 0 0 0;
}

.dialog-content {
  padding: 24px !important;
  max-height: 60vh;
  overflow-y: auto;
}

.summary-section {
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-value.used {
  color: #f44336;
}

.summary-value.remaining {
  color: #4caf50;
}

.breakdown-section {
  margin-bottom: 24px;
}

.section-heading {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dates-count {
  font-size: 14px;
  font-weight: 400;
  color: #6c757d;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.breakdown-item > div {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.breakdown-label {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 2px;
}

.breakdown-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.dates-section {
  margin-top: 24px;
}

.no-dates-message {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-dates-message p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

.dates-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  align-items: flex-start;
  width: 100%;
}

.date-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.date-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.date-info {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  width: 100%;
}

.date-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-start;
}

.date-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.date-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-type {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.date-type.full-day {
  background: #e8f5e9;
  color: #4caf50;
}

.date-type.half-day {
  background: #fff3e0;
  color: #ff9800;
}

.date-duration {
  font-size: 12px;
  color: #6c757d;
}

.dialog-actions {
  padding: 12px 24px !important;
  border-top: 1px solid #e9ecef;
}

/* View All Leaves Button */
.view-all-leaves-btn {
  text-transform: none;
  font-weight: 500;
  flex-shrink: 0;
}

.leaves-count {
  margin-left: 4px;
  font-weight: 600;
  opacity: 0.8;
}

/* Chronological Section */
.chronological-section {
  margin-top: 24px;
}

.month-group {
  margin-bottom: 24px;
}

.month-group:last-child {
  margin-bottom: 0;
}

.month-heading {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.month-count {
  font-size: 14px;
  font-weight: 400;
  color: #6c757d;
  margin-left: 4px;
}

.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leave-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.leave-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.leave-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.leave-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.leave-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.leave-date {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.leave-type {
  font-size: 12px;
  color: #6c757d;
}

.leave-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leave-duration-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.leave-duration-badge.full-day {
  background: #e8f5e9;
  color: #4caf50;
}

.leave-duration-badge.half-day {
  background: #fff3e0;
  color: #ff9800;
}

.leave-code {
  font-size: 12px;
  font-weight: 600;
  color: #2196f3;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 4px;
}

/* Chronological Section */
.chronological-section {
  margin-top: 24px;
}

.month-group {
  margin-bottom: 24px;
}

.month-group:last-child {
  margin-bottom: 0;
}

.month-heading {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.month-count {
  font-size: 14px;
  font-weight: 400;
  color: #6c757d;
  margin-left: 4px;
}

.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leave-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.leave-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.leave-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.leave-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.leave-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.leave-date {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.leave-type {
  font-size: 12px;
  color: #6c757d;
}

.leave-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leave-duration-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.leave-duration-badge.full-day {
  background: #e8f5e9;
  color: #4caf50;
}

.leave-duration-badge.half-day {
  background: #fff3e0;
  color: #ff9800;
}

.leave-code {
  font-size: 12px;
  font-weight: 600;
  color: #2196f3;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 4px;
}

/* Mobile responsive for dialog */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .date-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .date-meta {
    width: 100%;
    justify-content: space-between;
  }

  .dialog-content {
    padding: 16px !important;
    max-height: 70vh;
  }

  .leave-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .leave-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
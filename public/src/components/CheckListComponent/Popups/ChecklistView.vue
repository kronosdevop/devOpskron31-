<template>
  <v-container fluid>
    <v-toolbar elevation="0" dark density="compact" class="navBar ml-n2">
      <v-toolbar-title class="text--black"
        ><div class="custom-title">Checklist Overview</div>
      </v-toolbar-title>
      <v-spacer />
      <v-icon class="icon-class" @click="close_card()">mdi-close</v-icon>
    </v-toolbar>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="" outlined>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12" sm="12" class="mt-2"
                ><span class="black--text">Checklist Name:</span>
                {{ checklist.checklist_name }}</v-col
              >
              <v-col cols="12" sm="12" class="mt-2"
                ><span class="black--text">Master Checklist Name:</span>
                {{ checklist.master_checklist_name }}</v-col
              >
              <v-col cols="12" sm="12" class="mt-2"
                ><span class="black--text">Created On:</span>
                {{ formatDate(checklist.checklist_created_on) }}</v-col
              >
              <v-col cols="12" sm="12" class="mt-2"
              v-if="checklist.checklist_end_date != null && checklist.checklist_end_date != undefined"
                ><span class="black--text">End Date:</span>
                {{ formatdisplayDates(checklist.checklist_end_date) }}</v-col
              >
             
              <v-col cols="12" class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="black--text">Progress</span>
                  <span class="text-body-2"
                    >{{ checklist.completion_percentage }}%</span
                  >
                </div>

                <v-progress-linear
                  :model-value="checklist.completion_percentage"
                  height="10"
                  color="primary"
                  rounded
                  background-color="grey lighten-3"
                />
              </v-col>

              <v-col cols="12" sm="12" class="mt-2">
                <div
                  class="d-flex align-center justify-space-between text-body-2 mb-1"
                >
                  <span style="color: black"
                    ><v-icon size="small" color="blue"
                      >mdi-format-list-checks</v-icon
                    >Total: {{ checklist.total_assigned_checklists }}
                  </span>
                  <span style="color: black"
                    ><v-icon size="small" color="green"
                      >mdi-checkbox-multiple-marked-outline</v-icon
                    >Competed: {{ checklist.total_completed_checklists }}
                  </span>
                  <span style="color: black"
                    ><v-icon size="small" color="red">mdi-timer-sand</v-icon
                    >Pending:
                    {{ checklist.total_pending_checklists }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mt-4" outlined>
          <v-card-title class="subtitle-1 font-weight-medium">
            Total Assignees - {{ visibleMembers.length }}
          </v-card-title>
          <v-card-text class="scrollable-tablecard">
            <v-data-table
              :headers="userHeaders"
              :items="visibleMembers"
              :items-per-page="500"
              density="compact"
              hide-default-footer
              item-key="user_id"
              class="elevation-1 mt-n8"
              @click:row="handleUserSelect"
              :item-class="rowClass"
            >
              <template #[`item.userDetail`]="{ item }">
                <div class="d-flex align-start">
                  <v-avatar
                    size="36"
                    class="mr-3"
                    :color="
                      hasValidPic(item.user_profile_pic_url)
                        ? undefined
                        : getColor(item.full_user_name)
                    "
                  >
                    <template v-if="hasValidPic(item.user_profile_pic_url)">
                      <v-img :src="item.user_profile_pic_url" />
                    </template>
                    <template v-else>
                      <span class="white--text font-weight-bold">
                        {{ firstLetter(item.full_user_name) }}
                      </span>
                    </template>
                  </v-avatar>

                  <div class="d-flex flex-column">
                    <span class="font-weight-medium">{{
                      item.full_user_name
                    }}</span>
                    <span class="text-caption grey-darken-4--text">{{
                      item.user_email_id
                    }}</span>
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 scrollable-card" outlined v-if="CardValue == 1">
          <v-card-text>
            <div
              class="d-flex align-center justify-space-between text-body-2 mb-1"
            >
              <h4 class="font-weight-bold mb-2 black--text">Section Items</h4>

              <v-menu v-model="filterMenu" location="bottom">
                <template #activator="{ props }">
                  <v-tooltip location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        icon
                        v-bind="props"
                        v-on="tooltipProps"
                        color="primary"
                        class="ml-2"
                        size="x-small"
                      >
                        <v-icon size="20">mdi-filter</v-icon>
                      </v-btn>
                    </template>
                    <span>Filter by Progress</span>
                  </v-tooltip>
                </template>

                <v-list>
                  <v-list-item
                    v-for="option in filterOptions"
                    :key="option.value"
                    @click="selectedStatus = option.value"
                    density="compact"
                  >
                    <v-list-item-title>{{ option.text }}</v-list-item-title>
                    <template #append>
                      <v-icon
                        v-if="selectedStatus === option.value"
                        color="green"
                        size="small"
                      >
                        mdi-check
                      </v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <v-divider class="mb-2"></v-divider>

            <div
              v-for="(items, section) in filteredGroupedSections"
              :key="section"
              class="mb-6"
            >
              <span class="font-weight-bold black--text mb-2">
                <v-icon size="small" color="blue">mdi-folder-plus</v-icon>
                {{ section }}
              </span>

              <v-list density="compact">
                <v-list-item
                  v-for="task in items"
                  :key="task.assigned_id"
                  class="py-1"
                >
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      {{ task.checklist_name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ task.item_description }}
                    </v-list-item-subtitle>
                    <div
                      class="d-flex align-center justify-space-between text-body-2 mb-1"
                    >
                      <div style="color: #757575">
                        Assigned To:
                        <span style="color: black">
                          {{ task.assigned_to_name }}</span
                        >
                      </div>
                      <v-chip
                        :class="getStatusChipClass(task.progress_status)"
                        class="text-caption font-weight-medium"
                        size="small"
                      >
                        {{ getStatusText(task.progress_status) }}
                      </v-chip>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>

            <!-- Line Items -->
            <v-divider class="my-4"></v-divider>
            <div v-if="filteredLineItems.length">
              <h4 class="font-weight-bold mb-2 black--text">Line Items</h4>
              <v-divider class="mb-2"></v-divider>
              <v-list density="compact">
                <v-list-item
                  v-for="li in filteredLineItems"
                  :key="li.assigned_id"
                  class="py-1"
                >
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      <v-icon size="small" color="green"
                        >mdi-format-line-weight</v-icon
                      >
                      {{ li.checklist_name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ li.section_description }}
                    </v-list-item-subtitle>
                    <div
                      class="d-flex align-center justify-space-between text-body-2 mb-1"
                    >
                      <div style="color: #757575">
                        Assigned To:
                        <span style="color: black">
                          {{ li.assigned_to_name }}</span
                        >
                      </div>
                      <v-chip
                        :class="getStatusChipClass(li.progress_status)"
                        class="text-caption font-weight-medium"
                        size="small"
                      >
                        {{ getStatusText(li.progress_status) }}
                      </v-chip>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="CardValue == 2" class="pa-4 scrollable-card" outlined>
          <v-toolbar
            elevation="0"
            dark
            density="compact"
            class="navBar bg-white"
          >
            <v-toolbar-title class="text--black"
              ><div class="custom-title">User Task Details</div>
            </v-toolbar-title>
            <v-spacer />
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  color="red"
                  @click="CardValue = 1"
                  class="mr-2"
                  size="x-small"
                >
                  mdi-send-check-outline
                </v-icon>
              </template>
              <span>Go Back to All Task Detail</span>
            </v-tooltip>
          </v-toolbar>

          <v-card-text>
            <!-- User Profile -->
            <v-row align="center">
              <v-col cols="4">
                <v-avatar
                  size="100"
                  class="mr-3"
                  :color="
                    hasValidPic(selectedUser.user_profile_pic_url)
                      ? undefined
                      : getColor(selectedUser.full_user_name)
                  "
                >
                  <template
                    v-if="hasValidPic(selectedUser.user_profile_pic_url)"
                  >
                    <v-img :src="selectedUser.user_profile_pic_url" />
                  </template>
                  <template v-else>
                    <span class="white--text font-weight-bold display-2">
                      {{ firstLetter(selectedUser.full_user_name) }}
                    </span>
                  </template>
                </v-avatar>
              </v-col>
              <v-col cols="8">
                <h3 class="mb-1 black--text">
                  {{ selectedUser.full_user_name }}
                </h3>
                <p class="text-caption black--text mb-0">
                  {{ selectedUser.user_email_id }}
                </p>
              </v-col>
            </v-row>

            <v-divider class="my-4" />
            <template v-if="hasTasks">
              <!-- Grouped Sections -->
              <div
                v-for="(tasks, sectionTitle) in groupedSections1"
                :key="sectionTitle"
                class="mb-6"
              >
                <h4 class="font-weight-bold mb-2 black--text">
                  <v-icon size="small" color="blue">mdi-folder-plus</v-icon>
                  {{ sectionTitle }}
                </h4>
                <v-list density="compact">
                  <v-list-item
                    v-for="task in tasks"
                    :key="task.assigned_id"
                    class="mb-3"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium">
                        {{ task.checklist_name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>{{
                        task.item_description
                      }}</v-list-item-subtitle>

                      <div
                        class="d-flex align-center justify-space-between text-body-2 mb-1"
                      >
                        <div style="color: #757575">
                          Assigned To:
                          <span style="color: black">
                            {{ task.assigned_to_name }}</span
                          >
                        </div>
                        <v-chip
                          :class="getStatusChipClass(task.progress_status)"
                          class="text-caption font-weight-medium"
                          size="small"
                        >
                          {{ getStatusText(task.progress_status) }}
                        </v-chip>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>

              <v-divider class="my-4" />

              <!-- Line Items Section -->
              <div v-if="lineItems1.length">
                <h4 class="font-weight-bold mb-2 black--text">Line Items</h4>
                <v-list density="compact">
                  <v-list-item
                    v-for="task in lineItems1"
                    :key="task.assigned_id"
                    class="mb-3"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium">
                        <v-icon size="small" color="green"
                          >mdi-format-line-weight</v-icon
                        >
                        {{ task.checklist_name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>{{
                        task.section_description
                      }}</v-list-item-subtitle>

                      <div
                        class="d-flex align-center justify-space-between text-body-2 mb-1"
                      >
                        <div style="color: #757575">
                          Assigned To:
                          <span style="color: black">
                            {{ task.assigned_to_name }}</span
                          >
                        </div>
                        <v-chip
                          :class="getStatusChipClass(task.progress_status)"
                          class="text-caption font-weight-medium"
                          size="small"
                        >
                          {{ getStatusText(task.progress_status) }}
                        </v-chip>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </template>
            <template v-else>
              <div class="text-center grey--text">
                <v-icon large color="grey lighten-1"
                  >mdi-information-outline</v-icon
                >
                <div class="mt-2">No task is assigned</div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

export default {
  mixins: [get_all_org_users],

  data() {
    return {
      checklist: {},
      selectedUser: null,
      userHeaders: [{ text: "", value: "userDetail", sortable: false }],
      CardValue: 1,
      selectedStatus: null,
      name: "",
      filterMenu: false,
      filterOptions: [
        { text: "All", value: null },
        { text: "Yet to start", value: "PENDING" },
        { text: "Started", value: "STARTED" },
        { text: "Completed", value: "COMPLETED" },
      ],
    };
  },
  async created() {
    const data = this.$store.getters.GetChecklist;
    // console.log("Checklist from store:", data);
    this.checklist = data || {};
    await this.get_all_org_users();
    this.fetch_user_list();
  },
  computed: {
    visibleMembers() {
      if (!this.orgUsers) return [];

      if (
        !this.checklist.checklist_visible_members ||
        this.checklist.checklist_visible_members.length === 0
      ) {
        return this.orgUsers.filter((user) => user.user_status === "ACTIVE");
      }
      return this.checklist.checklist_visible_members
        .map((id) => this.orgUsers.find((u) => u.user_id === id))
        .filter(Boolean);
    },

    groupedSections() {
      const out = {};
      const details = this.checklist?.checklist_details || {};
      Object.entries(details).forEach(([sectionName, arr]) => {
        if (sectionName !== "line_items") {
          out[sectionName.trim()] = arr.filter(
            (t) => t.section_type === "section"
          );
        }
      });
      return out;
    },

    lineItems() {
      const li = this.checklist?.checklist_details?.line_items || [];
      return li.filter((t) => t.section_type === "line_item");
    },

    filteredGroupedSections() {
      const filtered = {};
      for (const [section, items] of Object.entries(this.groupedSections)) {
        const matching = items.filter(
          (item) =>
            !this.selectedStatus || item.progress_status === this.selectedStatus
        );
        if (matching.length > 0) {
          filtered[section] = matching;
        }
      }
      return filtered;
    },

    filteredLineItems() {
      return this.lineItems.filter(
        (li) =>
          !this.selectedStatus || li.progress_status === this.selectedStatus
      );
    },
    groupedSections1() {
      if (!this.selectedUser || !this.selectedUser.checklist_details) {
        return {};
      }

      const sections = {};
      for (const [sectionTitle, tasks] of Object.entries(
        this.selectedUser.checklist_details
      )) {
        const sectionTasks = tasks.filter((t) => t.section_type === "section");
        if (sectionTasks.length > 0) {
          sections[sectionTitle] = sectionTasks;
        }
      }
      return sections;
    },
    lineItems1() {
      if (!this.selectedUser || !this.selectedUser.checklist_details) {
        return [];
      }

      const items = [];
      for (const tasks of Object.values(this.selectedUser.checklist_details)) {
        items.push(...tasks.filter((t) => t.section_type === "line_item"));
      }
      return items;
    },
    hasTasks() {
      const hasSections =
        this.groupedSections1 &&
        Object.values(this.groupedSections1).some((tasks) => tasks.length > 0);
      const hasLineItems = this.lineItems1 && this.lineItems1.length > 0;
      return hasSections || hasLineItems;
    },
  },

  methods: {
    formatdisplayDates(date) {
      return formatdisplayDate(date);
    },
    fetch_user_list() {
      this.userProfiles = {};
      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          const profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (profilePicUrl && profilePicUrl !== "N/A") {
            this.userProfiles[email] = profilePicUrl;
          } else {
            const initials = this.getInitials(name);
            this.userProfiles[email] = initials;
          }
        }
      });
    },
    getInitials(name) {
      if (typeof name !== "string" || name.trim() === "") {
        return "N/A";
      }
      const initials = name.charAt(0).toUpperCase();
      return initials || "N/A";
    },
    hasValidPic(url) {
      return url && url !== "N/A";
    },
    getColor(name) {
      if (!name || typeof name !== "string") {
        return "grey lighten-2"; // Default color for undefined/null names
      }

      const palette = [
        "indigo lighten-2",
        "deep-orange lighten-2",
        "teal lighten-2",
        "blue lighten-2",
        "green lighten-2",
        "purple lighten-2",
        "cyan lighten-2",
        "pink lighten-2",
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    },
    getProgressColor(value) {
      if (value < 40) return "red";
      if (value < 80) return "blue";
      if (value === 100) return "green";
      return "orange";
    },
    handleUserSelect(click, value) {
      const item = value.item;
      if (!this.checklist || !this.checklist.checklist_details) return;

      const userKey = item.full_user_name?.trim().toLowerCase();
      const checklistDetails = this.checklist.checklist_details;
      const filteredChecklist = {};

      Object.entries(checklistDetails).forEach(([sectionName, items]) => {
        if (Array.isArray(items)) {
          const matchedItems = items.filter(
            (entry) => entry.assigned_to_name?.trim().toLowerCase() === userKey
          );

          if (matchedItems.length > 0) {
            filteredChecklist[sectionName] = matchedItems;
          }
        }
      });

      const selectedData = {
        ...item,
        checklist_details: filteredChecklist,
      };
      this.selectUser(selectedData);
    },

    selectUser(userData) {
      this.selectedUser = userData;
      this.CardValue = 2;
    },
    rowClass(item) {
      return this.selectedUser &&
        this.selectedUser.full_user_name === item.full_user_name
        ? "selected-row"
        : "";
    },
    formatDate(ts) {
      if (!ts) return "—";
      return new Date(ts * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    firstLetter(name) {
      return name ? name.charAt(0).toUpperCase() : "?";
    },
    close_card() {
      this.$router.push("/home/CheckList");
    },
    filteredTasks(items) {
      if (!this.selectedStatus) return items;
      return items.filter(
        (task) => task.progress_status === this.selectedStatus
      );
    },
    getStatusText(status) {
      switch (status) {
        case "PENDING":
          return "Yet to Start";
        case "STARTED":
          return "Started";
        case "COMPLETED":
          return "Completed";
        case "NOT_APPLICABLE":
          return "Not Applicable";
        default:
          return status;
      }
    },

    getStatusChipClass(status) {
      if (!status) {
        return "grey lighten-3 grey--text";
      }

      switch (status.toUpperCase()) {
        case "COMPLETED":
          return "success lighten-4 success--text";
        case "STARTED":
          return "warning lighten-4 warning--text";
        case "PENDING":
          return "error lighten-4 error--text";
        case "NOT_APPLICABLE":
          return "info lighten-4 info--text";
        default:
          return "grey lighten-3 grey--text";
      }
    },
  },
};
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
.v-avatar > span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.scrollable-card {
  max-height: 600px !important;
  overflow-y: auto !important;
}
.scrollable-tablecard {
  max-height: 345px !important;
  overflow-y: auto !important;
}

/* Status Chip Styles */
.success--text {
  color: #4caf50 !important;
}
.warning--text {
  color: #ff9800 !important;
}
.error--text {
  color: #f44336 !important;
}
.info--text {
  color: #2196f3 !important;
}
.grey--text {
  color: #9e9e9e !important;
}

.success.lighten-4 {
  background-color: #c8e6c9 !important;
}
.warning.lighten-4 {
  background-color: #ffe0b2 !important;
}
.error.lighten-4 {
  background-color: #ffcdd2 !important;
}
.info.lighten-4 {
  background-color: #bbdefb !important;
}
.grey.lighten-3 {
  background-color: #eeeeee !important;
}
</style>

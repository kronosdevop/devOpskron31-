<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-card flat >
      <v-toolbar
        
        elevation="0"
        density="compact"
      >
        <v-toolbar-title>Edit Checklist</v-toolbar-title>
        <v-spacer />
        <v-btn
          @click="validate_data()"
          dark
          variant="outlined"
          style="background-color: green; color: white"
          :loading="loading"
          size="small"
          class="text-capitalize"
        >
          Update
        </v-btn>
        <v-btn
          depressed
          @click="closeDialog"
          dark
          size="small"
          class="ml-4 mr-2 cardCss text-capitalize"
        >
          Cancel
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-n2">
        <v-form ref="form">
          <v-row>
            <v-col cols="12" sm="5">
              <v-card class="scrollable-card" :height="height">
                <v-card-text>
                  <v-text-field
                    v-model="checklistName"
                    label="Name*"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Name required']"
                  />
                  <v-combobox
                    v-model="restrictedTo"
                    :items="userList"
                    item-text="title"
                    item-value="value"
                    multiple
                    chips
                    color="blue"
                    variant="outlined"
                    density="compact"
                    :return-object="false"
                    prepend-inner-icon="mdi-account"
                    label="Select Users*"
                    :rules="[
                      (v) =>
                        (!!v && v.length > 0) || 'Select at least one user',
                    ]"
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        :key="data.index"
                        size="small"
                        close
                        @click:close="removeUser(data.item)"
                        class="ma-1"
                      >
                        {{ getLabel(data.item) }}
                      </v-chip>
                    </template>
                  </v-combobox>

                  <v-select
                    v-model="type"
                    :items="[
                      { title: 'One-time', value: false },
                      { title: 'Recurring', value: true },
                    ]"
                    label="Checklist Frequency*"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-repeat"
                  />
                  <v-menu
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    v-if="type == false"
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="formattedEndDate"
                        v-bind="props"
                        label="End Date"
                        readonly
                        v-if="type == false"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker
                      v-model="endDate"
                      @update:model-value="endDateMenu = false"
                    />
                  </v-menu>

                  <template v-if="type == true">
                    <v-select
                      v-model="frequency"
                      :items="[
                        'Daily',
                        'Weekly',
                        'Monthly',
                        'Quarterly',
                        'Yearly',
                      ]"
                      label="Recurring Frequency*"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-calendar-sync"
                      :rules="[(v) => !!v || 'Frequency required']"
                    />

                    <v-select
                      v-if="frequency === 'Weekly'"
                      v-model="weeklyDay"
                      :items="days"
                      label="Repeat On (Day of Week)*"
                      variant="outlined"
                      density="compact"
                      :rules="[(v) => !!v || 'Day required']"
                    />

                    <div v-if="frequency === 'Monthly'" class="d-flex">
                      <v-select
                        v-model="month"
                        :items="monthList"
                        label="Month"
                        class="mr-2"
                        variant="outlined"
                        density="compact"
                      />
                      <v-select
                        v-model="monthDay"
                        :items="daysInMonth"
                        label="Day (1-31)*"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Day required']"
                      />
                    </div>

                    <div v-if="frequency === 'Quarterly'" class="d-flex">
                      <v-select
                        v-model="quarter"
                        :items="quarterOptions"
                        label="Quarter*"
                        class="mr-2"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Quarter required']"
                      />
                      <v-select
                        v-model="quarterDay"
                        :items="daysInMonth"
                        label="Day (1-31)*"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Day required']"
                      />
                    </div>

                    <div v-if="frequency === 'Yearly'" class="d-flex">
                      <v-select
                        v-model="yearly"
                        :items="monthList"
                        label="Month*"
                        class="mr-2"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Month required']"
                      />
                      <v-select
                        v-model="yearlyDay"
                        :items="daysInMonth"
                        label="Day (1-31)*"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Day required']"
                      />
                    </div>

                    <!-- <v-select
                      v-model="completionDays"
                      :items="completionDayItems"
                      label="Completion Days* (1-10)"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-progress-check"
                      :rules="[(v) => !!v || 'Value required']"
                    /> -->
                  </template>
                  <v-row>
                    <v-col cols="12">
                      <span>Selected Checklist Master Name:</span>
                    </v-col>
                    <v-col cols="12" class="mt-n4">
                      <span style="color: black; font-size: 16px">{{
                        master || "N/A"
                      }}</span>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="7">
              <div v-if="selectedMaster">
                <v-card class="scrollable-card" :height="height">
                  <v-card-text class="">
                    <!-- <v-checkbox
                      v-model="assignToAll"
                      label="Assign all tasks to one user"
                      color="primary"
                      class="mt-n2"
                      @change="onAssignToAllChange"
                    />
                    <v-select
                      v-if="assignToAll"
                      v-model="assignToUser"
                      :items="filteredUsers"
                      label="Assign User"
                      dense
                      outlined
                      hide-details
                      style="max-width: 300px"
                      class="mb-6 mt-n2"
                      item-text="label"
                      item-value="value"
                      @change="assignUserToAllTasks"
                    /> -->

                    <!-- Enable All Tasks -->
                    <!-- <v-checkbox
                    v-model="allTasksEnabled"
                    label="Enable All Tasks"
                    color="primary"
                    class="mt-n4"
                    @change="toggleAllTasks"
                  /> -->

                    <div
                      v-if="
                        selectedMaster.section && selectedMaster.section.length
                      "
                    >
                      <div
                        v-for="(entry, index) in selectedMaster.section"
                        :key="index"
                        class="mb-4"
                      >
                        <v-card
                          v-if="entry.type === 'section'"
                          variant="outlined"
                          class="rounded-lg"
                          elevation="0"
                        >
                          <v-card-title
                            class="d-flex align-center justify-space-between"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="blue darken-2" class="mr-2"
                                >mdi-folder-plus</v-icon
                              >
                              <span class="font-weight-smal">{{
                                entry.name
                              }}</span>
                            </div>

                            <div class="d-flex align-center">
                              <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                  <v-icon
                                    class="mr-2"
                                    color="green"
                                    size="x-small"
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="toggleFilter(index)"
                                    style="cursor: pointer"
                                  >
                                    mdi-filter
                                  </v-icon>
                                </template>
                                <span>Assign one user for this Section</span>
                              </v-tooltip>

                              <v-select
                                v-if="showSectionFilter[index]"
                                v-model="sectionFilters[index]"
                                :items="filteredUsers"
                                label="Assign User"
                                variant="outlined"
                                density="compact"
                                hide-details
                                style="max-width: 200px"
                                item-text="title"
                                item-value="value"
                                @update:model-value="
                                  assignUserToSectionTasks(index)
                                "
                              />
                            </div>
                          </v-card-title>

                          <v-card-text>
                            <v-list density="compact">
                              <div
                                v-for="(item, i) in entry.items"
                                :key="'item-' + i"
                              >
                                <v-list-item>
                                  <div
                                    class="d-flex align-center flex-wrap"
                                    style="width: 100%; gap: 16px"
                                  >
                                    <v-checkbox
                                      v-model="item.checked"
                                      color="primary"
                                      hide-details
                                      density="compact"
                                      @update:model-value="
                                        onTaskCheckedChange(item)
                                      "
                                    />

                                    <div>
                                      <div class="font-weight-medium">
                                        {{
                                          item.name.length > 40
                                            ? item.name.slice(0, 40) + "…"
                                            : item.name
                                        }}
                                      </div>
                                      <div class="text-body-2">
                                        {{
                                          (item.description || "No description")
                                            .length > 38
                                            ? (
                                                item.description ||
                                                "No description"
                                              ).slice(0, 38) + "…"
                                            : item.description ||
                                              "No description"
                                        }}
                                      </div>
                                    </div>

                                    <v-select
                                      v-if="item.checked"
                                      v-model="item.assignedTo"
                                      :items="filteredUsers"
                                      label="User"
                                      variant="outlined"
                                      density="compact"
                                      hide-details
                                      style="max-width: 200px"
                                      class="ml-auto mt-1"
                                      item-text="title"
                                      item-value="value"
                                      @update:model-value="
                                        onTaskUserChange(item, $event)
                                      "
                                    />
                                  </div>
                                </v-list-item>

                                <v-divider
                                  v-if="i !== entry.items.length - 1"
                                  class="ml-6 mr-2 mt-2"
                                />
                              </div>
                            </v-list>
                          </v-card-text>
                        </v-card>

                        <v-card
                          v-else
                          variant="outlined"
                          elevation="0"
                          class="rounded-lg"
                        >
                          <v-list-item>
                            <div
                              class="d-flex align-center flex-wrap"
                              style="width: 100%; gap: 16px"
                            >
                              <v-checkbox
                                v-model="entry.checked"
                                color="green"
                                hide-details
                                density="compact"
                                @update:model-value="onTaskCheckedChange(entry)"
                              />

                              <div>
                                <div class="font-weight-medium">
                                  {{
                                    entry.name.length > 42
                                      ? entry.name.slice(0, 42) + "…"
                                      : entry.name
                                  }}
                                </div>
                                <div class="text-body-2">
                                  {{
                                    (entry.description || "No description")
                                      .length > 42
                                      ? (
                                          entry.description || "No description"
                                        ).slice(0, 42) + "…"
                                      : entry.description || "No description"
                                  }}
                                </div>
                              </div>

                              <v-select
                                v-if="entry.checked"
                                v-model="entry.assignedTo"
                                :items="filteredUsers"
                                label="User"
                                variant="outlined"
                                density="compact"
                                hide-details
                                style="max-width: 200px"
                                class="mt-2"
                                item-text="title"
                                item-value="value"
                                @update:model-value="
                                  onTaskUserChange(entry, $event)
                                "
                              />
                            </div>
                          </v-list-item>
                        </v-card>
                      </div>
                    </div>
                    <div v-else>
                      <em>No checklist items available.</em>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_checklist_master } from "@/mixins/ChecklistMasterList";
import { get_all_users } from "@/mixins/GetAllUsers";
import { API, graphqlOperation } from "aws-amplify";
import { update_checklist } from "@/graphql/mutations";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";

export default {
  mixins: [get_checklist_master, get_all_users],
  components: {
    SnackBar,
    OverlayComp,
  },
  data() {
    return {
      checklistName: "",
      checklistItem: [],
      userList: [],
      restrictedTo: [],
      master: "",
      selectedMaster: null,
      allTasksEnabled: false,
      assignToAll: false,
      assignToUser: null,
      type: false,
      visibility: "RESTRICTED_MEMBERS",
      endDateMenu: false,
      endDate: null,
      formattedEndDate: "",
      frequency: "",
      weeklyDay: "",
      month: "",
      height: 0,
      monthDay: "",
      quarter: "",
      quarterDay: "",
      yearly: "",
      yearlyDay: "",
      completionDays: "",
      loading: false,
      monthList: [
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
      ],
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      daysInMonth: Array.from({ length: 31 }, (_, i) => i + 1),
      quarterOptions: [
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
      ],
      completionDayItems: Array.from({ length: 10 }, (_, i) => i + 1),
      sectionFilters: [],
      showSectionFilter: [],
      overlay: false,
      SnackBarComponent: {},
    };
  },
  watch: {
    type(newType, oldType) {
      if (newType !== oldType) {
        // Clear fields when switching between One-time and Recurring
        if (newType === false) {
          // Switching to One-time - clear recurring fields
          this.frequency = "";
          this.weeklyDay = "";
          this.month = "";
          this.monthDay = "";
          this.quarter = "";
          this.quarterDay = "";
          this.yearly = "";
          this.yearlyDay = "";
        } else {
          // Switching to Recurring - clear one-time fields
          this.endDate = null;
          this.formattedEndDate = "";
        }
      }
    },
    endDate(d) {
      if (!d) {
        this.formattedEndDate = "";
        return;
      }
      const dt = new Date(d);
      this.formattedEndDate =
        `${dt.getDate().toString().padStart(2, "0")}-` +
        `${(dt.getMonth() + 1).toString().padStart(2, "0")}-` +
        dt.getFullYear();
    },
    assignToAll(newVal) {
      if (!newVal) {
        // When assignToAll becomes false, clear all assignments and uncheck all tasks
        this.clearAllAssignments();
        this.assignToUser = null;
      } else if (newVal && this.assignToUser) {
        // When assignToAll becomes true and there's already a user selected, apply it to all tasks
        this.assignUserToAllTasks(this.assignToUser);
      }
    },
    // Watch for changes in section filters
    sectionFilters: {
      handler(newFilters) {
        // When a section filter changes, update all tasks in that section
        newFilters.forEach((userId, index) => {
          if (userId && this.showSectionFilter[index]) {
            this.assignUserToSectionTasks(index);
          }
        });
      },
      deep: true,
    },
    restrictedTo(newVal, oldVal) {
      // Find users that were removed
      const removedUsers = oldVal.filter((u) => !newVal.includes(u));
      if (removedUsers.length > 0) {
        this.clearAssignmentsForRemovedUsers(removedUsers);
      }
    },
  },
  computed: {
    filteredUsers() {
      return this.userList.filter((user) =>
        this.restrictedTo.includes(user.value)
      );
    },
    // Synchronized user assignment for all tasks when assignToAll is true
    synchronizedAssignToUser: {
      get() {
        return this.assignToUser;
      },
      set(value) {
        this.assignToUser = value;
        if (this.assignToAll && value) {
          this.assignUserToAllTasks(value);
        }
      },
    },
  },
  async created() {
    this.overlay = true;
    await Promise.all([this.get_checklist_master(), this.get_all_users()]);
    this.height = window.innerHeight - 130;
    this.checklistItem = this.checklistMasterItem;
    this.userList = this.listUsers
      .filter((u) => u.user_type !== "CHATBOT")
      .map((u) => ({ title: u.full_user_name, value: u.user_id }))
      .sort((a, b) => a.title.localeCompare(b.title));

    this.overlay = false;

    const data = this.$store.getters.GetChecklist;

    this.checklistName = data.checklist_name;
    this.master = data.master_checklist_name;
    this.restrictedTo = data.checklist_visible_members;
    const inputDate = data.checklist_end_date; // "2025-06-24"
    const date = new Date(inputDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    this.formattedEndDate = `${day}-${month}-${year}`; // "24-06-2025"
    this.type = data.enable_recursion;
    let recursionData = data.recursion_frequency;
    if (recursionData) {
      // Convert to Proper Case to match the <v-select> options
      const toTitleCase = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      this.frequency = toTitleCase(recursionData.recursion_frequency); // e.g., "Quarterly"

      // this.completionDays = recursionData.completion_days;

      // Handle the rest based on frequency
      if (this.frequency === "Monthly") {
        this.monthDay = recursionData.recursion_date;
      } else if (this.frequency === "Quarterly") {
        this.quarterDay = recursionData.recursion_date;
        this.quarter = recursionData.recursion_month; // e.g., "Q1"
      } else if (this.frequency === "Yearly") {
        this.yearlyDay = recursionData.recursion_date;
        this.yearly = recursionData.recursion_month; // e.g., "July"
      } else if (this.frequency === "Weekly") {
        this.weeklyDay = toTitleCase(recursionData.recursion_day); // e.g., "Monday"
      }
    }

    const checklistDetails = data.checklist_details;
    this.selectedMaster = { section: [] };

    Object.keys(checklistDetails).forEach((key) => {
      if (key !== "line_items") {
        const sectionItems = checklistDetails[key];
        if (Array.isArray(sectionItems)) {
          this.selectedMaster.section.push({
            name: key,
            type: "section",
            items: sectionItems.map((item) => ({
              ...item,
              name: item.checklist_name,
              description: item.item_description || "",
              checked: !!item.assigned_to,
              assignedTo: item.assigned_to,
              assignedToName: item.assigned_to_name,
              originalAssignedTo: item.assigned_to,
              originalAssignedToName: item.assigned_to_name,
              originalChecked: !!item.assigned_to,
            })),
          });
        }
      }
    });

    // Standalone line items
    if (Array.isArray(checklistDetails.line_items)) {
      checklistDetails.line_items.forEach((item) => {
        this.selectedMaster.section.push({
          ...item,
          type: "line_item",
          name: item.checklist_name,
          description: item.section_description || "",
          checked: !!item.assigned_to,
          assignedTo: item.assigned_to,
          assignedToName: item.assigned_to_name,
          originalAssignedTo: item.assigned_to,
          originalAssignedToName: item.assigned_to_name,
          originalChecked: !!item.assigned_to,
        });
      });
    }

    // Initialize section filters
    if (this.selectedMaster?.section?.length) {
      this.sectionFilters = new Array(this.selectedMaster.section.length).fill(
        null
      );
      this.showSectionFilter = new Array(
        this.selectedMaster.section.length
      ).fill(false);
    }
  },
  methods: {
    getLabel(value) {
      const user = this.userList.find((u) => u.value === value);
      return user ? user.title : value;
    },
    removeUser(value) {
      this.restrictedTo = this.restrictedTo.filter((v) => v !== value);
      // Clear assignments for the removed user
      this.clearAssignmentsForRemovedUsers([value]);
    },
    monthNameToNumber(name) {
      const idx = this.monthList.indexOf(name);
      return idx === -1 ? undefined : idx + 1;
    },
    quarterToMonths(q) {
      return (
        { Q1: "1,2,3", Q2: "4,5,6", Q3: "7,8,9", Q4: "10,11,12" }[q] ||
        undefined
      );
    },
    formatApiDate(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    },
    toggleFilter(index) {
      const isCurrentlyVisible = this.showSectionFilter[index];
      this.showSectionFilter[index] = !isCurrentlyVisible;

      if (isCurrentlyVisible) {
        // When hiding the filter, clear the section filter and uncheck all items in the section
        this.sectionFilters[index] = null;
        const section = this.selectedMaster.section[index];
        if (section && section.items) {
          section.items.forEach((item) => {
            item.checked = false;
            item.assignedTo = null;
          });
        }
      } else {
        // When showing the filter, if there are already checked items with the same user, set that user
        const section = this.selectedMaster.section[index];
        if (section && section.items) {
          const checkedItems = section.items.filter((item) => item.checked);
          if (checkedItems.length > 0) {
            const firstAssignedUser = checkedItems[0].assignedTo;
            const allSameUser = checkedItems.every(
              (item) => item.assignedTo === firstAssignedUser
            );
            if (allSameUser && firstAssignedUser) {
              this.sectionFilters[index] = firstAssignedUser;
            }
          }
        }
      }
    },
    assignUserToSectionTasks(index) {
      const selectedUser = this.sectionFilters[index];
      const section = this.selectedMaster.section[index];

      if (section && section.items && selectedUser) {
        // Check all items in the section and assign the selected user
        section.items.forEach((item) => {
          item.checked = true;
          item.assignedTo = selectedUser;
        });
      } else if (section && section.items && !selectedUser) {
        // If no user is selected, uncheck all items and clear assignments
        section.items.forEach((item) => {
          item.checked = false;
          item.assignedTo = null;
        });
      }
    },

    closeDialog() {
      this.$router.push("/home/CheckList");
      this.master = "";
      this.selectedMaster = null;
      this.restrictedTo = [];
      this.allTasksEnabled = false;
      this.assignToAll = false;
      this.assignToUser = null;
      this.sectionFilters = [];
      this.showSectionFilter = [];
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
    fetch_Master(value) {
      const deepCopy = JSON.parse(JSON.stringify(value));
      this.selectedMaster = deepCopy;
      if (this.selectedMaster?.section?.length) {
        this.selectedMaster.section = this.selectedMaster.section.map(
          (entry) => {
            if (entry.type === "section") {
              entry.items = entry.items.map((item) => ({
                ...item,
                checked: false,
                assignedTo: null,
              }));
            } else {
              entry = {
                ...entry,
                checked: false,
                assignedTo: null,
              };
            }
            return entry;
          }
        );
      }
      this.allTasksEnabled = false;
      this.assignToAll = false;
      this.assignToUser = null;
    },
    toggleAllTasks() {
      if (!this.selectedMaster) return;

      if (this.selectedMaster.section?.length) {
        this.selectedMaster.section.forEach((entry) => {
          if (entry.type === "section") {
            entry.items.forEach((item) => {
              item.checked = this.allTasksEnabled;
              if (!item.checked) item.assignedTo = null;
              else if (this.assignToAll && this.assignToUser)
                item.assignedTo = this.assignToUser;
            });
          } else {
            entry.checked = this.allTasksEnabled;
            if (!entry.checked) entry.assignedTo = null;
            else if (this.assignToAll && this.assignToUser)
              entry.assignedTo = this.assignToUser;
          }
        });
      }
    },
    onAssignToAllChange(val) {
      if (val && !this.assignToUser) {
        this.clearAllAssignments();
      } else if (val && this.assignToUser) {
        this.assignUserToAllTasks(this.assignToUser);
      } else {
        this.clearAllAssignments();
      }
    },
    assignUserToAllTasks(userId) {
      if (!this.selectedMaster || !this.assignToAll) return;

      if (this.selectedMaster.section?.length) {
        this.selectedMaster.section.forEach((entry) => {
          if (entry.type === "section") {
            entry.items.forEach((item) => {
              item.checked = true;
              item.assignedTo = userId;
            });
          } else {
            entry.checked = true;
            entry.assignedTo = userId;
          }
        });
      }
    },
    clearAllAssignments() {
      if (!this.selectedMaster?.section?.length) return;

      this.selectedMaster.section.forEach((entry) => {
        if (entry.type === "section") {
          entry.items.forEach((item) => {
            item.checked = false;
            item.assignedTo = null;
          });
        } else {
          entry.checked = false;
          entry.assignedTo = null;
        }
      });

      this.assignToUser = null;
    },
    onTaskCheckedChange(task) {
      // console.log(task, "task");
      task.originalChecked = task.originalChecked == false ? true : false;
      // console.log(task, "task");
      if (!task.checked) {
        task.assignedTo = null;
      } else if (this.assignToAll && this.assignToUser) {
        task.assignedTo = this.assignToUser;
      }
    },

    updateAssignedToName(item, val) {
      const selected = this.filteredUsers.find((u) => u.value === val);
      item.assignedToName = selected ? selected.label : "";
    },

    getChecklistData() {
      const updated = [];
      // console.log(this.selectedMaster, "selectedMaster");
      this.selectedMaster.section.forEach((entry) => {
        if (entry.type === "section") {
          entry.items.forEach((item) => {
            if (item.originalChecked == false) {
              updated.push({
                assigned_id: item.assigned_id || "",
              });
            } else {
              const hasAssignmentChanged =
                item.assignedTo !== item.originalAssignedTo;
              // console.log(item);
              if (hasAssignmentChanged && item.assignedTo) {
                updated.push({
                  assigned_id: item.assigned_id || "",
                  assigned_to: item.assignedTo,
                  assigned_to_name: item.assignedToName || "",
                  section_weightage: item.section_weightage?.toString() || "0",
                });
              }
            }
          });
        } else if (entry.type === "line_item" && entry.checked == true) {
          const hasAssignmentChanged =
            entry.assignedTo !== entry.originalAssignedTo;

          if (hasAssignmentChanged && entry.assignedTo) {
            updated.push({
              assigned_id: entry.assigned_id || "",
              assigned_to: entry.assignedTo,
              assigned_to_name: entry.assignedToName || "",
              section_weightage: entry.section_weightage?.toString() || "0",
            });
          }
        } else if (entry.type === "line_item" && entry.checked == false) {
          updated.push({
            assigned_id: entry.assigned_id || "",
          });
        }
      });
      //  console.log(updated, "updated");
      return updated;
    },
    async validate_data() {
      const ok = await this.$refs.form.validate();
      if (!ok) return;

      // // ✅ VALIDATION: At least one item should be checked and have an assigned user
      const checklistData = this.getChecklistData();
      // const hasValidItem = checklistData.some((entry) => {
      //   if (entry.type === "section") {
      //     return entry.items?.some((item) => item.checked && item.assigned_to);
      //   } else {
      //     return entry.checked && entry.assigned_to;
      //   }
      // });

      // if (!hasValidItem) {
      //   this.SnackBarComponent = {
      //     SnackbarVmodel: true,
      //     SnackbarColor: "red",
      //     SnackbarText: "Please check at least one item and assign a user.",
      //     timeout: 5000,
      //     Top: true,
      //   };
      //   return;
      // }



      
      let recursionObj = null;

      if (this.type == true) {
        recursionObj = {
          recursion_frequency: this.frequency.toUpperCase(),
          recursion_date: ["MONTHLY", "QUARTERLY", "YEARLY"].includes(
            this.frequency.toUpperCase()
          )
            ? Number(
                this.frequency === "Monthly"
                  ? this.monthDay
                  : this.frequency === "Quarterly"
                  ? this.quarterDay
                  : this.yearlyDay
              )
            : undefined,
          recursion_month:
            this.frequency === "Quarterly"
              ? this.quarter // e.g., "Q1"
              : this.frequency === "Yearly"
              ? this.yearly // e.g., "January"
              : undefined,
          recursion_day:
            this.frequency === "Weekly"
              ? this.weeklyDay.toUpperCase()
              : undefined,
          // completion_days: Number(this.completionDays),
        };
      }

      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_checklist, {
            input: {
              checklist_id: this.$store.getters.GetChecklist.checklist_id,
              checklist_status: "ACTIVE",
              checklist_name: this.checklistName,
              checklist_visible_members:
                this.visibility === "RESTRICTED_MEMBERS"
                  ? this.restrictedTo
                  : [],
              checklist_end_date:
                this.type == false ? this.formatApiDate(this.endDate) : "N/A",
              enable_recursion: this.type,
              recursion_frequency: recursionObj
                ? JSON.stringify(recursionObj)
                : null,
              section: JSON.stringify(checklistData),
            },
          })
        );

        var response = JSON.parse(result.data.update_checklist);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          setTimeout(() => {
            this.$emit("updaterefesh", "updateChecklist");
            this.$refs.form.reset();
            this.$router.push("/home/CheckList");
          }, 2000);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    // New method to handle individual task user assignment changes within a section
    onTaskUserChange(task, userId) {
      task.assignedTo = userId;

      task.assignedToName =
        this.filteredUsers.find((u) => u.value === userId)?.title || "";

      // console.log(userId, "userId");
      // console.log(this.assignToAll, "assignToAll");

      // If assignToAll is true, sync this change to the main assignToUser
      if (this.assignToAll) {
        this.assignToUser = userId;
        // Update all other tasks to use the same user
        this.assignUserToAllTasks(userId);
      } else {
        // Check if this task belongs to a section with a section filter
        const sectionIndex = this.findTaskSectionIndex(task);
        // console.log(sectionIndex, "sectionIndex");
        // console.log(this.showSectionFilter[sectionIndex], "showSectionFilter");
        // console.log(this.sectionFilters, "sectionFilters");
        if (sectionIndex !== -1 && this.showSectionFilter[sectionIndex]) {
          // Update the section filter to match this task's user
          this.sectionFilters[sectionIndex] = userId;
          // Update all other tasks in the same section
          // console.log( "inside else",sectionIndex,userId);
          this.updateSectionTasks(sectionIndex, userId);
        }
      }
    },

    // Helper method to find which section a task belongs to
    findTaskSectionIndex(task) {
      if (!this.selectedMaster?.section) return -1;

      for (let i = 0; i < this.selectedMaster.section.length; i++) {
        const section = this.selectedMaster.section[i];
        if (section.type === "section" && section.items) {
          const taskIndex = section.items.findIndex((item) => item === task);
          if (taskIndex !== -1) {
            return i;
          }
        }
      }
      return -1;
    },

    // Helper method to update all tasks in a specific section
    updateSectionTasks(sectionIndex, userId) {
      const section = this.selectedMaster.section[sectionIndex];
      // console.log(section, "sectionbefore");
      if (section && section.items) {
        section.items.forEach((item) => {
          if (item.checked) {
            item.assignedTo = userId;
          }
        });
      }
      // console.log(section, "sectionafter");
    },
    clearAssignmentsForRemovedUsers(removedUsers) {
      if (!this.selectedMaster?.section) return;

      this.selectedMaster.section.forEach((entry) => {
        if (entry.type === "section" && entry.items) {
          entry.items.forEach((item) => {
            if (removedUsers.includes(item.assignedTo)) {
              item.assignedTo = null;
              item.checked = false; // Uncheck the checkbox
            }
          });
        } else if (entry.type === "line_item") {
          if (removedUsers.includes(entry.assignedTo)) {
            entry.assignedTo = null;
            entry.checked = false; // Uncheck the checkbox
          }
        }
      });

      // Also clear assignToUser if it's no longer in restrictedTo
      if (removedUsers.includes(this.assignToUser)) {
        this.assignToUser = null;
      }

      // Also clear sectionFilters if needed
      if (this.sectionFilters && this.sectionFilters.length) {
        this.sectionFilters = this.sectionFilters.map((val) =>
          removedUsers.includes(val) ? null : val
        );
      }
    },
  },
};
</script>

<style scoped>
.icon-class {
  cursor: pointer;
}
.navBar {
  background-color: #f5f5f5;
  color: #000;
}
.scrollable-card {
  /* max-height: 530px !important; */
  overflow-y: auto !important;
}
</style>

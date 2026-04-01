<template>
  <v-dialog :model-value="createCheckListDialogue" @update:model-value="$emit('update:createCheckListDialogue', $event)"
    persistent
    :max-width="700"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Create Checklist</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="closeDialog">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-radio-group
            v-model="checklisttype"
            :rules="[(v) => !!v || 'Checklist type required']"
            row
            label="Checklist Type* :"
          >
            <v-radio label="Group" value="GROUP" />
            <v-radio label="Individual" value="INDIVIDUAL" />
          </v-radio-group>

          <v-text-field
            v-model="checklistName"
            label="Name*"
            outlined
            dense
            :rules="[(v) => !!v || 'Name required']"
          />

          <v-select
            v-model="master"
            :items="checklistItem"
            label="Select Checklist Master*"
            item-text="text"
            item-value="value"
            outlined
            dense
            prepend-inner-icon="mdi-clipboard-text-outline"
            :rules="[(v) => !!v || 'Master required']"
          />

          <v-select
            v-model="visibility"
            :items="[
              { text: 'All Users', value: 'ALL_MEMBERS' },
              { text: 'Restricted Users', value: 'RESTRICTED_MEMBERS' },
            ]"
            label="Visibility*"
            outlined
            dense
            prepend-inner-icon="mdi-account-group"
            :rules="[(v) => !!v || 'Visibility required']"
          />

          <v-combobox
            v-if="visibility === 'RESTRICTED_MEMBERS'"
            v-model="restrictedTo"
            :items="userList"
            item-text="label"
            item-value="value"
            multiple
            chips
            outlined
            dense
            :return-object="false"
            prepend-inner-icon="mdi-account"
            label="Select Users*"
            :rules="[
              (v) => (!!v && v.length > 0) || 'Select at least one user',
            ]"
          >
            <template #selection="data">
              <v-chip
                :key="data.index"
                small
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
            :items="['One-time', 'Recurring']"
            label="Checklist Frequency*"
            outlined
            dense
            prepend-inner-icon="mdi-repeat"
            :rules="[(v) => !!v || 'Frequency required']"
          />
            <v-menu :model-value="endDateMenu" @update:model-value="$emit('update:endDateMenu', $event)"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              v-if="type === 'One-time'"
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="formattedEndDate"
                  v-bind="attrs"
                  v-on="on"
                  label="End Date"
                  readonly
                  outlined
                  v-if="type === 'One-time'"
                  dense
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-date-picker v-model="endDate" @input="endDateMenu = false" />
            </v-menu>

          <template v-if="type === 'Recurring'">
            <v-select
              v-model="frequency"
              :items="['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']"
              label="Recurring Frequency*"
              outlined
              dense
              prepend-inner-icon="mdi-calendar-sync"
              :rules="[(v) => !!v || 'Frequency required']"
            />

            <v-select
              v-if="frequency === 'Weekly'"
              v-model="weeklyDay"
              :items="days"
              label="Repeat On (Day of Week)*"
              outlined
              dense
              :rules="[(v) => !!v || 'Day required']"
            />

            <div v-if="frequency === 'Monthly'" class="d-flex">
              <v-select
                v-model="month"
                :items="monthList"
                label="Month"
                class="mr-2"
                outlined
                dense
              />
              <v-select
                v-model="monthDay"
                :items="daysInMonth"
                label="Day (1-31)*"
                outlined
                dense
                :rules="[(v) => !!v || 'Day required']"
              />
            </div>

            <div v-if="frequency === 'Quarterly'" class="d-flex">
              <v-select
                v-model="quarter"
                :items="quarterOptions"
                label="Quarter*"
                class="mr-2"
                outlined
                dense
                :rules="[(v) => !!v || 'Quarter required']"
              />
              <v-select
                v-model="quarterDay"
                :items="daysInMonth"
                label="Day (1-31)*"
                outlined
                dense
                :rules="[(v) => !!v || 'Day required']"
              />
            </div>

            <div v-if="frequency === 'Yearly'" class="d-flex">
              <v-select
                v-model="yearly"
                :items="monthList"
                label="Month*"
                class="mr-2"
                outlined
                dense
                :rules="[(v) => !!v || 'Month required']"
              />
              <v-select
                v-model="yearlyDay"
                :items="daysInMonth"
                label="Day (1-31)*"
                outlined
                dense
                :rules="[(v) => !!v || 'Day required']"
              />
            </div>

            <v-select
              v-model="completionDays"
              :items="completionDayItems"
              label="Completion Days* (1-10)"
              outlined
              dense
              prepend-inner-icon="mdi-progress-check"
              :rules="[(v) => !!v || 'Value required']"
            />
          </template>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          dark
          :loading="loading"
          class="text-capitalize cardCss button-corner"
          @click="handleSubmit"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { create_checklists } from "@/graphql/mutations";
import { get_location_details } from "@/mixins/GetLocations";
import { get_checklist_master } from "@/mixins/ChecklistMasterList";
import { get_all_users } from "@/mixins/GetAllUsers";

export default {
  name: "CreateChecklist",
  mixins: [get_location_details, get_checklist_master, get_all_users],

  props: {
    createCheckListDialogue: Boolean,
  },

  data() {
    return {
      checklisttype: "",
      checklistName: "",
      master: "",
      visibility: "ALL_MEMBERS",
      restrictedTo: "",
      type: "One-time",
      endDateMenu: false,
      endDate: null,
      formattedEndDate: "",
      frequency: "",
      weeklyDay: "",
      month: "",
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
      checklistItem: [],
      userList: [],
    };
  },

  watch: {
    createCheckListDialogue: {
      immediate: true,
      async handler(open) {
        if (!open) return;
        await Promise.all([this.get_checklist_master(), this.get_all_users()]);
        this.checklistItem = this.checklistMasterItem;
        this.userList = this.listUsers
          .filter((u) => u.user_type !== "CHATBOT")
          .map((u) => ({ label: u.full_user_name, value: u.user_id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
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
  },

  methods: {
    closeDialog() {
      this.$emit("clicked", 0);
      this.$nextTick(() => {
        this.$refs.form?.reset();
        this.$refs.form?.resetValidation();
      });
    },

    getLabel(value) {
      const user = this.userList.find((u) => u.value === value);
      return user ? user.label : value;
    },
    removeUser(value) {
      this.restrictedTo = this.restrictedTo.filter((v) => v !== value);
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

    async handleSubmit() {
      const ok = await this.$refs.form.validate();
      if (!ok) return;

      let recursionObj = null;

      if (this.type === "Recurring") {
        recursionObj = {
          recursion_frequency: this.frequency.toUpperCase(), // DAILY/…
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
              ? this.quarterToMonths(this.quarter) // "1,2,3"
              : this.frequency === "Yearly"
              ? String(this.monthNameToNumber(this.yearly)) // "7"
              : undefined,
          recursion_day:
            this.frequency === "Weekly"
              ? this.weeklyDay.toUpperCase()
              : undefined,
          completion_days: Number(this.completionDays), // 1-10
        };
      }

      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_checklists, {
            input: {
              master_checklist_id: this.master,
              checklist_name: this.checklistName,
              checklist_visiblity: this.visibility,
              checklist_visible_members:
                this.visibility === "RESTRICTED_MEMBERS"
                  ? this.restrictedTo
                  : [],
              checklist_type: this.checklisttype,
              checklist_end_date:
                this.type === "Recurring"
                  ? this.formatApiDate(this.endDate)
                  : null,
              recursion_frequency: recursionObj
                ? JSON.stringify(recursionObj)
                : null,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_checklists);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "updateChecklist");
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style scoped>
</style>

<template>
  <div>
    <v-card  flat>
      <v-toolbar  flat dense>
        <v-spacer />
        <v-btn
          dark
          class="text-capitalize cardCss ml-1"
          @click="add_triggers()"
          v-if="triggertype == 'overdue'"
        >
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :search="search"
          :headers="triggerheaders"
          :fixed-header="fixed"
          :items="triggerData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          class="elevation-1 dtwidth"
          dense
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="red"
              class="mr-2"
              small
              @click="open_editdailog(item)"
              >mdi-pencil</v-icon
            >
            <v-icon
              color="red"
              small
              @click="open_deletedailog(item)"
              v-if="triggertype == 'overdue'"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateOverdueTrigger
        :triggerCreation="triggerCreation"
        @clicked="triggerCreation = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditUpcomingTrigger
        :editTriggers="editTriggers"
        @clicked="editTriggers = false"
        :triggerItems="triggerItems"
      />
    </div>
  </div>
</template>

<script>
import EditUpcomingTrigger from "@/components/ARAP/popups/EditUpcomingTrigger.vue";
import CreateOverdueTrigger from "@/components/ARAP/popups/CreateOverdueTrigger.vue";
export default {
  components: {
    CreateOverdueTrigger,
    EditUpcomingTrigger,
  },
  props: {
    triggertype: String,
  },
  data() {
    return {
      search: "",
      componentCheck: 0,
      fixed: true,
      tableLoading: false,
      triggerCreation: false,
      editTriggers: false,
      triggerItems: {},
      triggerData: [],
      triggerheaders: [
        { text: "Email Template", value: "email_template", sortable: false },
        // { text: "Frequency Type", value: "frequency_type", sortable: false },
        {
          text: "Scheduled (Prior)",
          value: "scheduled_date",
          sortable: false,
        },
        {
          text: "Scheduled Time",
          value: "scheduled_time",
          sortable: false,
        },
        {
          text: "Updated On",
          value: "updated_on",
          sortable: false,
        },

        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  mounted() {
    if (this.triggertype == "Upcoming") {
      this.triggerData.push({
        email_template: "Upcoming Invoice Reminder",
        frequency_type: "Recurring",
        scheduled_date: "1",
        scheduled_time: "10:00",
        updated_on: "17-06-2025",
      });
    } else {
      this.triggerData.push({
        email_template: "Overdue Reminder ",
        frequency_type: "Recurring",
        scheduled_date: "17-06-2025",
        scheduled_time: "03:00",
        updated_on: "17-06-2025",
        triggerType: "Daily",
      });
      this.triggerData.push({
        email_template: "Overdue Reminder ",
        frequency_type: "Recurring",
        scheduled_date: "1",
        scheduled_time: "10:00",
        updated_on: "17-06-2025",
        triggerType: "Monthly",
      });
      this.triggerData.push({
        email_template: "Overdue Reminder ",
        frequency_type: "Recurring",
        scheduled_date: "22-06-2025",
        scheduled_time: "10:00",
        updated_on: "17-06-2025",
        triggerType: "Weekly",
      });
    }
    // console.log(this.triggertype)
  },
  methods: {
    add_triggers() {
      this.componentCheck = 1;
      this.triggerCreation = true;
    },
    open_editdailog(item) {
      this.triggerItems = item;
      this.componentCheck = 2;
      if (this.triggertype != "overdue") {
        this.editTriggers = true;
      }
    },
  },
};
</script>

<style>
</style>
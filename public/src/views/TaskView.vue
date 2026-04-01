<template>
  <v-card outlined>
    <v-card-title class="font-weight-bold">
      My Tasks
      <v-spacer />
      <v-btn text x-small>See All</v-btn>
    </v-card-title>
    <v-divider />
    <v-tabs v-model="taskTab" background-color="white" grow>
      <v-tab>Today</v-tab>
      <v-tab>Upcoming</v-tab>
      <v-tab>Completed</v-tab>
    </v-tabs>
    <v-divider />
    <v-list :height="px" dense>
      <v-list-item v-for="task in tasks" :key="task.name">
        <v-list-item-content>
          <v-list-item-title>{{ task.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ task.assignee }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action-text
          class="text-caption font-weight-bold"
          :class="task.statusClass"
        >
          {{ task.date }}
        </v-list-item-action-text>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
/*eslint-disable*/
import { list_assign_task_or_completed } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  data() {
    return {
      taskTab: 0,
      selectedStatus: "ALL",
      tasks: [
        {
          name: "Amet culpa pariatur et",
          assignee: "Samantha Green",
          date: "May 21, 2025",
          statusClass: "green--text",
        },
        {
          name: "Elusmod dolor",
          assignee: "Elena Jimenez",
          date: "Jun 25, 2025",
          statusClass: "amber--text",
        },
        {
          name: "Anim eu proident",
          assignee: "John Davis",
          date: "Jul 30, 2025",
          statusClass: "amber--text",
        },
      ],
      masterData: [],

      lastNotification: null,
    };
  },
  async created() {
    await this.list_my_tasks();
  },
  methods: {
    async list_my_tasks() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_assign_task_or_completed, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              actions: "ASSIGN_TO_ME",
              limit: 500,
              nextToken: null,
              task_progress_status:
                this.selectedStatus === "ALL" ? null : this.selectedStatus,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var response = result.data.list_assign_task_or_completed;
        this.filter_by_card("Overdue");
        // console.log(response);
        // console.log(response);
        // this.masterData = response.details.sort((a, b) => {
        //   return (
        //     new Date(b.task_completion_date) - new Date(a.task_completion_date)
        //   );
        // });

        // this.filter_by_card("Overdue");
      } catch (error) {}
    },

    filter_by_card(value) {
      this.selectedCard = value;

      const today = new Date().toISOString().split("T")[0];
      var data = [];
      if (value == "Overdue") {
        let overdueTasks = this.masterData.filter(
          (task) =>
            task.task_completion_date &&
            this.formatedatedisplay(task.task_completion_date) < today &&
            task.task_progress_status === "INPROGRESS"
        );
        return (this.tableData = overdueTasks);
      } else if (value == "Completed") {
        let completedTasks = this.masterData.filter(
          (task) => task.task_progress_status === "COMPLETED"
        );
        return (this.tableData = completedTasks);
      } else if (value == "Hold") {
        let holdTasks = this.masterData.filter(
          (task) => task.task_progress_status === "HOLD"
        );
        return (this.tableData = holdTasks);
      } else if (value == "Upcoming") {
        let upcomingTasks = this.masterData.filter(
          (task) =>
            task.task_completion_date &&
            this.formatedatedisplay(task.task_completion_date) >= today &&
            task.task_progress_status === "INPROGRESS"
        );
        return (this.tableData = upcomingTasks);
      }
    },
  },
};
</script>
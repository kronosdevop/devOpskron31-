<template>
  <div>
    <v-card-text>
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-row>
        <v-col cols="6">
          <ProjectActivites  v-on:successMsg="success_info"  v-on:errorMsg="error_msg" />
        </v-col>
        <v-col cols="6">
          <ActivitiMapping  v-on:successMsg="success_info" v-on:errorMsg="error_msg" />
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>
<script>
/*eslint-disable*/
import ProjectActivites from "@/components/TimeSheets/ProjectActivites.vue";
import ActivitiMapping from "@/components/TimeSheets/ActivitiMapping.vue";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    ProjectActivites,
    SnackBar,
    ActivitiMapping,
  },
  data() {
    return {
      SnackBarComponent: {},
      headers: [{ text: "Name", value: "dashboard_name", sortable: false }],
      projectHeaders: [
        { text: "Name", value: "project_name", sortable: false },
        { text: "Activities", value: "dashboard_name", sortable: false },
      ],

      loading: false,
      tableData: [
        // {
        //   dashboard_name: "Stichh",
        // },
      ],
      activityData: [
        {
          project_name: "Stichh",
          dashboard_name: "Meeting",
        },
      ],
      activityName: "",
      fixed: true,
      projectSelection: "",
      tableHeight: 0,
      searchF: "",
      activityList: [],
    };
  },
  created() {
    this.tableHeight = window.innerHeight - 230;
  },
  methods: {
    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    }
  },
};
</script>
<template>
  <div>
    <div class="mt-n4" style="font-size: 15px"><b>Activites</b></div>
    <v-row class="mt-2" no-gutters>
      <v-form ref="form">
        <v-text-field
          density="compact"
          variant="outlined"
          :rules="[(v) => !!v || 'Required']"
          label="Name"
          v-model="activityName"
        />
      </v-form>
      <v-spacer/>
      <v-btn
        depressed
        @click="add_mutation()"
        :loading="loadingBtn"
        dark
        small
        class="text-capitalize ml-2 cardCss text-white"
      >
        Add
      </v-btn>
    </v-row>
    <v-data-table
      :headers="headers"
      :fixed-header="fixed"
      :items="tableData"
      :loading="loading"
      :height="tableHeight"
      :footer-props="{
        itemsPerPageOptions: [10, 20, 30, 40, 50],
      }"
      :items-per-page="0"
      density="compact"
      class="elevation-1 mt-n1 dtwidth"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small color="red" @click.stop="delete_item(item)"
          >mdi-delete</v-icon
        >
      </template>
    </v-data-table>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <DeleteActivity
        :projectDeletion="projectDeletion"
        :deleteitems="deleteitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectDeletion = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
// import { EventBus } from "@/EventBus";
import SnackBar from "@/components/SnackBar.vue";
import DeleteActivity from "@/components/TimeSheets/PopUps/DeleteActivity.vue";
import { create_activity } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_activities } from "@/graphql/queries.js";
export default {
  components: {
    SnackBar,
    DeleteActivity,
  },
  data() {
    return {
      activityName: "",
      loading: false,
      headers: [
        { title: "Name", key: "activity_name", sortable: false },
        { title: "Action", key: "actions", sortable: false },
      ],
      tableData: [],
      SnackBarComponent: {},
      tableHeight: 0,
      fixed: true,
      loadingBtn: false,
      projectDeletion: false,
      componentCheck: 0,
      deleteitems: {},
    };
  },
  created() {
    this.tableHeight = window.innerHeight - 290;

    this.fetch_activities();
  },
  methods: {
    add_mutation() {
      if (this.$refs.form.validate()) {
        this.create_activity_func();
      }
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
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
      this.projectDeletion = false;
      this.fetch_activities();
    },
    delete_item(item) {
      this.deleteitems = item;
      this.componentCheck = 1;
      this.projectDeletion = true;
    },

    async create_activity_func() {
      var data = this.$store.getters.GetUserObj;
      this.loadingBtn = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_activity, {
            input: {
              activity_name: this.activityName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.create_activity);

        if (response.Status == "SUCCESS") {
          this.loadingBtn = false;
          await this.fetch_activities();
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.loadingBtn = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingBtn = false;
        this.$refs.form.reset();
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async fetch_activities() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_activities, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_activities);
        this.tableData = [];
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.tableData = response.data;
          this.$emit("temValue", this.tableData);
        } else {
          this.loading = false;
          this.tableData = [];
          this.$emit("temValue", this.tableData);
        }
      } catch (error) {
        this.loading = false;
        this.tableData = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
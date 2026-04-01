<template>
  <div>
    <div class="mt-n4" style="font-size: 15px">
      <b>Categories/Project</b>
    </div>
    <v-form ref="form">
      <v-row class="mt-2" no-gutters>
        <v-text-field
          style="max-width: 250px"
          density="compact"
          variant="outlined"
          label="Name"
          :rules="[(v) => !!v || 'Required']"
          v-model="projectName"
        />
        <v-select
          v-model="activityList"
          class="ml-2"
          density="compact"
          variant="outlined"
          :rules="[
            (v) => (v && v.length > 0) || 'At least one activity is required',
          ]"
          style="max-width: 250px"
          :items="activityData"
          item-text="title"
          item-value="value"
          label="Select Activity"
          multiple
        >
          <!-- <template v-slot:selection="{ item, index }">
          <v-chip v-if="index === 0">
            <span>{{ item }}</span>
          </v-chip>
          <span v-if="index === 1" class="grey--text text-caption">
            (+{{ activityList.length - 1 }} others)
          </span>
        </template> -->
        </v-select>

        <v-btn
          depressed
          @click="add_mutation()"
          dark
          :loading="loadingBtn"
          small
          class="text-capitalize ml-1 cardCss text-white"
        >
          Add
        </v-btn>
      </v-row>
    </v-form>
    <v-data-table
      :headers="projectHeaders"
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
      <!-- <template v-slot:[`item.project_activities`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <div v-if="item.project_activities" class="caption" v-on="on">
              {{
                item.project_activities.length >= 2
                  ? item.project_activities[0] +
                    ", " +
                    item.project_activities[1] +
                    "..."
                  : item.project_activities.length === 1
                  ? item.project_activities[0]
                  : "-"
              }}
            </div>
            <div v-else>-</div>
          </template>
          <div class="textWrap" style="max-width: 250px">
            {{ item.project_activities.join(", ") }}
          </div>
        </v-tooltip>
      </template> -->
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small color="red" @click.stop="edit_item(item)" class="mr-2"
          >mdi-pencil</v-icon
        >
        <v-icon small color="red" @click.stop="delete_item(item)"
          >mdi-delete</v-icon
        >
      </template>
    </v-data-table>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <EditProject
        :projectEdition="projectEdition"
        :projectitems="projectitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectEdition = false"
        :activityData="activityData"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteProject
        :projectDeletion="projectDeletion"
        :projectitems="projectitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectDeletion = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import EditProject from "@/components/TimeSheets/PopUps/EditProject.vue";
import DeleteProject from "@/components/TimeSheets/PopUps/DeleteProject.vue";
import { create_project } from "@/graphql/mutations.js";
import { get_projects } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    DeleteProject,
    EditProject,
    SnackBar,
  },

  data() {
    return {
      projectHeaders: [
        { title : "Name", key: "project_name", sortable: false },
        { title : "Activities", key: "project_activities", sortable: false },
        { title : "Action", key: "actions", sortable: false },
      ],
      fixed: true,
      activityData: [],
      activityList: [],
      projectName: "",
      SnackBarComponent: {},
      projectitems: {},
      projectDeletion: false,
      projectEdition: false,
      componentCheck: 0,
      loading: false,
      tableHeight: 0,
      tableData: [],
      loadingBtn: false,
    };
  },

  async created() {
    this.tableHeight = window.innerHeight - 290;
    ("temValue", (eventData) => {
      this.activityData = [];

      eventData.forEach((element) => {
        this.activityData.push({
          title: element.activity_name,
          value: element.activity_name,
        });
      });
    });
    await this.fetch_projectes();
  },
  methods: {
    add_mutation() {
      if (this.$refs.form.validate()) {
        this.create_project_with_activities();
      }
    },
    edit_item(item) {
      this.projectitems = item;
      this.componentCheck = 1;
      this.projectEdition = true;
    },
    delete_item(item) {
      this.projectitems = item;
      this.componentCheck = 2;
      this.projectDeletion = true;
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
      this.projectEdition = false;
      this.projectDeletion = false;
      this.fetch_projectes();
    },

    async create_project_with_activities() {
      var data = this.$store.getters.GetUserObj;
      this.loadingBtn = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_project, {
            input: {
              project_name: this.projectName,
              // organization_id: data.organization.organization_id,
              project_activities: this.activityList,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.create_project);
        if (response.Status == "SUCCESS") {
          this.loadingBtn = false;
          this.$refs.form.reset();
          this.fetch_projectes();
        } else {
          this.loadingBtn = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingBtn = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async fetch_projectes() {
      this.loading = true;

      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_projects, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_projects);

        this.tableData = [];
        this.loading = false;
        this.tableData = response.data;
      } catch (error) {
        this.loading = false;

        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
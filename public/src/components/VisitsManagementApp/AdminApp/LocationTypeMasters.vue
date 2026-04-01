<template>
  <div>
    <v-card flat>
      <v-toolbar class="" flat dense>
        <v-form ref="form">
          <v-text-field
            style="max-width: 300px"
            dense
            outlined
            :rules="[(v) => !!v || 'required ']"
            class="mt-3"
            v-model="locationType"
            label="Location Type"
          />
        </v-form>
        <v-btn
          dark
          :loading="loading"
          @click="validate_data()"
          class="ml-2 mt-n3 text-capitalize cardCss"
        >
          Add
        </v-btn>
        <v-spacer />
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="visitHeaders"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="red" small @click="open_deletedailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteLocationtype
        :locationdeletion="locationdeletion"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="locationdeletion = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import DeleteLocationtype from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/DeleteLocationtype.vue";
import { create_list_edit_location_type } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateFormDialog from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/CreateFormDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    CreateFormDialog,
    SnackBar,
    DeleteLocationtype,
  },
  data() {
    return {
      SnackBarComponent: {},
      locationdeletion: false,
      loading: false,
      visitHeaders: [
        { text: "Location Type", value: "location_type", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      visitType: "",
      fixed: true,
      tableLoading: false,
      tableData: [],
      rowInfo: {},
      componentCheck: 0,
      createFormDialogue: false,
      locationType: "",
    };
  },
  mounted() {
    this.fetch_locationtype();
  },
  methods: {
    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 1;
      this.locationdeletion = true;
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.locationdeletion = false;
      this.fetch_locationtype();
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

    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_location_type, {
            input: {
              action_type: "CREATE",
              location_type: this.locationType,

              organization_id: data.organization.organization_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_location_type);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          this.$refs.form.resetValidation();
          this.$refs.form.reset();
          this.tableData = [];
          this.fetch_locationtype();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
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
    async fetch_locationtype() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_location_type, {
            input: {
              action_type: "LIST",
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.create_list_edit_location_type);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
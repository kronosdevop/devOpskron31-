<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <!-- <v-toolbar flat dense>
        <v-toolbar-title> </v-toolbar-title>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss" @click="create_form()">
          Create Form
        </v-btn>
      </v-toolbar> -->
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          :options.sync="pagination"
          @update:options="handle_pagination()"
          class="elevation-1 dtwidth"
          @click:row="handleRowClick"
        >
          <!--  :height="height" -->
          <template v-slot:[`item.form_name`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.form_name" class="caption" v-on="on">
                  {{
                    item.form_name.length >= 50
                      ? item.form_name.substr(0, 50) + "..."
                      : item.form_name
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.form_name }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.form_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.form_description" class="caption" v-on="on">
                  {{
                    item.form_description.length >= 40
                      ? item.form_description.substr(0, 40) + "..."
                      : item.form_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.form_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.is_form_designed`]="{ item }">
            <span v-if="item.is_form_designed == true" class="caption">
              <v-btn small text class="white--text ml-n3" color="green"
                >Yes</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="red">No</v-btn>
            </span>
          </template>
          <template v-slot:[`item.is_flow_design`]="{ item }">
            <span v-if="item.is_flow_design == true" class="caption">
              <v-btn small text class="white--text ml-n3" color="green"
                >Yes</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="red">No</v-btn>
            </span>
          </template>
          <template v-slot:[`item.form_created_on`]="{ item }">
            <span class="caption">{{ fetch_value(item.form_created_on) }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click.stop="edit_form(item)" color="primaryColor">
              mdi-pencil</v-icon
            >
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-icon
                  small
                  @click.stop="activate_deactivate(item)"
                  color="primaryColor"
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>Delete Forms</span>
            </v-tooltip>
            <!-- <v-tooltip bottom>
              <template #activator="{ on }">
                <v-icon
                  small
                  @click.stop="activate_deactivate(item)"
                  color="primaryColor"
                >
                  mdi-timelapse</v-icon
                >

                <div class="ml-7 mt-n4" v-on="on">Deactivate Forms</div>
              </template>
            </v-tooltip> -->
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 3">
      <FormDeletion
        :deleteForm="deleteForm"
        :formInfo="formInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deleteForm = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditForms
        :editFormDialog="editFormDialog"
        :formInfo="formInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editFormDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import FormDeletion from "@/components/FormDesigner/FormDialogs/FormDeletion.vue";
import FormCreation from "@/components/FormDesigner/FormDialogs/FormCreation.vue";
import EditForms from "@/components/FormDesigner/FormDialogs/EditForms.vue";
import { list_forms_customs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    FormCreation,
    EditForms,
    SnackBar,
    FormDeletion,
  },
  data() {
    return {
      tableData: [],
      SnackBarComponent: {},
      tableLoading: false,
      height: 0,
      headers: [
        { text: "Form Name", value: "form_name", sortable: false },
        {
          text: "Form Description",
          value: "form_description",
          sortable: false,
        },
        {
          text: "Created On",
          value: "form_created_on",
          sortable: false,
        },

        { text: "Form Designed ", value: "is_form_designed", sortable: false },
        { text: "Flow Designed ", value: "is_flow_design", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      componentCheck: 0,
      formCreationDialog: false,
      editFormDialog: false,
      nextToken: null,
      formInfo: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      deleteForm: false,
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.fetch_forms();
  },
  methods: {
    handle_pagination() {
      if (this.nextToken) {
        this.fetch_forms();
      }
    },
    create_form() {
      this.componentCheck = 1;
      this.formCreationDialog = true;
    },

    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },

    activate_deactivate(value) {
      this.deleteForm = true;
      this.formInfo = value;
      this.componentCheck = 3;
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

    handleRowClick(value) {
      // console.log(value);
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormObj", value);
      this.$store.commit("Setpathinfo", "Admin");
      this.$store.commit("SetFormType", "CUSTOM");
      this.$store.commit("SetDirectoryForm", false);
       this.$store.commit("SetExternalForm", false);

      this.$router.push("/home/Forms");
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.formCreationDialog = false;
      this.editFormDialog = false;
      this.deleteForm = false;
      this.fetch_forms();
    },

    edit_form(value) {
      this.componentCheck = 2;
      this.editFormDialog = true;
      this.formInfo = value;
    },

    async fetch_forms() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_forms_customs, {
            input: {
              organization_id: data.organization.organization_id,
              // user_email_id: data.user.user_email_id,
              limit: 51,
              nextToken: this.nextToken,
            },
          })
        );

        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_forms_customs);
        // console.log(response);
        if (response.Status == "SUCCESS") {
          // this.tableData = response.data;
          this.nextToken = response.nextToken;
          let array = this.tableData.concat(response.data);

          this.tableData = array;

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.form_id === obj.form_id)
          );
          this.tableData = uniqueArrayOfObjects;
          // this.tableData.sort((a, b) =>
          //   a.form_name.localeCompare(b.form_name, undefined, {
          //     sensitivity: "base",
          //   })
          // );
        } else {
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },
  },
};
</script>
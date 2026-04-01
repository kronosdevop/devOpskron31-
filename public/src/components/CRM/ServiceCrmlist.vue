<template>
  <div>
    <v-card flat>
      <v-toolbar flat>
        <v-spacer />
        <v-btn
          dark
          @click="createservicedailog()"
          class="text-capitalize cardCss"
          >Create</v-btn
        >
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.product_created_on`]="{ item }">
            <span v-text="get_date(item.product_created_on)"></span>
          </template>
          <template v-slot:[`item.product_head`]="{ item }">
            <span>{{ item.admin_details.full_user_name }}</span>
          </template>
          <template v-slot:[`item.service_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.service_description" class="caption" v-on="on">
                  {{
                    item.service_description.length >= 50
                      ? item.service_description.substr(0, 50) + "..."
                      : item.service_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.service_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.Actions`]="{ item }">
            <v-icon small color="red" @click="delete_product(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateService
        :addservice="addservice"
        @clicked="addservice = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */

// import { list_service_details } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";
// import SnackBar from "@/components/SnackBar.vue";
import CreateService from "@/components/CRM/Popups/CreateService.vue";
export default {
  components: {
    CreateService,
    SnackBar,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      SnackBarComponent: {},
      tableLoading: false,
      addservice: false,
      componentCheck: 0,
      headers: [
        {
          text: "Name",
          value: "service_name",
          sortable: false,
        },
        {
          text: "Description",
          value: "service_description",
          sortable: false,
        },
        {
          text: "Created On",
          value: "service_created_on",
          sortable: false,
        },
        {
          text: "Created By",
          value: "service_created_by",
          sortable: false,
        },
        {
          text: "Head",
          value: "service_head",
          sortable: false,
        },
        {
          text: "Action",
          value: "Actions",
          sortable: false,
        },
      ],
    };
  },
  created() {
    this.height = window.innerHeight - 310;
    this.get_servicelist();
  },
  methods: {
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addservice = false;
      this.get_servicelist();
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
    createservicedailog() {
      this.componentCheck = 1;
      this.addservice = true;
    },
    async get_servicelist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_service_details, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_service_details);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;

          this.tableData = response.data;
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;

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

<style>
</style>
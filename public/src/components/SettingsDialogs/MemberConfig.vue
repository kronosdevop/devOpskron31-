<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-toolbar flat >
        <v-spacer />
        <v-btn dark @click="add_action()" class="text-capitalize cardCss"
          >Add</v-btn
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
          <template v-slot:[`item.membership_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div
                  v-if="item.membership_description"
                  class="caption"
                  v-on="on"
                >
                  {{
                    item.membership_description.length >= 30
                      ? item.membership_description.substr(0, 30) + "..."
                      : item.membership_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.membership_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              class="ml-1"
              color="red"
              @click="delete_membership(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddMemberconfig
        :addconfigMember="addconfigMember"
        @clicked="addconfigMember = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteMemberconfig
        :membershipDelete="membershipDelete"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="membershipDelete = false"
      />
    </div>
  </div>
</template>

<script>
import DeleteMemberconfig from "./DeleteMemberconfig.vue";
import { list_membership } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import AddMemberconfig from "./AddMemberconfig.vue";
export default {
  components: {
    SnackBar,
    AddMemberconfig,
    DeleteMemberconfig,
  },
  data() {
    return {
      height: 0,
      addconfigMember: false,
      membershipDelete: false,
      fixed: true,
      tableLoading: false,
      SnackBarComponent: {},
      componentCheck: 0,
      tableData: [],
      headers: [
        { text: "Name", value: "membership_name", sortable: false },
        {
          text: "Description",
          value: "membership_description",
          sortable: false,
        },
        { text: "Validity", value: "membership_validity", sortable: false },
        { text: "Created By", value: "membership_created_by", sortable: false },
        {
          text: "Action",
          value: "actions",
          sortable: false,
        },
      ],
      rowInfo: {},
    };
  },
  async created() {
    this.get_members();
    this.height = window.innerHeight - 330;
  },
  methods: {
    add_action() {
      this.componentCheck = 1;
      this.addconfigMember = true;
    },
    delete_membership(item) {
      this.componentCheck = 2;
      this.membershipDelete = true;
      this.rowInfo = item;
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
      this.membershipDelete = false;
      this.addconfigMember = false;
      this.get_members();
    },
    async get_members() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_membership, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
            },
          })
        );

        var response = JSON.parse(result.data.list_membership);

        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          this.tableLoading = false;
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
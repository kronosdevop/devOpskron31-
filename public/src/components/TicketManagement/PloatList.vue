<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-data-table
          :headers="ploatHeaders"
          :fixed-header="fixed"
          :items="ploatRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-2 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="red" small @click="open_deleteDailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeletePloat
        :ploatdeletion="ploatdeletion"
        @clicked="ploatdeletion = false"
        :ploatItem="ploatItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    <script>
import SnackBar from "@/components/SnackBar.vue";
import DeletePloat from "@/components/TicketManagement/AllDialogs/DeletePloat.vue";
import { ticket_manegement_plots } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    DeletePloat,
  },
  data() {
    return {
      SnackBarComponent: {},
      ploatdeletion: false,
      tableLoading: false,
      componentCheck: 0,
      ploatItem: {},
      ploatHeaders: [
        {
          text: "Name",
          value: "plot_name",
          sortable: false,
        },

        { text: "Actions", value: "actions", sortable: false },
      ],
      ploatRecords: [],
      fixed: false,
    };
  },
  computed: {},
  async created() {
    await this.fetch_subcategories();
  },
  methods: {
    open_deleteDailog(item) {
      this.ploatItem = item;
      this.componentCheck = 1;
      this.ploatdeletion = true;
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
      this.ploatdeletion = false;

      this.fetch_subcategories();
    },

    async fetch_subcategories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(ticket_manegement_plots, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.ticket_manegement_plots);
        this.ploatRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.ploatRecords = response.data;
          this.tableLoading = false;
        } else {
          this.ploatRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.ploatRecords = [];

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
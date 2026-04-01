<template>
  <v-card-text>
    <v-data-table
      :headers="territoryHeaders"
      :fixed-header="fixed"
      :items="tableData"
      :loading="tableLoading"
      :height="CommonVuetifyObj.height - 230"
      :footer-props="{
        itemsPerPageOptions: [10, 20],
      }"
      :items-per-page="20"
      class="modern-data-table dtwidth"
      hide-default-footer
    >
      <template v-slot:[`item.territory_name`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="primary" size="small">mdi-id-card</v-icon>
          <div class="ml-2">{{ item.territory_name }}</div>
        </div>
      </template>

      <template v-slot:[`item.territory_head_name`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="green" size="small">mdi-account</v-icon>
          <div class="ml-2">{{ item.territory_head_name }}</div>
        </div>
      </template>

      <template v-slot:[`item.territory_created_by`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="purple">mdi-email-outline</v-icon>
          <div class="ml-2">{{ item.territory_created_by }}</div>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon color="transparent" elevation="0">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn
                icon
                color="transparent"
                elevation="0"
                @click="edit_territory(item)"
              >
                <v-icon color="green">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click="open_deletedailog(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${tableData.length} of ${totalItems} territories`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === 1"
          variant="text"
          @click="currentPage = currentPage - 1"
          >Previous</v-btn
        >
        <div class="page-numbers">
          <v-btn
            v-for="page in visiblePages"
            :key="page"
            :class="page === currentPage ? 'active-page' : 'inactive-page'"
            :variant="page === currentPage ? 'elevated' : ''"
            @click="currentPage === page"
            >{{ page }}</v-btn
          >
        </div>
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === pageCount"
          variant="text"
          @click="currentPage === currentPage + 1"
          >Next</v-btn
        >
      </div>
    </div>
  </v-card-text>
  <SnackBar :SnackBarComponent="SnackBarComponent" />

  <div v-if="componentCheck == 1">
    <AddTerritory
      :createTerritoryDialog="createTerritoryDialog"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      @clicked="createTerritoryDialog = false"
    />
  </div>
  <div v-if="componentCheck == 2">
    <EditTerritory
      :editTerritoryDialogue="editTerritoryDialogue"
      :rowInfo="rowInfo"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      @clicked="editTerritoryDialogue = false"
    />
  </div>
  <div v-if="componentCheck == 3">
    <DeleteTerritory
      :deleteTerritoryDialogue="deleteTerritoryDialogue"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      :rowInfo="rowInfo"
      @clicked="deleteTerritoryDialogue = false"
    />
  </div>
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import AddTerritory from "@/components/SettingsDialogs/AddTerritory.vue";
import EditTerritory from "@/components/SettingsDialogs/EditTerritory.vue";
import DeleteTerritory from "@/components/SettingsDialogs/DeleteTerritory.vue";
import { create_list_edit_territories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    AddTerritory,
    SnackBar,
    EditTerritory,
    DeleteTerritory,
  },
  data() {
    return {
      territoryHeaders: [
        { title: "Name", value: "territory_name" },
        { title: "Head", value: "territory_head_name" },
        { title: "Created By", value: "territory_created_by" },
        { title: "Action", value: "actions" },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      height: 0,
      page: 1,
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 20,
      createTerritoryDialog: false,
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      editTerritoryDialogue: false,
      rowInfo: {},
      deleteTerritoryDialogue: false,
    };
  },
  created() {
    this.fetch_territories();
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  async mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  methods: {
    add_territory() {
      this.componentCheck = 1;
      this.createTerritoryDialog = true;
    },
    edit_territory(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.editTerritoryDialogue = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.deleteTerritoryDialogue = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createTerritoryDialog = false;
      this.editTerritoryDialogue = false;
      this.deleteTerritoryDialogue = false;
      this.fetch_territories();
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

    async fetch_territories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_territories, {
            input: {
              action_type: "LIST",
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.create_list_edit_territories);
        this.tableLoading = false;
        this.tableData = response.data;
        this.totalItems = this.tableData.length;
      } catch (error) {
        this.tableLoading = false;
        this.totalItems = 0;

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
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}
</style>

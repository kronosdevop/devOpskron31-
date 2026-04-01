<template>
  <v-card-text>
    <v-data-table
      :headers="visitHeaders"
      :fixed-header="fixed"
      :items="tableData"
      :loading="tableLoading"
      :height="CommonVuetifyObj.height - 230"
      :footer-props="{
        itemsPerPageOptions: [10, 20],
      }"
      :items-per-page="20"
      hide-default-footer
      class="modern-data-table dtwidth"
    >
      <template v-slot:[`item.visit_type_name`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="primary" size="small">mdi-id-card</v-icon>
          <div class="ml-2">{{ item.visit_type_name }}</div>
        </div>
      </template>

      <template v-slot:[`item.visit_type_frequency`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="green" size="small">mdi-sine-wave</v-icon>
          <div class="ml-2">{{ item.visit_type_frequency }}</div>
        </div>
      </template>

      <template v-slot:[`item.visit_type_representation`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="blue" size="small">mdi-clipboard-outline</v-icon>
          <div class="ml-2">{{ item.visit_type_representation }}</div>
        </div>
      </template>

      <template v-slot:[`item.scan_tolerance`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="red" size="small">mdi-pound</v-icon>
          <div class="ml-2">{{ item.scan_tolerance }}</div>
        </div>
      </template>

      <template v-slot:[`item.action`]>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon elevation="0" color="transparent">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click.stop="edit_visittype(item)"
              >
                <v-icon color="green">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click.stop="delet_vist(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click.stop="editform(item)"
              >
                <v-icon color="purple">mdi-file-multiple</v-icon>
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
            : `Showing ${tableData.length} of ${totalItems} visit types`
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

  <div v-if="componentCheck == 1">
    <CreateFormDialog
      :createFormDialogue="createFormDialogue"
      @clicked="createFormDialogue = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 2">
    <EditFormDialog
      :formedition="formedition"
      @clicked="clearstore()"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 3">
    <EditVisittype
      :editVisitDialogue="editVisitDialogue"
      @clicked="editVisitDialogue = false"
      :rowInfo="rowInfo"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 4">
    <DeletevisitType
      :deletevisitDialoge="deletevisitDialoge"
      @clicked="deletevisitDialoge = false"
      :rowInfo="rowInfo"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
  </div>
  <SnackBar :SnackBarComponent="SnackBarComponent" />
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import SnackBar from "@/components/SnackBar.vue";
import DeletevisitType from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/DeletevisitType.vue";
import { list_visittypes } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateFormDialog from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/CreateFormDialog.vue";
import EditFormDialog from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/EditFormDialog.vue";
import EditVisittype from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/EditVisittype.vue";
export default {
  components: {
    CreateFormDialog,
    EditFormDialog,
    EditVisittype,
    DeletevisitType,
    SnackBar,
  },
  data() {
    return {
      visitHeaders: [
        { title: "Name", value: "visit_type_name", sortable: false },
        {
          title: "Frequency",
          value: "visit_type_frequency",
          sortable: false,
        },
        {
          title: "Visit Type",
          value: "visit_type_representation",
          sortable: false,
        },
        { title: "Scan Tolerance", value: "scan_tolerance", sortable: false },
        { title: "Action", value: "action", sortable: false },
      ],
      visitType: "",
      fixed: true,
      tableLoading: false,
      editVisitDialogue: false,
      formedition: false,
      tableData: [],
      componentCheck: 0,
      page: 1,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      createFormDialogue: false,
      deletevisitDialoge: false,
      rowInfo: {},
      SnackBarComponent: {},
      CommonVuetifyObj: {},
    };
  },
  created() {
    this.$store.commit("SetVisitorFormEdit", false);
    this.$store.commit("Setvisitdetails", {});
    this.$store.commit("SetdragCheck", true);
    this.fetch_visitor();
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
    clearstore() {
      this.formedition = false;
      this.$store.commit("SetVisitorFormEdit", false);
    },
    create_form() {
      this.componentCheck = 1;
      this.createFormDialogue = true;
      this.$store.commit("SetVisitorFormEnabled", true);
      this.$store.commit("SetFormName", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormObj", {});
      this.$store.commit("SetEditFormDetails", {});
      this.$store.commit("SetFormType", "CUSTOM");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetCustomFormDesign", false);
    },
    editform(item) {
      this.$store.commit("Setvisitdetails", item);
      this.componentCheck = 2;
      this.formedition = true;
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", true);
      this.$store.commit("SetFormName", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormObj", {});
      this.$store.commit("SetEditFormDetails", {});
      this.$store.commit("SetFormType", "CUSTOM");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetCustomFormDesign", false);
    },
    edit_visittype(item) {
      this.rowInfo = item;
      this.componentCheck = 3;
      this.editVisitDialogue = true;
    },
    delet_vist(item) {
      this.componentCheck = 4;
      this.deletevisitDialoge = true;
      this.rowInfo = item;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deletevisitDialoge = false;
      this.createFormDialogue = false;
      this.editVisitDialogue = false;
      this.formedition = false;
      this.fetch_visitor();
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

    async fetch_visitor() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(graphqlOperation(list_visittypes, {}));
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_visittypes);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.Data;
          this.totalItems = this.tableData.length;
        } else {
          this.tableLoading = false;
          this.tableData = [];
          this.totalItems = 0;
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

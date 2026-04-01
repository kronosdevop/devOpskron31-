<template>
  <SnackBar :SnackBarComponent="SnackBarComponent" />
  <v-card-text>
    <v-data-table
      :headers="headers"
      :height="CommonVuetifyObj.height - 220"
      :fixed-header="fixed"
      :items="tableData"
      :loading="tableLoading"
      :footer-props="{
        itemsPerPageOptions: [10, 20],
      }"
      :items-per-page="20"
      dense
      class="modern-data-table dtwidth"
      hide-default-footer
    >
      <template v-slot:[`item.user_email_id`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="primary" size="small">mdi-account</v-icon>
          <div class="ml-2">{{ fetch_user_name(item.user_email_id) }}</div>
        </div>
      </template>

      <template v-slot:[`item.visit_type_names`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="green" size="small">mdi-id-card</v-icon>
          <div class="ml-2">
            {{
              item.visit_type_names && item.visit_type_names.length > 0
                ? item.visit_type_names[0]
                : "-"
            }}
          </div>
        </div>
      </template>

      <template v-slot:[`item.actions`]>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon elevation="0">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click="edit_visitorrep(item)"
                ><v-icon color="green">mdi-pencil</v-icon></v-btn
              >
            </v-list-item>
            <v-list-item>
              <v-btn
                color="transparent"
                icon
                elevation="0"
                @click="delete_visitorrep(item)"
                ><v-icon color="red">mdi-delete</v-icon></v-btn
              >
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
            : `Showing ${tableData.length} of ${totalItems} visitor reps`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === 1"
          variant="text"
          size="small"
          @click="currentPage = currentPage - 1"
          >Previous</v-btn
        >
        <div class="page-numbers">
          <v-btn
            v-for="page in visiblePages"
            :key="page"
            :class="page === currentPage ? 'active-page' : 'inactive-page'"
            :variant="page === currentPage ? 'elevated' : ''"
            size="small"
            >{{ page }}</v-btn
          >
        </div>
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === pageCount"
          variant="text"
          size="small"
          @click="currentPage = currentPage + 1"
          >Next</v-btn
        >
      </div>
    </div>
  </v-card-text>

  <div v-if="componentCheck == 1">
    <EditVistorrep
      :vistrepedition="vistrepedition"
      @clicked="vistrepedition = false"
      v-on:errorMsg="error_info"
      :rowInfo="rowInfo"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 2">
    <DeleteVistrep
      :vistrepdeletion="vistrepdeletion"
      @clicked="vistrepdeletion = false"
      v-on:errorMsg="error_info"
      :rowInfo="rowInfo"
      v-on:successMsg="success_info"
    />
  </div>
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import EditVistorrep from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/EditVistorrep.vue";
import DeleteVistrep from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/DeleteVistrep.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
import { list_all_visit_reps } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: { SnackBar, DeleteVistrep, EditVistorrep },
  mixins: [get_all_org_users],
  data() {
    return {
      headers: [
        { title: "User", value: "user_email_id" },
        { title: "Visit Types", value: "visit_type_names" },
        { title: "Actions", value: "actions" },
      ],
      tableData: [],
      allUSersNames: [],
      tableLoading: false,
      fixed: true,
      componentCheck: 0,
      itemsPerPage: 10,
      currentPage: 1,
      page: 1,
      vistrepdeletion: false,
      vistrepedition: false,
      visitTypeDialog: false,
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      rowInfo: {},
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
    await this.get_all_org_users();
    await this.fetch_userrep();

    this.allUSersNames = this.orgUsers;
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
      this.vistrepdeletion = false;
      this.vistrepedition = false;
      this.tableData = [];
      this.fetch_userrep();
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
    edit_visitorrep(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.vistrepedition = true;
    },
    delete_visitorrep(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.vistrepdeletion = true;
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    async fetch_userrep() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_visit_reps, {})
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_all_visit_reps);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
          this.totalItems = this.tableData.length;
        } else {
          this.tableLoading = false;
          this.tableData = [];
          this.totalItems = [];
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

<template>
  <div>
    <!-- Create Shift Button + Filter -->
    <v-toolbar class="bg-white">
      <v-select
        v-model="status"
        :items="statusItems"
        variant="outlined"
        label="Filter By WorkShift Status"
        density="compact"
        style="max-width: 200px"
        class="mt-7 mx-5"
      />

      <v-spacer />

      <v-btn
        size="small"
        class="cardCss text-capitalize mr-6"
        prepend-icon="mdi-plus"
        @click="Create_shifts()"
      >
        Create Shift
      </v-btn>
    </v-toolbar>

    <!-- SHIFT TABLE -->
    <v-card flat class="overflow-y-auto mt-10">
      <v-card-text class="pa-4">
        <v-data-table
          :headers="shiftHeaders"
          :items="paginatedShifts"
          :loading="tableLoading"
          class="modern-data-table"
          density="compact"
          hover
          hide-default-footer
          :fixed-header="true"
          :height="windowHeight"
        >
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-timetable
              </v-icon>
              <div class="text-h6 text-grey mb-2">No Workshifts Found</div>
            </div>
          </template>

          <!-- SHIFT NAME -->
          <template v-slot:[`item.shift_name`]="{ item }">
            <b>{{ item.work_shift_timings_name }}</b>
          </template>

          <!-- START TIME -->
          <template v-slot:[`item.start_time`]="{ item }">
            {{ item.work_shift_start_timings }}
          </template>

          <!-- END TIME -->
          <template v-slot:[`item.end_time`]="{ item }">
            {{ item.work_shift_end_timings }}
          </template>

          <!-- WEEK OFFS -->
          <template v-slot:[`item.week_off`]="{ item }">
            <div>
              <v-chip
                v-for="(day, index) in item.week_off"
                :key="index"
                size="small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ day }}
              </v-chip>
            </div>
          </template>

          <!-- ACTIONS -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="icon"
              color="green"
              size="small"
              @click="edit_workshift(item)"
            >
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>

            <v-btn
              icon
              variant="icon"
              color="red"
              size="small"
              @click="delete_workshifts(item)"
            >
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!-- FOOTER -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${paginatedShifts.length} of ${totalItems} shifts`
            }}
          </div>

          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage--"
            >
              Previous
            </v-btn>

            <div class="page-numbers">
              <v-btn
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'elevated' : 'text'"
                size="small"
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                @click="currentPage = page"
              >
                {{ page }}
              </v-btn>
            </div>

            <v-btn
              :disabled="currentPage === pageCount"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage++"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- POPUPS -->
    <CreateShifts
      :createShiftDialog="createShiftDialog"
      @clicked="createShiftDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <EditShifts
      :editShiftDialog="editShiftDialog"
      :workshiftData="workshiftData"
      @clicked="editShiftDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <DeleteShifts
      :workshiftDeletion="workshiftDeletion"
      :workshiftData="workshiftData"
      @clicked="workshiftDeletion = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { create_list_edit_delete_work_shift_timings } from "@/graphql/mutations.js";

import CreateShifts from "../PopUps/CreateShifts.vue";
import EditShifts from "../PopUps/EditShifts.vue";
import DeleteShifts from "../PopUps/DeleteShifts.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: { CreateShifts, EditShifts, DeleteShifts, SnackBar },

  data() {
    return {
      status: "ACTIVE",
      statusItems: [
        { title: "Active", value: "ACTIVE" },
        { title: "Deactive", value: "DEACTIVE" },
      ],

      shiftHeaders: [
        { title: "Shift Name", value: "shift_name", align: "start" },
        { title: "Start Time", value: "start_time" },
        { title: "End Time", value: "end_time" },
        { title: "Week-Offs", value: "week_off" },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],

      tableData: [],
      tableLoading: false,

      // Pagination Handling
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,

      // Popups
      createShiftDialog: false,
      editShiftDialog: false,
      workshiftDeletion: false,
      workshiftData: {},

      SnackBarComponent: {},

      windowHeight: window.innerHeight - 250,
    };
  },

  created() {
    this.get_shift_data();
  },

  computed: {
    paginatedShifts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      for (let i = 1; i <= this.pageCount; i++) pages.push(i);
      return pages;
    },
  },

  watch: {
    tableData() {
      this.totalItems = this.tableData.length;
    },
  },

  methods: {
    Create_shifts() {
      this.createShiftDialog = true;
    },

    edit_workshift(item) {
      this.editShiftDialog = true;
      this.workshiftData = item;
    },

    delete_workshifts(item) {
      this.workshiftDeletion = true;
      this.workshiftData = item;
    },

    success_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };

      this.createShiftDialog = false;
      this.editShiftDialog = false;
      this.workshiftDeletion = false;

      this.get_shift_data();
    },

    error_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
    },

    async get_shift_data() {
      this.tableLoading = true;

      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_work_shift_timings, {
            input: { action_type: "LIST" },
          })
        );

        const response = JSON.parse(
          result.data.create_list_edit_delete_work_shift_timings
        );

        this.tableData = response.data || [];
        this.tableLoading = false;
      } catch (error) {
        this.tableLoading = false;

        const msg =
          error?.errors?.[0]?.message ||
          error?.message ||
          "Unable to load shift data";

        this.error_info(msg);
      }
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f7f8fa;
  color: #333;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 16px;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
}

/* FOOTER STYLING */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-top: 1px solid #eee;
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-btn {
  color: #666 !important;
}

.page-numbers .v-btn {
  margin: 0 4px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #666 !important;
}
</style>

<template>
  <v-card-text>
    <CreateTicketDialog
      :DialogCreateTicket="DialogCreateTicket"
      :org-details="orgDetails"
      @clicked="DialogCreateTicketEmit"
    />
    <CreatedTicketDetailsDialog
      :DialogCreatedTicketDetails="DialogCreatedTicketDetails"
      :StoreObj="CreatedTicketDetailsObj"
      @clicked="DialogCreatedTicketDetailsEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!--Dashboard and Create Button-->
    <v-row>
      <!--Dashboard Card-->
      <v-card
        rounded="lg"
        height="45"
        class="mt-2 ml-3 mb-3"
        width="1200px"
        flat
      >
        <v-row no-gutters class="flex-wrap">
          <v-col
            v-for="(item, index) in CreatedTickets"
            :key="index"
            cols="auto"
            style="min-width: -6px"
          >
            <v-card-title
              v-bind="props"
              class="dashboard-text"
              :class="{ 'dashboard-active': isActiveStatus(item.title) }"
              :style="{ color: getStatusColor(item.title) }"
              @click="filterByStatus(item.title)"
              >{{ item.title }} ({{ item.description }})
            </v-card-title>
          </v-col>
        </v-row>
      </v-card>
      <v-spacer></v-spacer>
    </v-row>

    <!--Data Table-->
    <v-data-table
      :headers="TableHeaders"
      :height="CommonVuetifyObj.height - 290"
      :items="paginatedItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      @click:row="OpenDialogCreatedTicketDetails"
      class="modern-data-table mt-2"
      fixed-header="true"
      hide-default-footer
    >
      <!--No data Text-->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-ticket</v-icon
          >
          <div class="text-h6 text-grey mb-2">No tickets to list!</div>
          <div class="text-body-2 text-grey">Create one to get started.</div>
        </div>
      </template>

      <!--Created On Date-->
      <template #[`item.created_at`]="{ item }">
        <div>{{ ConvertDate(item.created_at) }}</div>
      </template>

      <!--Ticket Status-->
      <template #[`item.status`]="{ item }">
        <v-chip
          rounded="xl"
          size="small"
          :color="
            item.status === 'OPEN'
              ? 'blue'
              : item.status === 'ONHOLD'
              ? 'orange'
              : item.status === 'IN_PROGRESS'
              ? 'pink'
              : item.status === 'RESOLVED'
              ? '#607D8B'
              : item.status === 'CLOSED'
              ? 'green'
              : item.status === 'REOPEN'
              ? '#311B92'
              : 'grey-darken-2'
          "
          >{{
            item.status === "OPEN"
              ? "Open"
              : item.status === "ONHOLD"
              ? "On Hold"
              : item.status === "IN_PROGRESS"
              ? "In Progress"
              : item.status === "RESOLVED"
              ? "Resolved"
              : item.status === "CLOSED"
              ? "Closed"
              : item.status === "REOPEN"
              ? "Re-Opened"
              : "Cancelled"
          }}</v-chip
        >
      </template>

      <!--Assigned To-->
      <template #[`item.assigned_to_name`]="{ item }">
        <div>
          {{
            item.assigned_to_name === "Unassigned Pool"
              ? "Unassigned"
              : item.assigned_to_name
          }}
        </div>
      </template>

      <!--Due Date-->
      <template #[`item.due_date`]="{ item }">
        <div>{{ ConvertDate(item.due_date) }}</div>
      </template>
    </v-data-table>

    <!--Pagination-->
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${paginatedItems.length} of ${totalItems} created tickets`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          :disabled="currentPage === 1"
          variant="text"
          size="small"
          class="pagination-btn"
          @click="currentPage = currentPage - 1"
          style="color: #666 !important"
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
            :style="
              page === currentPage
                ? 'background: #DB4C77 !important; color: white !important;'
                : 'color: #666 !important;'
            "
          >
            {{ page }}
          </v-btn>
        </div>
        <v-btn
          :disabled="currentPage === pageCount"
          variant="text"
          size="small"
          class="pagination-btn"
          @click="currentPage = currentPage + 1"
          style="color: #666 !important"
        >
          Next
        </v-btn>
      </div>
    </div>
  </v-card-text>
</template>

<script>
import CreateTicketDialog from "./CreateTicketDialog.vue";
import CreatedTicketDetailsDialog from "./CreatedTicketDetailsDialog.vue";
import SnackBar from "../SnackBar.vue";

import { useDisplay } from "vuetify";
import { GetAllListCreatedTickets } from "@/mixins/GetAllListCreatedTickets";

export default {
  props: {
    StoreObj: Object,
    filterStatus: String,
    search: String,
    fromDate: Date,
    toDate: Date,
  },

  components: {
    CreateTicketDialog,
    CreatedTicketDetailsDialog,
    SnackBar,
  },

  mixins: [GetAllListCreatedTickets],

  data: () => ({
    localFilterStatus: "ALL",

    height: 0,
    currentPage: 1,
    itemsPerPage: 15,

    DialogCreateTicket: false,
    DialogCreatedTicketDetails: false,
    loading: false,

    EditTicketObj: {},
    EditCreatedTicketObj: {},
    EditAssignedTicketObj: {},
    DeleteCreatedTicketObj: {},
    CreatedTicketDetailsObj: {},
    ClaimStatusObj: {},
    CloseReopenTicketObj: {},
    CommonVuetifyObj: {},
    SnackBarComponent: {},
    orgDetails: {
      bucket_name: "stichh-medias",
      region: "us-east-1",
    },

    ListAllCratedTickets: [],
    TableHeaders: [
      { title: "ID", value: "ticket_id" },
      { title: "Initiated By", value: "reporter_name" },
      { title: "Initiated On", value: "created_at" },
      { title: "Title", value: "title" },
      { title: "Category", value: "category_name" },
      { title: "Assigned To", value: "assigned_to_name" },
      { title: "Due Date", value: "due_date" },
      { title: "Ticket Status", value: "status" },
    ],
  }),

  watch: {
    search(newVal) {
      if (newVal !== undefined) {
        this.currentPage = 1;
      }
    },
    filterStatus(newVal) {
      this.localFilterStatus = newVal;
      this.currentPage = 1;
    },
  },
  
  computed: {
    currentUserEmail() {
      return this.$store.getters.GetUserEmail || "";
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
    CreatedTickets() {
      const items = this.ListAllCratedTickets || [];

      const all = items.length;
      const completed = items.filter(
        (item) => item.status === "RESOLVED"
      ).length;
      const inProgress = items.filter(
        (item) => item.status === "IN_PROGRESS"
      ).length;
      const open = items.filter((item) => item.status === "OPEN").length;
      const onHold = items.filter((item) => item.status === "ONHOLD").length;
      const closed = items.filter((item) => item.status === "CLOSED").length;
      const reopened = items.filter((item) => item.status === "REOPEN").length;
      const claimed = items.filter(
        (item) => item.claim_status === "CLAIMED"
      ).length;
      const unclaimed = items.filter(
        (item) => item.claim_status === "UNCLAIMED"
      ).length;
      return [
        { title: "All", description: all },
        { title: "Claimed", description: claimed },
        { title: "Unclaimed", description: unclaimed },
        { title: "Open", description: open },
        { title: "In Progress", description: inProgress },
        { title: "On Hold", description: onHold },
        { title: "Resolved", description: completed },
        { title: "Closed", description: closed },
        { title: "Reopened", description: reopened },
      ];
    },
    filteredItems() {
      let items = this.ListAllCratedTickets || [];
      items.sort((a, b) => b.created_at - a.created_at);

      let fromTS = null;
      let toTS = null;

      if (this.fromDate) {
        const f = new Date(this.fromDate);
        f.setHours(0, 0, 0, 0);
        fromTS = f.getTime() / 1000;
      }

      if (this.toDate) {
        const t = new Date(this.toDate);
        t.setHours(23, 59, 59, 999);
        toTS = t.getTime() / 1000;
      }

      items = items.filter((item) => {
        const created = Number(item.created_at);

        if (fromTS && created < fromTS) return false;
        if (toTS && created > toTS) return false;
        return true;
      });

      if (this.localFilterStatus !== "ALL") {
        if (this.localFilterStatus === "CLAIMED") {
          items = items.filter((item) => item.claim_status === "CLAIMED");
        } else if (this.localFilterStatus === "UNCLAIMED") {
          items = items.filter((item) => item.claim_status === "UNCLAIMED");
        } else {
          items = items.filter(
            (item) => item.status === this.localFilterStatus
          );
        }
      }
      if (this.search && this.search.trim()) {
        const s = this.search.toLowerCase();
        items = items.filter((item) => {
          return (
            (item.title || "").toLowerCase().includes(s) ||
            (item.reporter_name || "").toLowerCase().includes(s) ||
            (item.category_name || "").toLowerCase().includes(s) ||
            (item.assigned_to_name || "").toLowerCase().includes(s) ||
            item.ticket_id.toString().includes(this.search.trim())
          );
        });
      }

      return items;
    },
    totalItems() {
      return this.filteredItems.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
  },

  async mounted() {
    this.CommonVuetifyObj = useDisplay();
    await this.GetAllListCreatedTicketsMethod();
    this.ListAllCratedTickets.sort((a, b) => b.created_at - a.created_at);
    this.$emit("update-ticket-count", this.ListAllCratedTickets.length);
    this.currentPage = 1;
  },

  methods: {
    async DialogCreateTicketEmit(Toggle) {
      this.DialogCreateTicket = false;
      if (Toggle === 2) {
        await this.GetAllListCreatedTicketsMethod();
        this.$emit("update-ticket-count", this.ListAllCratedTickets.length);
      }
    },
    async CreateTicket() {
      await this.GetAllListCreatedTicketsMethod();
      this.currentPage = 1;
    },
    applyDateFilter() {
      this.currentPage = 1;
    },
    ConvertDate(due_date) {
      if (!due_date) return "TBD";
      if (isNaN(due_date)) return "Invalid Date";
      const date = new Date(due_date * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ConvertCreatedDate(created_at) {
      if (!created_at) return "TBD";
      if (isNaN(created_at)) return "Invalid Date";
      const date = new Date(created_at * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    OpenDialogCreatedTicketDetails(event, rowItem) {
      this.CreatedTicketDetailsObj = rowItem.item;
      this.DialogCreatedTicketDetails = true;
    },
    DialogCreatedTicketDetailsEmit(Toggle) {
      this.DialogCreatedTicketDetails = false;
      this.$emit("refresh-data", Toggle);
    },
    filterByStatus(title) {
      const mapper = {
        Open: "OPEN",
        Claimed: "CLAIMED",
        Unclaimed: "UNCLAIMED",
        "In Progress": "IN_PROGRESS",
        "On Hold": "ONHOLD",
        Resolved: "RESOLVED",
        Closed: "CLOSED",
        Reopened: "REOPEN",
      };
      const status = mapper[title] || "ALL";
      this.currentPage = 1;
      this.localFilterStatus = status;
      this.$emit("update:filterStatus", status);
    },
    getStatusColor(status) {
      switch (status) {
        case "All":
          return "#2196F3";
        case "Claimed":
          return "green";
        case "Unclaimed":
          return "#FF5722";
        case "Open":
          return "blue";
        case "In Progress":
          return "fuchsia";
        case "Resolved":
          return "#607D8B";
        case "On Hold":
          return "orange";
        case "Closed":
          return "green";
        case "Reopened":
          return "#311B92";
        default:
          return "black";
      }
    },
    isActiveStatus(title) {
      const mapper = {
        Open: "OPEN",
        Claimed: "CLAIMED",
        Unclaimed: "UNCLAIMED",
        "In Progress": "IN_PROGRESS",
        "On Hold": "ONHOLD",
        Resolved: "RESOLVED",
        Closed: "CLOSED",
        Reopened: "REOPEN",
      };
      const status = mapper[title] || "ALL";
      return this.localFilterStatus === status;
    },
  },
};
</script>

<style scoped>
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.gradient-border-card {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
.card-container {
  position: relative;
}
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.modern-data-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-3px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.dashboard-text {
  font-size: 14px !important;
  position: relative;
  padding-bottom: 6px;
  cursor: pointer;
}
.dashboard-text:hover {
  transform: translateY(-6px) !important;
}
.dashboard-text::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background-color: currentColor;
  bottom: -2px;
  border-radius: 3px;
  transform: scaleX(0);
  transition: transform 0.25s ease;
}
.dashboard-active {
  font-weight: 800 !important;
}
.dashboard-active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background-color: currentColor;
  bottom: -2px;
  border-radius: 3px;
}
.dashboard-active::after {
  transform: scaleX(1);
}
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  .pagination-controls {
    justify-content: center;
  }
}
</style>

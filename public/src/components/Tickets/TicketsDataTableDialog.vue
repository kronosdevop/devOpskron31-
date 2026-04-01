<template>
  <div>
    <v-dialog :model-value="DialogTicketsDataTable" max-width="800px">
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Ticket Data</span>
          <v-btn
            icon
            variant="text"
            @click="DialogTicketsDataTableEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table
          :headers="TableHeaders"
          :items="TableItems"
          :height="CommonVuetifyObj.height - 400"
          :page="page"
          :items-per-page="20"
          hide-default-footer
        >
          <template #[`item.created_at`]="{ item }">
            <div>{{ ConvertDate(item.created_at * 1000) }}</div>
          </template>
        </v-data-table>
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="1"
          density="compact"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { GetAllListReportsData } from "@/mixins/GetAllListReportsData";
import { useDisplay } from "vuetify/lib/framework.mjs";

export default {
  props: { DialogTicketsDataTable: Boolean, TableItems: Array },

  mixins: [GetAllListReportsData],

  data: () => ({
    height: 0,

    page: 1,
    itemsPerPage: 20,

    CommonVuetifyObj: {},

    TableHeaders: [
      { title: "ID", value: "ticket_id", width: "25%" },
      { title: "Title", value: "title", width: "30%" },
      { title: "Category", value: "category", width: "30%" },
      { title: "Created On", value: "created_at", width: "15%" },
    ],
  }),

  watch: {
    DialogTicketsDataTable(val) {
      if (val) {
        this.fetchReportsData();
      }
    },
  },

  computed: {
    pageCount() {
      return Math.ceil(this.TableItems.length / this.itemsPerPage);
    },
  },

  async mounted() {
    this.CommonVuetifyObj = useDisplay();
  },

  methods: {
    DialogTicketsDataTableEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async fetchReportsData() {
      await this.GetAllListReportsDataMethod();
    },
    ConvertDate(created_at) {
      const date = new Date(created_at);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
  },
};
</script>
